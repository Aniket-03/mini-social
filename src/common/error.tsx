export const formatError = (err: any): string => {
    if (!err?.code) return "An unexpected error occurred. Please try again.";

    const errorMessages = new Map([
        ["auth/email-already-in-use", "This email is already registered. Try logging in instead."],
        ["auth/weak-password", "Password is too weak. Use at least 6 characters."],
        ["auth/too-many-requests", "Too many attempts detected. Wait a moment before trying again."],
        ["auth/network-request-failed", "Network error! Please check your internet connection."],
        ["auth/invalid-credential", "Invalid login details. Double-check and try again."],
        ["auth/user-not-found", "No account found with this email. Please sign up if you're new."],
        ["auth/wrong-password", "Incorrect password. Try again or reset it if needed."],
        ["auth/popup-closed-by-user", "Login process was interrupted. Please try again."],
    ]);

    return errorMessages.get(err.code) ?? "Something went wrong. Please try once more.";
};