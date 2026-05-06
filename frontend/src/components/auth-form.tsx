"use client";

import {
  Controller,
  DefaultValues,
  FieldValues,
  Path,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodType } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { INPUT_TYPE, PLACEHOLDER } from "@/constants";

type AuthFormProps<T extends FieldValues> = {
  type: "SIGN IN" | "SIGN UP";
  schema: ZodType<T, T>;
  defaultValues: DefaultValues<T>;
  onSubmitAction: (
    data: T,
  ) => Promise<{ success: boolean; message: string; redirect?: string }>;
};

export default function AuthForm<T extends FieldValues>({
  defaultValues,
  onSubmitAction,
  schema,
  type,
}: AuthFormProps<T>) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function handleSubmit(data: z.infer<typeof schema>) {
    setIsLoading(true);
    const result = await onSubmitAction(data);
    if (result.success) {
      // toast or redirect
      router.push("/");
    } else {
      form.setError("root", { message: result.message });
    }

    setIsLoading(false);
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold upp">
          {type === "SIGN IN" ? "Sign In" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-lg">
          {type === "SIGN IN"
            ? "Sign in to your account"
            : "Create a new account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="auth-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            {Object.keys(defaultValues).map((ff) => (
              <Controller
                key={ff}
                name={ff as Path<T>}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="uppercase text-lg">{ff}</FieldLabel>
                    <Input
                      id={`auth-form-${ff}`}
                      type={INPUT_TYPE[ff as keyof typeof INPUT_TYPE]}
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder={PLACEHOLDER[ff as keyof typeof PLACEHOLDER]}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ))}
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <Field orientation={"horizontal"}>
          <Button
            type="submit"
            form="auth-form"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading
              ? "Loading..."
              : type === "SIGN IN"
                ? "Sign In"
                : "Create Account"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
