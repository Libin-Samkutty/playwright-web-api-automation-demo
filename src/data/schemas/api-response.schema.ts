import { z } from 'zod';

export const HealthCheckSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
});

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
  data: z.object({
    token: z.string().min(1),
  }),
});

export const RegisterResponseSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
  data: z
    .object({
      id: z.string().optional(),
      name: z.string(),
      email: z.string().email(),
    })
    .optional(),
});

export const UserProfileSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
  data: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
  }),
});

export const UnauthorizedSchema = z.object({
  success: z.literal(false),
  status: z.literal(401),
  message: z.string(),
});