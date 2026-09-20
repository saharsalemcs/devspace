const KNOWN_AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "Invalid login credentials.",
  "Email not confirmed": "Please confirm your email before signing in.",
  "User already registered": "An account with this email already exists.",
  "Password should be at least 6 characters.": "Password is too short.",
};

export function getAuthErrorMessage(message: string): string {
  return (
    KNOWN_AUTH_ERRORS[message] ?? "Something went wrong. Please try again."
  );
}
