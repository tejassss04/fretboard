const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin:
    'Invalid email or password. Please check your credentials and try again.',
  OAuthAccountNotLinked:
    'An account with this email already exists using a different sign-in method. Please sign in with your original method.',
  AccessDenied: 'Sign-in was canceled or access was denied.',
  Configuration:
    'Authentication provider configuration is incomplete in this environment.',
  OAuthCallbackError:
    'Unable to complete OAuth sign-in. Please verify your provider configuration.',
  Verification: 'This verification link is invalid or has expired.',
};

export function getAuthErrorMessage(code?: string | null): string | null {
  if (!code) return null;
  return (
    AUTH_ERROR_MESSAGES[code] ??
    'Unable to sign in right now. Please try again.'
  );
}

