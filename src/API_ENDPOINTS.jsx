const BASE_URL = "http://127.0.0.1:8000"; 

export const API_ENDPOINTS = {
  SEND_OTP: `${BASE_URL}/api/v1/otp/send-otp`,
  VERIFY_OTP: `${BASE_URL}/api/v1/otp/verify-otp`,
  UPDATE_NAME: `${BASE_URL}/api/v1/user/update-name`,

  LIST_USER_VERIFICATION: `${BASE_URL}/api/v1/employee/all-user-verifications`,
  LIST_CAR_VERIFICATION: `${BASE_URL}/api/v1/employee/all-car-verifications`,


  USER_VERIFICATION_UPDATE: `${BASE_URL}/api/v1/employee/user-verification-update`,
  CAR_VERIFICATION_UPDATE: `${BASE_URL}/api/v1/employee/car-verification-update`,

  CAR_DETAILS: `${BASE_URL}/api/v1/car-details`,
  ADMIN: `${BASE_URL}/api/v1/admin`,
  
};
