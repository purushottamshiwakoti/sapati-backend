import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(2, { message: "Password is required" }),
});
export const addUserSchema = z.object({
  fullName: z.string().min(1,{message: "Full Name is required"}),
  email: z.string().email(),
  password: z.string().min(2, { message: "Password is required" }),
});
export const editUserSchema = z.object({
  fullName: z.string().min(1,{message: "Full Name is required"}),
  email: z.string().email(),
});

export const changePasswordSchema = z.object({
  password: z.string().min(1,{message:"Password is required"}),
  newPassword: z.string().min(6,{message:"Password must be minimum of 6 characters"}),
  confirmPassword: z.string(),

}) .refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

export const registerSchema = z.object({
  phone_number:z.string().min(8,{message:"Phone number must be minimum of 8 characters"}).regex(phoneRegex, 'Invalid Number!'),
});