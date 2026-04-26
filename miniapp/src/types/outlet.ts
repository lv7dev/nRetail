export interface Outlet {
  id: string;
  name: string;
  address: string | null;
  role: 'OWNER' | 'MANAGER' | 'STAFF' | null;
  membershipStatus?: 'PENDING' | 'REJECTED';
  code?: string | null;
  imageUrl?: string | null;
}

export type OutletTabKey = 'connected' | 'not-connected';
