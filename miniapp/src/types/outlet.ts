export interface Outlet {
  id: string;
  name: string;
  address: string | null;
  role: 'OWNER' | 'MANAGER' | 'STAFF' | null;
  code?: string | null;
  imageUrl?: string | null;
}
