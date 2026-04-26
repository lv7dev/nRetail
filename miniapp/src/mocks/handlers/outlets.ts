import { http, HttpResponse } from 'msw';
import type { Outlet } from '@/types/outlet';

const connectedOutlets: Outlet[] = [
  {
    id: 'outlet-1',
    name: 'Main Store',
    code: 'CU000014603',
    address: '123 Main St, District 1',
    imageUrl: 'https://example.com/outlets/main-store.jpg',
    role: 'OWNER',
  },
  {
    id: 'outlet-2',
    name: 'Branch Store',
    code: 'CU000014604',
    address: '456 Branch Ave, District 2',
    imageUrl: null,
    role: 'MANAGER',
  },
];

const notConnectedOutlets: Outlet[] = [
  {
    id: 'outlet-3',
    name: 'Panda Shop',
    code: 'CU000014605',
    address: '789 Panda Road, District 3',
    imageUrl: null,
    role: null,
  },
  {
    id: 'outlet-4',
    name: 'Sunrise Market',
    code: null,
    address: '321 Sunrise Blvd, District 4',
    imageUrl: 'https://example.com/outlets/sunrise-market.jpg',
    role: null,
  },
];

export const outletHandlers = [
  http.get('*/outlets/mine', () => {
    return HttpResponse.json({
      data: connectedOutlets,
    });
  }),
  http.get('*/outlets', ({ request }) => {
    const url = new URL(request.url);
    const connected = url.searchParams.get('connected') === 'true';
    const query = url.searchParams.get('q')?.trim().toLowerCase() ?? '';
    const seed = connected ? connectedOutlets : notConnectedOutlets;
    const data = query ? seed.filter((outlet) => outlet.name.toLowerCase().includes(query)) : seed;

    return HttpResponse.json({
      data,
      meta: {
        nextCursor: null,
      },
    });
  }),
];
