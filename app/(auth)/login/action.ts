"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export async function loginAction(formData: FormData): Promise<void> {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error("Email atau password salah.");
    }

    throw error;
  }
}