import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <section className="auth-page">
      <div className="auth-card" style={{ maxWidth: 420, padding: 0, overflow: "hidden" }}>
        <SignIn
          appearance={{
            elements: {
              rootBox: { width: "100%" },
              card: { boxShadow: "none", border: "none" },
            },
          }}
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </section>
  );
}
