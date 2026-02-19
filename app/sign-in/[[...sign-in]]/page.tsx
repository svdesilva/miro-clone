import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-neutral-50">
      <SignIn />
    </div>
  );
}
