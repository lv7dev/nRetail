import { z } from 'zod'

export const loginSchema = (t: (k: string) => string) =>
  z.object({
    phone: z.preprocess((v) => v ?? '', z.string().regex(/^0[0-9]{9}$/, t('validation.phone'))),
    password: z.preprocess((v) => v ?? '', z.string().min(6, t('validation.passwordMin'))),
  })

export type LoginFormData = z.infer<ReturnType<typeof loginSchema>>
