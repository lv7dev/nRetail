import { getMetadataStorage, ValidationError } from 'class-validator';

type ParamsMap = Record<string, unknown>;

const CONSTRAINT_PARAM_KEYS: Record<string, (args: unknown[]) => ParamsMap> = {
  minLength: (a) => ({ min: a[0] }),
  maxLength: (a) => ({ max: a[0] }),
  min: (a) => ({ min: a[0] }),
  max: (a) => ({ max: a[0] }),
  isLength: (a) => ({ min: a[0], max: a[1] }),
  arrayMinSize: (a) => ({ min: a[0] }),
  arrayMaxSize: (a) => ({ max: a[0] }),
  matches: (a) => ({ pattern: String(a[0]) }),
  isIn: (a) => ({ values: a[0] }),
};

export function extractConstraintParams(
  error: ValidationError,
  constraintKey: string,
): ParamsMap | undefined {
  const builder = CONSTRAINT_PARAM_KEYS[constraintKey];
  if (!builder) return undefined;

  const DtoClass = error.target?.constructor as (new () => unknown) | undefined;
  if (!DtoClass) return undefined;

  const metas = getMetadataStorage().getTargetValidationMetadatas(DtoClass, '', false, false);

  const meta = metas.find(
    (m) =>
      m.propertyName === error.property &&
      (m as unknown as { name: string }).name === constraintKey,
  );

  if (!meta?.constraints?.length) return undefined;

  return builder(meta.constraints as unknown[]);
}
