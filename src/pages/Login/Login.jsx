import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, ArrowRight, Phone, ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '../../API_ENDPOINTS';

export default function LoginPage() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [showOtpField, setShowOtpField] = useState(false);
    const [timer, setTimer] = useState(30);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [otpId, setOtpId] = useState(null);
    const [userName, setUserName] = useState('');
    const [userData, setUserData] = useState(null);
    const [currentStep, setCurrentStep] = useState('phoneInput');
    const navigate = useNavigate();

    // Handle timer for OTP resend
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                handleUserRedirection(user);
            } catch (err) {
                console.error("Failed to parse user from localStorage", err);
            }
        }
    }, []);
    
    useEffect(() => {
        let interval;
        if (isTimerRunning && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsTimerRunning(false);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timer]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            // Call the send OTP API with your specific endpoint
            const response = await fetch(API_ENDPOINTS.SEND_OTP, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mobile_number: phoneNumber }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || "Failed to send OTP");
            }
            
            // Store the OTP ID for verification later
            setOtpId(data.otp_id);
            setCurrentStep('otpVerification');
            setShowOtpField(true);
            setTimer(30);
            setIsTimerRunning(true);
            // Reset OTP if resending
            setOtp(['', '', '', '']);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        // Take only the last character if multiple are pasted
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto-focus next input if current field is filled
        if (value && index < 3) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Handle backspace to move to previous input
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').trim();

        // Check if pasted content is numeric
        if (/^\d+$/.test(pastedData)) {
            const digits = pastedData.split('').slice(0, 4);
            const newOtp = [...otp];

            digits.forEach((digit, index) => {
                if (index < 4) {
                    newOtp[index] = digit;
                }
            });

            setOtp(newOtp);

            // Focus on the appropriate field after paste
            if (digits.length < 4) {
                inputRefs[digits.length].current.focus();
            }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        
        if (otpString.length !== 4) {
            setError('Please enter the complete 4-digit OTP');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            // Call the verify OTP API with your specific endpoint
            const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    otp_id: otpId,
                    otp: otpString
                }),
            });
            
            const userDataResponse = await response.json();
            
            if (!response.ok) {
                throw new Error(userDataResponse.message || "Invalid OTP");
            }
            
            // Store user data
            setUserData(userDataResponse);
            
            // Store user data in local storage
            localStorage.setItem("user", JSON.stringify(userDataResponse));
            
            // Check if user is a guest (needs to enter name)
            if (userDataResponse.full_name === "Guest") {
                setCurrentStep('enterName');
            } else {
                setCurrentStep('success');
                // Handle redirection based on user role
                handleUserRedirection(userDataResponse);
            }
        } catch (err) {
            setError(err.message || "Failed to verify OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleNameSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // Call the update name API with your specific endpoint
            const response = await fetch(API_ENDPOINTS.UPDATE_NAME, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userData?.token || ''}` // Include token if your API requires it
                },
                body: JSON.stringify({
                    user_id: userData?.id,
                    full_name: userName
                }),
            });
            
            const updatedUserData = await response.json();
            
            if (!response.ok) {
                throw new Error(updatedUserData.message || "Failed to update name");
            }
            
            // Create a copy of the current user data and update the name
            const newUserData = {
                ...userData,
                full_name: userName
            };
            
            // Update state with the new user data
            setUserData(newUserData);
            
            // Update user data in local storage
            localStorage.setItem("user", JSON.stringify(newUserData));
            
            setCurrentStep('success');
            // Handle redirection based on user role
            handleUserRedirection(newUserData);
        } catch (err) {
            setError(err.message || "Failed to update name. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Call the send OTP API again
            const response = await fetch(API_ENDPOINTS.SEND_OTP, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ mobile_number: phoneNumber }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || "Failed to resend OTP");
            }
            
            // Store the new OTP ID
            setOtpId(data.otp_id);
            setOtp(['', '', '', '']);
            setTimer(30);
            setIsTimerRunning(true);
        } catch (err) {
            setError(err.message || "Failed to resend OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleUserRedirection = (user) => {
        setTimeout(() => {
            if (user.user_type === 'admin') {
                navigate('/admin', { replace: true });
            } else if (user.user_type === 'employee') {
                navigate('/employee', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }, 1500);
    };
    

    const handleChangeNumber = () => {
        setCurrentStep('phoneInput');
        setShowOtpField(false);
        setOtp(['', '', '', '']);
        setError('');
    };

    return (
        <div className="font-monda flex h-screen w-full overflow-hidden">
            {/* Left side - Creative Car Image Background with elements */}
            <div className="hidden md:block md:w-1/2 relative">
                {/* Base background with overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-black/60 z-20" />
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('/Images/car.avif')`,
                        filter: 'saturate(0.8) brightness(0.7)'
                    }}
                />

                {/* Creative overlay elements */}
                <div className="absolute inset-0 z-30">
                   
                    {/* Branding elements */}
                    <div className="absolute top-8 left-8 text-white">
                        <img
                            src="src/assets/carzy1.png"
                            alt="CarZy Logo"
                            className="h-11"
                        />
                    </div>

                    {/* Tagline */}
                    <div className="absolute bottom-16 left-0 right-0 text-center text-white">
                        <h2 className="text-2xl font-light tracking-wide">Rent. Ride. Repeat!</h2>
                        <div className="h-1 w-24 bg-gray-400 mx-auto mt-2"></div>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    {/* Phone Input Step */}
                    {currentStep === 'phoneInput' && (
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-800">Login</h2>
                                <p className="text-gray-500 mt-2">Enter your phone number to continue</p>
                            </div>

                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none text-gray-700 font-medium">
                                            +91
                                        </div>
                                        <input
                                            id="phone"
                                            type="tel"
                                            placeholder="9876543210"
                                            className="pl-24 w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50 shadow-sm text-lg"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            maxLength={10}
                                            pattern="[0-9]{10}"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !phoneNumber || phoneNumber.length !== 10}
                                    className="w-full bg-black text-white py-4 px-4 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 transition-colors duration-300 shadow-md font-medium text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    <span>{loading ? "Sending..." : "Continue"}</span>
                                    {!loading && <ArrowRight size={20} />}
                                </button>
                            </form>

        
                        </>
                    )}

                    {/* OTP Verification Step */}
                    {currentStep === 'otpVerification' && (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Verify Your Number</h2>
                                <p className="text-gray-500 mt-2">We've sent a 4-digit code to</p>
                                <p className="text-gray-800 font-medium mt-1">+91 {phoneNumber}</p>
                            </div>

                            <form onSubmit={handleVerifyOtp} className="space-y-8">
                                {/* OTP inputs */}
                                <div className="flex justify-center gap-3">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={inputRefs[index]}
                                            id={`otp-input-${index}`}
                                            type="text"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            onPaste={index === 0 ? handlePaste : null}
                                            className="w-12 h-14 text-center text-xl font-bold border-0 rounded-full bg-gray-100 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-black shadow-sm transition-all"
                                            required
                                            disabled={loading}
                                        />
                                    ))}
                                </div>

                                {/* Timer and Resend */}
                                <div className="flex justify-between text-sm">
                                    <button
                                        type="button"
                                        onClick={handleChangeNumber}
                                        className="text-gray-700 font-medium flex items-center space-x-1 hover:text-black"
                                        disabled={loading}
                                    >
                                        <ArrowLeft size={16} />
                                        <span>Change Number</span>
                                    </button>
                                    
                                    {isTimerRunning ? (
                                        <p className="text-gray-500">
                                            Resend code in <span className="font-medium">{timer}s</span>
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={loading}
                                            className="text-gray-700 font-medium hover:text-black disabled:text-gray-400"
                                        >
                                            Resend Code
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.some(val => val === "")}
                                    className="w-full bg-black text-white py-4 px-4 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 transition-colors duration-300 shadow-md font-medium text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Verifying..." : "Verify & Proceed"}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Enter Name Step */}
                    {currentStep === 'enterName' && (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Welcome to CarZy</h2>
                                <p className="text-gray-500 mt-2">Please enter your name to continue</p>
                            </div>

                            <form onSubmit={handleNameSubmit} className="space-y-6">
                                <div>
                                    <input
                                        id="name"
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="Your full name"
                                        className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50 shadow-sm text-lg"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !userName.trim()}
                                    className="w-full bg-black text-white py-4 px-4 rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 transition-colors duration-300 shadow-md font-medium text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Saving..." : "Continue"}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Success Step */}
                    {currentStep === 'success' && (
                        <div className="text-center space-y-4 py-6">
                            <div className="flex justify-center">
                                <CheckCircle size={64} className="text-gray-800" />
                            </div>
                            <h2 className="text-2xl font-bold">Verification Successful</h2>
                            <p className="text-gray-600">
                                You have been successfully logged in. Redirecting...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}