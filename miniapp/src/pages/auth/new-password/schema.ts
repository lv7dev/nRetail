import { z } from 'zod';

export const newPasswordSchema = (t: (k: string) => string) =>
  z
    .object({
      password: z.string().min(6, t('validation.passwordMin')),
      confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    });

export type NewPasswordFormData = z.infer<ReturnType<typeof newPasswordSchema>>;
