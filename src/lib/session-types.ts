import type { Role } from "./constants";

/** Shape shared between server auth helpers and client components. */
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};
