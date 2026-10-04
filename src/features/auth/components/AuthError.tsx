"use client";

interface AuthErrorProps {
  id?: string;
  message: string;
}

export function AuthError({ id, message }: AuthErrorProps) {
  return (
    <div
      id={id}
      role="alert"
      className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </div>
  );
}
