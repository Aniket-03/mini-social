export const formatError = (error: any): string => {
    if (!error || !error.code) return "An unknown error occurred.";
  
    const errorMapping: Record<string, string> = {
        "auth/email-already-in-use":"The email address is already in use by another account.",
        "auth/weak-password": "The password must be at least 6 characters long.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/network-request-failed":"A network error occurred. Please check your connection and try again.",
        "auth/invalid-credential": "Credential is invalid. Please try again.",
        "auth/user-not-found": "No user found with this email. Please check and try again.",
        "auth/wrong-password": "The password is incorrect. Please try again.",
        "auth/popup-closed-by-user":"The popup was closed before completing the operation.",
      
    };
  
    return errorMapping[error.code] || "An error occurred. Please try again.";
  };