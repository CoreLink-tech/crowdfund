import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name is too long"),
    email: z.string().email("Please enter a valid email address").toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    phone: z
      .string()
      .regex(/^(\+?234|0)?[789][01]\d{8}$/, "Please enter a valid Nigerian phone number")
      .optional()
      .or(z.literal("")),
    accountType: z.enum(["individual", "organization"]).default("individual"),
    organizationName: z.string().min(2).max(150).optional(),
  })
  .refine(
    (data) => {
      if (data.accountType === "organization") {
        return !!data.organizationName && data.organizationName.length >= 2;
      }
      return true;
    },
    {
      message: "Organization name is required for organization accounts",
      path: ["organizationName"],
    }
  );

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
