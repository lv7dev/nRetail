import { configSchema } from './config.schema';

export const configuration = () => {
  const parsed = configSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment configuration:\n${JSON.stringify(errors, null, 2)}`);
  }

  return parsed.data;
};
