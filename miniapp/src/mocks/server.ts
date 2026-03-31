import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth';
import { outletHandlers } from './handlers/outlets';

export const server = setupServer(...authHandlers, ...outletHandlers);
