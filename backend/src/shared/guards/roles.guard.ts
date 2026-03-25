import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * Stub — always passes. Replace with real RBAC logic in the auth change.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}
