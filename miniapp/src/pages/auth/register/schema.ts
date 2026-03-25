import { z } from 'zod'

export const registerSchema = (t: (k: string) => string) =>
  z.object({
    phone: z.preprocess((v) => v ?? '', z.string().regex(/^0[0-9]{9}$/, t('validation.phone'))),
    password: z.preprocess((v) => v ?? '', z.string().min(6, t('validation.passwordMin'))),
    confirmPassword: z.preprocess((v) => v ?? '', z.string()),
  }).refine((d) => d.password === d.confirmPassword, {
    message: t('validation.passwordMismatch'),
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<ReturnType<typeof registerSchema>>
