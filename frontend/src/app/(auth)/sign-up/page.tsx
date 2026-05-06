"use client";

import AuthForm from "@/components/auth-form";
import { authClient } from "@/lib/auth-client";
import { SignUpSchema } from "@/lib/schemas";

export default function SignUpPage() {
  return (
    <AuthForm
      type="SIGN UP"
      schema={SignUpSchema}
      defaultValues={{ name: "", email: "", password: "" }}
      onSubmitAction={async (data) => {
        const { error } = await authClient.signUp.email({
          name: data.name,
          email: data.email,
          password: data.password,
        });

        if (error) {
          return { success: false, message: error.message ?? "Sign Up failed" };
        }

        return {
          success: true,
          message: "Signed up successfully",
          redirect: "/sign-in",
        };
      }}
    />
  );
}
