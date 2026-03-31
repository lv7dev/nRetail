import { http, HttpResponse } from 'msw';

export const outletHandlers = [
  http.get('*/outlets/mine', () => {
    return HttpResponse.json({
      data: [
        {
          id: 'outlet-1',
          name: 'Main Store',
          address: '123 Main St, District 1',
          role: 'OWNER',
        },
        {
          id: 'outlet-2',
          name: 'Branch Store',
          address: '456 Branch Ave, District 2',
          role: 'MANAGER',
        },
      ],
    });
  }),
];
