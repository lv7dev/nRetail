import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { outletService } from './outletService';

describe('outletService.getOutlets', () => {
  it('requests connected outlets with search and cursor params', async () => {
    const seenRequests: string[] = [];

    server.use(
      http.get('*/outlets', ({ request }) => {
        const url = new URL(request.url);
        seenRequests.push(url.search);

        return HttpResponse.json({
          data: [
            {
              id: 'outlet-1',
              name: 'Main Store',
              code: 'CU000014603',
              address: '123 Main St, District 1',
              imageUrl: 'https://example.com/outlets/main-store.jpg',
              role: 'OWNER',
            },
          ],
          meta: {
            nextCursor: 'cursor-2',
          },
        });
      }),
    );

    const response = await outletService.getOutlets({
      connected: true,
      q: 'main',
      cursor: 'cursor-1',
    });

    expect(seenRequests).toEqual(['?connected=true&q=main&cursor=cursor-1']);
    expect(response).toEqual({
      data: [
        {
          id: 'outlet-1',
          name: 'Main Store',
          code: 'CU000014603',
          address: '123 Main St, District 1',
          imageUrl: 'https://example.com/outlets/main-store.jpg',
          role: 'OWNER',
        },
      ],
      meta: {
        nextCursor: 'cursor-2',
      },
    });
  });

  it('requests not-connected outlets without optional params', async () => {
    let seenSearch = '';

    server.use(
      http.get('*/outlets', ({ request }) => {
        seenSearch = new URL(request.url).search;

        return HttpResponse.json({
          data: [
            {
              id: 'outlet-3',
              name: 'Panda Shop',
              code: null,
              address: null,
              imageUrl: null,
              role: null,
            },
          ],
          meta: {
            nextCursor: null,
          },
        });
      }),
    );

    const response = await outletService.getOutlets({
      connected: false,
    });

    expect(seenSearch).toBe('?connected=false');
    expect(response.meta.nextCursor).toBeNull();
    expect(response.data).toEqual([
      {
        id: 'outlet-3',
        name: 'Panda Shop',
        code: null,
        address: null,
        imageUrl: null,
        role: null,
      },
    ]);
  });
});
