import { of } from 'rxjs';
import { ResponseInterceptor } from '../response.interceptor';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  it('wraps a primitive handler result in { data }', (done) => {
    const mockHandler = { handle: () => of('test-value') };
    interceptor.intercept({} as never, mockHandler).subscribe((result) => {
      expect(result).toEqual({ data: 'test-value' });
      done();
    });
  });

  it('wraps an object handler result in { data }', (done) => {
    const payload = { id: 1, name: 'product' };
    const mockHandler = { handle: () => of(payload) };
    interceptor.intercept({} as never, mockHandler).subscribe((result) => {
      expect(result).toEqual({ data: payload });
      done();
    });
  });

  it('wraps a null handler result in { data: null }', (done) => {
    const mockHandler = { handle: () => of(null) };
    interceptor.intercept({} as never, mockHandler).subscribe((result) => {
      expect(result).toEqual({ data: null });
      done();
    });
  });
});
