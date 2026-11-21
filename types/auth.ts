export type UserRole = "admin" | "tenant";

export type AdminSession = {
  role: "admin";
  sub: string;
  userId: number;
  name?: string;
  exp: number;
};

export type TenantSession = {
  role: "tenant";
  sub: string;
  userId: number;
  name?: string;
  exp: number;
};

export type HostSession = {
  role: "host";
  slug: string;
  ver: number;
  exp: number;
};

export type SessionPayload = AdminSession | TenantSession | HostSession;

export type HostAccess = "admin" | "tenant" | "host" | null;

export type User = {
  id: number;
  email: string;
  role: UserRole;
  name?: string | null;
  created_at: string | Date;
  invitation_count?: number;
};
