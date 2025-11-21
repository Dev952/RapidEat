"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createSession,
  createUser,
  destroySession,
  findUserByEmail,
  verifyPassword,
} from "@/lib/auth";
import { hasMongoConfig } from "@/lib/mongodb";
import { type AuthFormState } from "@/app/actions/auth-state";

// Zod Schemas

const registerSchema = z
  .object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});


// Convert Zod error → AuthFormState

function toFormState(error: unknown): AuthFormState {
  if (error instanceof z.ZodError) {
    const fieldErrors: Record<string, string> = {};

    error.issues.forEach((item) => {
      const key = item.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = item.message;
      }
    });
    
    return {
      status: "error",
      message: "Please fix the highlighted fields",
      fieldErrors,
    };
  }

  console.error("[authAction] Non-Zod error", error);

  return {
    status: "error",
    message: "Something went wrong, please try again.",
  };
}

// REGISTER ACTION

export async function registerAction(
  _: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) return toFormState(parsed.error);

  if (!hasMongoConfig) {
    return {
      status: "error",
      message:
        "MongoDB connection is missing. Set MONGODB_URI in your .env and restart the dev server.",
    };
  }

  try {
    const existing = await findUserByEmail(parsed.data.email);

    if (existing) {
      return {
        status: "error",
        message: "This email is already registered",
        fieldErrors: { email: "Email already in use" },
      };
    }

    const user = await createUser(parsed.data);
    await createSession(user._id!);

    revalidatePath("/");

    return {
      status: "success",
      message: "Welcome aboard! Redirecting...",
    };
  } catch (error) {
    console.error("[registerAction]", error);
    return {
      status: "error",
      message:
        "Unable to reach the database. Please check your Mongo credentials.",
    };
  }
}

// LOGIN ACTION

export async function loginAction(
  _: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return toFormState(parsed.error);

  if (!hasMongoConfig) {
    return {
      status: "error",
      message:
        "MongoDB connection is missing. Set MONGODB_URI in .env and restart.",
    };
  }

  try {
    const user = await findUserByEmail(parsed.data.email);
    if (!user) {
      return {
        status: "error",
        message: "Invalid credentials",
        fieldErrors: { email: "Email not found" },
      };
    }

    const valid = await verifyPassword(
      parsed.data.password,
      user.passwordHash
    );

    if (!valid) {
      return {
        status: "error",
        message: "Invalid credentials",
        fieldErrors: { password: "Incorrect password" },
      };
    }

    await createSession(user._id!.toString());
    revalidatePath("/");

    return {
      status: "success",
      message: "Logged in successfully!",
    };
  } catch (error) {
    console.error("[loginAction]", error);
    return {
      status: "error",
      message: "Database connection error. Check Mongo credentials.",
    };
  }
}


// LOGOUT ACTION

export async function logoutAction() {
  await destroySession();
  revalidatePath("/");
  redirect("/");
}

