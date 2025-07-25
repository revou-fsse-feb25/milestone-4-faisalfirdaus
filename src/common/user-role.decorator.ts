import { SetMetadata } from '@nestjs/common';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

// The roles metadata key
export const ROLES_KEY = 'roles';

// The custom decorator to specify required roles
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
