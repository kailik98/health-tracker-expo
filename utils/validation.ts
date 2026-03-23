import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const waterIntakeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type WaterIntakeValues = z.infer<typeof waterIntakeSchema>;
