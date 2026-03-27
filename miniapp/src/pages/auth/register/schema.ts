import { z } from 'zod';

export const phoneSchema = (t: (k: string) => string) =>
  z.object({
    phone: z.string().regex(/^0[0-9]{9}$/, t('validation.phone')),
  });

export type PhoneFormData = z.infer<ReturnType<typeof phoneSchema>>;

export const registerCompleteSchema = (t: (k: string) => string) =>
  z
    .object({
      name: z.string().min(1, t('validation.required')),
      password: z.string().min(6, t('validation.passwordMin')),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    });

export type RegisterCompleteFormData = z.infer<ReturnType<typeof registerCompleteSchema>>;
