export interface Outlet {
  id: string;
  name: string;
  address: string | null;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
}
