import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from '../current-user.decorator';

type Factory = (data: unknown, ctx: ExecutionContext) => unknown;

// Apply the decorator to a test controller to capture the factory function
class TestController {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  test(@CurrentUser() _user: unknown): void {}
}

function getFactory(): Factory {
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'test') as Record<
    string,
    { factory: Factory }
  >;
  return args[Object.keys(args)[0]].factory;
}

describe('CurrentUser decorator', () => {
  it('extracts user from request', () => {
    const mockUser = { id: 'user-1', phone: '0901234567' };
    const mockCtx = {
      switchToHttp: () => ({
        getRequest: () => ({ user: mockUser }),
      }),
    } as unknown as ExecutionContext;

    const factory = getFactory();
    expect(factory(undefined, mockCtx)).toBe(mockUser);
  });

  it('returns undefined when request has no user', () => {
    const mockCtx = {
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const factory = getFactory();
    expect(factory(undefined, mockCtx)).toBeUndefined();
  });
});
