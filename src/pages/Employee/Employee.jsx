import React, { useState, useEffect } from "react";
import { Menu, X, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../API_ENDPOINTS";
import Navbar from "../../components/NavBar";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [userVerifications, setUserVerifications] = useState([]);
  const [carVerifications, setCarVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // State for verification details modal
  const [showModal, setShowModal] = useState(false);
  const [currentVerification, setCurrentVerification] = useState(null);
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
    }

    // Fetch verification data
    fetchVerificationData();
  }, [navigate]);

  const fetchVerificationData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user verifications
      const userResponse = await fetch(API_ENDPOINTS.LIST_USER_VERIFICATION, {
        headers: {
         
        }
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user verifications');
      }
      
      const userData = await userResponse.json();
      console.log(userData);
      setUserVerifications(userData);
      
      // Fetch car verifications
      const carResponse = await fetch(API_ENDPOINTS.LIST_CAR_VERIFICATION, {
        headers: {
          // Add necessary headers here
        }
      });
      
      if (!carResponse.ok) {
        throw new Error('Failed to fetch car verifications');
      }
      
      const carData = await carResponse.json();
      setCarVerifications(carData);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching verification data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewUserVerification = (verification) => {
    setCurrentVerification(verification);
    setRejectionReason("");
    setShowModal(true);
  };

  const handleViewCarVerification = (verification) => {
    // Navigate to car details page with verification ID
    navigate(`/car-verification/${verification.car_id}`, {
      state: { 
        verificationId: verification.id,
        isVerification: true 
      }
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentVerification(null);
    setRejectionReason("");
  };

  const handleApproveUserVerification = async () => {
    if (processingAction) return;
    setProcessingAction(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.USER_VERIFICATION_UPDATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any other headers as needed
        },
        body: JSON.stringify({
          user_id: currentVerification.user_id,
          verified_by: user.id,
          verification_id: currentVerification.id,
          status: 'approved'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve user verification');
      }

      // Remove the approved verification from the list
      setUserVerifications(userVerifications.filter(v => v.id !== currentVerification.id));
      closeModal();
      // Show success notification
      alert('User verification approved successfully');
    } catch (err) {
      console.error('Error approving user verification:', err);
      alert('Failed to approve verification: ' + err.message);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectUserVerification = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    if (processingAction) return;
    setProcessingAction(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.USER_VERIFICATION_UPDATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentVerification.user_id,
          verified_by: user.id,
          verification_id: currentVerification.id,
          status: 'rejected',
          rejection_reason: rejectionReason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject user verification');
      }

      // Remove the rejected verification from the list
      setUserVerifications(userVerifications.filter(v => v.id !== currentVerification.id));
      closeModal();
      // Show success notification
      alert('User verification rejected successfully');
    } catch (err) {
      console.error('Error rejecting user verification:', err);
      alert('Failed to reject verification: ' + err.message);
    } finally {
      setProcessingAction(false);
    }
  };

  const renderUserVerificationDetails = () => {
    if (!currentVerification) return null;
    
    return (
      <div className="p-4">
        <h3 className="text-lg font-medium mb-4">User Verification Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">License Photo</p>
            <div className="border rounded-lg overflow-hidden h-64 bg-gray-100">
              <img
                src={currentVerification.license_photo_url}
                alt="License Photo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/api/placeholder/400/320';
                }}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Passport Photo</p>
            <div className="border rounded-lg overflow-hidden h-64 bg-gray-100">
              <img
                src={currentVerification.passport_photo_url}
                alt="Passport Photo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/api/placeholder/400/320';
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleApproveUserVerification}
              disabled={processingAction}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
            >
              {processingAction ? 'Processing...' : 'Approve Verification'}
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
              onClick={handleRejectUserVerification}
              disabled={processingAction || !rejectionReason.trim()}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
            >
              {processingAction ? 'Processing...' : 'Reject Verification'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-monda min-h-screen bg-gray-50">
      <Navbar/>
      
      {/* Content area - with padding top to account for fixed navbar */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user ? user.full_name || 'Employee' : 'Employee'}
          </h1>
          <p className="text-gray-500">Manage and approve verification requests</p>
        </div>
        
        {/* Tab navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Verifications
            </button>
            <button
              onClick={() => setActiveTab('cars')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cars'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Car Verifications
            </button>
          </div>
        </div>
        
        {/* Loading and error states */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}

        {/* User Verifications Tab */}
        {activeTab === 'users' && !loading && !error && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userVerifications.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No pending user verifications found
                      </td>
                    </tr>
                  ) : (
                    userVerifications.map((verification) => (
                      <tr key={verification.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {verification.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {verification.user_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(verification.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewUserVerification(verification)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded-md"
                          >
                            View & Verify
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Car Verifications Tab */}
        {activeTab === 'cars' && !loading && !error && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Car Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {carVerifications.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No pending car verifications found
                      </td>
                    </tr>
                  ) : (
                    carVerifications.map((verification) => (
                      <tr key={verification.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {verification.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {verification.car_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(verification.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewCarVerification(verification)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded-md"
                          >
                            View & Verify
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal for user verification details */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()} // Prevent clicks from closing modal
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  Verification Details
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  type="button"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="max-h-[80vh] overflow-y-auto">
                {renderUserVerificationDetails()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}