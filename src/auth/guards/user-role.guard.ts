import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from 'src/common/user-role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the roles metadata (required roles) from the handler
    const requiredRoles = this.reflector.get<Role[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // If no roles are required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming user is added to the request (e.g., from JWT authentication)

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if the user's role is one of the required roles
    return requiredRoles.includes(user.role);
  }
}

// @Injectable()
// export class RoleGuard implements CanActivate {
//   constructor(
//     private reflector: Reflector,
//     private jwtService: JwtService,
//     private configService: ConfigService,
//   ) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.get<string[]>(
//       'role',
//       context.getHandler(),
//     );
//     if (!requiredRoles) {
//       return true; // Allow access if no role are defined
//     }

//     const request = context.switchToHttp().getRequest();
//     const authHeader = request.headers.authorization;
//     if (!authHeader) {
//       throw new UnauthorizedException('Authorization token missing');
//     }

//     const token = authHeader.split(' ')[1];
//     if (!token) {
//       throw new UnauthorizedException('Authorization token format invalid');
//     }

//     try {
//       // Verify the JWT token
//       const decoded = this.jwtService.verify(token, {
//         secret: this.configService.get<string>('JWT_SECRET'),
//       });

//       // Check if the decoded role is in the required roles
//       return requiredRoles.includes(decoded.role);
//     } catch (err) {
//       throw new UnauthorizedException('Invalid or expired token');
//     }
//   }
// }
