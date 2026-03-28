import { RolesGuard } from '../roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard();
  });

  it('canActivate() returns true (stub always allows)', () => {
    expect(guard.canActivate({} as never)).toBe(true);
  });
});
