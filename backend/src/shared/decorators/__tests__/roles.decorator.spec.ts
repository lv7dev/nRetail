import { Roles, ROLES_KEY } from '../roles.decorator';

describe('Roles decorator', () => {
  it('sets ROLES_KEY metadata with the supplied roles on a method', () => {
    class TestController {
      @Roles('admin', 'staff')
      method(): void {}
    }
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const roles = Reflect.getMetadata(ROLES_KEY, TestController.prototype.method) as string[];
    expect(roles).toEqual(['admin', 'staff']);
  });

  it('sets ROLES_KEY metadata with a single role', () => {
    class TestController {
      @Roles('customer')
      method(): void {}
    }
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const roles = Reflect.getMetadata(ROLES_KEY, TestController.prototype.method) as string[];
    expect(roles).toEqual(['customer']);
  });

  it('exports ROLES_KEY as "roles"', () => {
    expect(ROLES_KEY).toBe('roles');
  });
});
