"use client";

import AuthForm from "@/components/auth-form";
import { authClient } from "@/lib/auth-client";
import { SignInSchema } from "@/lib/schemas";

export default function SignInPage() {
  return (
    <AuthForm
      type="SIGN IN"
      schema={SignInSchema}
      defaultValues={{ email: "", password: "" }}
      onSubmitAction={async (data) => {
        const { error } = await authClient.signIn.email({
          email: data.email,
          password: data.password,
        });

        if (error) {
          return { success: false, message: error.message ?? "Sign in failed" };
        }

        return {
          success: true,
          message: "Signed in successfully",
          redirect: "/",
        };
      }}
    />
  );
}
