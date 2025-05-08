import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Calendar, Car, Fuel, Award, ArrowLeft, MapPin, Wrench, FileCheck, Shield, User, Settings, Check, X } from "lucide-react";
import { API_ENDPOINTS } from "../../API_ENDPOINTS";
import CarImageSection from "./CarImageSection";
import CarNameSection from "./CarNameSection";
import TabSection from "./TabSection";
import Navbar from "../../components/NavBar";

const CarVerificationDetailsPage = () => {
    const { carId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { verificationId, isVerification } = location.state || {};

    const [car, setCar] = useState(null);
    const [verification, setVerification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [processingAction, setProcessingAction] = useState(false);

    useEffect(() => {
        // Get user from local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // Redirect to login if no user found
            navigate('/login');
            return;
        }

        // Fetch car and verification details
        fetchCarDetails();
        if (verificationId) {
            fetchVerificationDetails(verificationId);
        }
    }, [carId, verificationId, navigate]);

    const fetchCarDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_ENDPOINTS.CAR_DETAILS}/${carId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const parsedData = await response.json();
            const processedCar = processCarData(parsedData);
            setCar(processedCar);
            setLoading(false);
        } catch (err) {
            setError('Failed to load car details');
            setLoading(false);
            console.error(err);
        }
    };

    const fetchVerificationDetails = async (id) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.CAR_VERIFICATION_DETAILS}/${id}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setVerification(data);
        } catch (err) {
            console.error('Failed to fetch verification details:', err);
            // Continue showing the car details even if verification details fail
        }
    };

    // Process and enrich car data with required format and additional info
    const processCarData = (rawCarData) => {
        // Format features if they're coming as a string
        const features = typeof rawCarData.features === 'string'
            ? rawCarData.features.split(',').map(f => ({ name: f.trim(), available: true }))
            : Array.isArray(rawCarData.features)
                ? rawCarData.features
                : [];

        // Calculate base hours for pricing (default to 4 hours)
        const hours = 4;
        const basePrice = rawCarData.price_per_hour * hours;
        const tripProtectionFee = Math.round(basePrice * 0.05); // Assuming 5% of base price

        // Format location object
        const location = typeof rawCarData.location === 'string'
            ? { address: rawCarData.location, latitude: rawCarData.latitude, longitude: rawCarData.longitude }
            : rawCarData.location;

        // Prepare images array from various image URLs or use placeholders
        const images = [
            rawCarData.front_view_image_url,
            rawCarData.rear_view_image_url,
            rawCarData.left_side_image_url,
            rawCarData.right_side_image_url,
        ].filter(Boolean);

        // Use placeholder if no images available
        if (images.length === 0) {
            images.push("/api/placeholder/400/300");
        }

        // Final processed car data
        return {
            ...rawCarData,
            features,
            images,
            location,
            name: `${rawCarData.company_name} ${rawCarData.model_name}`,
            fuel: rawCarData.fuel_type,
            seats: rawCarData.seats || 5,
            year: rawCarData.manufacture_year,
            rating: rawCarData.car_rating,
            reviewCount: rawCarData.no_of_car_rating,
            transmission: rawCarData.transmission || 'Manual'
        };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleApproveCarVerification = async () => {
        if (!verificationId || processingAction) return;

        setProcessingAction(true);

        try {
            const response = await fetch(API_ENDPOINTS.CAR_VERIFICATION_UPDATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verification_id: verificationId,
                    verifier_id: user.id,
                    status: 'approved'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to approve car verification');
            }

            // Show success notification
            alert('Car verification approved successfully');
            // Redirect back to verification dashboard
            navigate('/employee');
        } catch (err) {
            console.error('Error approving car verification:', err);
            alert('Failed to approve verification: ' + err.message);
        } finally {
            setProcessingAction(false);
        }
    };

    const handleRejectCarVerification = async () => {
        if (!verificationId || processingAction) return;

        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        setProcessingAction(true);

        try {
            const response = await fetch(API_ENDPOINTS.CAR_VERIFICATION_UPDATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    verification_id: verificationId,
                    verifier_id: user.id,
                    status: 'rejected',
                    rejection_reason: rejectionReason
                })
            });

            if (!response.ok) {
                throw new Error('Failed to reject car verification');
            }

            // Show success notification
            alert('Car verification rejected successfully');
            // Redirect back to verification dashboard
            navigate('/employee');
        } catch (err) {
            console.error('Error rejecting car verification:', err);
            alert('Failed to reject verification: ' + err.message);
        } finally {
            setProcessingAction(false);
        }
    };

    const renderVerificationDocuments = () => {
        if (!verification) return null;

        return (
            <div className="mb-10 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Verification Documents</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                            RC Document (Expires: {formatDate(verification.rc_expiry_date)})
                        </p>
                        <div className="border rounded-lg overflow-hidden h-48 bg-gray-100">
                            <img
                                src={verification.rc_image_url}
                                alt="RC Document"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/api/placeholder/400/320';
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                            PUC Certificate (Expires: {formatDate(verification.puc_expiry_date)})
                        </p>
                        <div className="border rounded-lg overflow-hidden h-48 bg-gray-100">
                            <img
                                src={verification.puc_image_url}
                                alt="PUC Certificate"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/api/placeholder/400/320';
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                            Insurance Document (Expires: {formatDate(verification.insurance_expiry_date)})
                        </p>
                        <div className="border rounded-lg overflow-hidden h-48 bg-gray-100">
                            <img
                                src={verification.insurance_image_url}
                                alt="Insurance Document"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/api/placeholder/400/320';
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderVerificationActions = () => {
        if (!isVerification || !verificationId) return null;

        return (
            <div className="mb-10 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Verification Actions</h2>

                <div className="flex flex-col space-y-4">
                    <button
                        onClick={handleApproveCarVerification}
                        disabled={processingAction}
                        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 flex items-center justify-center"
                    >
                        <Check className="mr-2 h-5 w-5" />
                        {processingAction ? 'Processing...' : 'Approve Car Verification'}
                    </button>

                    <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rejection Reason (required for rejection)
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            rows="3"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter reason for rejection"
                        ></textarea>
                    </div>

                    <button
                        onClick={handleRejectCarVerification}
                        disabled={processingAction || !rejectionReason.trim()}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 flex items-center justify-center"
                    >
                        <X className="mr-2 h-5 w-5" />
                        {processingAction ? 'Processing...' : 'Reject Car Verification'}
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    if (!car) {
        return <div className="text-center py-10">No car data found</div>;
    }

    return (
        <div className="font-monda container mx-auto px-4 py-8 pt-20">
            <Navbar />

            {/* Back button - different behavior depending on if we're in verification mode */}
            <button
                onClick={() => isVerification ? navigate('/employee') : navigate(-1)}
                className="h-11 px-4 lg:px-6 border border-black rounded-lg bg-white hover:bg-black hover:text-white transition-colors text-sm lg:text-base flex items-center whitespace-nowrap"
            >
                <ArrowLeft size={16} className="mr-2" />
                <span>{isVerification ? 'Back to Dashboard' : 'Back to Listings'}</span>
            </button>

            {/* Verification documents section - only visible in verification mode */}
            {isVerification && renderVerificationDocuments()}

            {/* Verification actions section - only visible in verification mode */}
            {isVerification && renderVerificationActions()}

            {/* Car details section */}
            <div className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3">
                    <CarNameSection car={car} />
                    <CarImageSection
                        puc_image_url={car.puc_image_url}
                        rc_image_url={car.rc_image_url}
                        insurance_image_url={car.insurance_image_url}
                        front_view_image_url={car.front_view_image_url}
                        rear_view_image_url={car.rear_view_image_url}
                        left_side_image_url={car.left_side_image_url}
                        right_side_image_url={car.right_side_image_url}
                        carName={car.name}
                    />
                    <TabSection car={car} />
                </div>
            </div>
        </div>
    );
};

export default CarVerificationDetailsPage;