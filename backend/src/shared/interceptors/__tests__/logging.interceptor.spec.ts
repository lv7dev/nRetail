import { of } from 'rxjs';
import { LoggingInterceptor } from '../logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    jest.spyOn(interceptor['logger'], 'log').mockImplementation(() => undefined);
  });

  it('calls next.handle() and passes through the response value', (done) => {
    const mockRequest = { method: 'GET', url: '/test' };
    const mockContext = {
      switchToHttp: () => ({ getRequest: () => mockRequest }),
    };
    const handleSpy = jest.fn().mockReturnValue(of('response'));

    interceptor.intercept(mockContext as never, { handle: handleSpy }).subscribe((result) => {
      expect(handleSpy).toHaveBeenCalled();
      expect(result).toBe('response');
      done();
    });
  });

  it('logs the method, url, and duration after handle completes', (done) => {
    const mockRequest = { method: 'POST', url: '/auth/login' };
    const mockContext = {
      switchToHttp: () => ({ getRequest: () => mockRequest }),
    };
    const logSpy = jest.spyOn(interceptor['logger'], 'log').mockImplementation(() => undefined);

    interceptor.intercept(mockContext as never, { handle: () => of(null) }).subscribe(() => {
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('POST'));
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('/auth/login'));
      done();
    });
  });
});
