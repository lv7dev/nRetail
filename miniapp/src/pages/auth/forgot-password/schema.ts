import { z } from 'zod';

export const forgotPasswordSchema = (t: (k: string) => string) =>
  z.object({
    phone: z.string().regex(/^0[0-9]{9}$/, t('validation.phone')),
  });

export type ForgotPasswordFormData = z.infer<ReturnType<typeof forgotPasswordSchema>>;
