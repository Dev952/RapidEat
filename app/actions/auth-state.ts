export type AuthFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialAuthState: AuthFormState = { status: 'idle' };

