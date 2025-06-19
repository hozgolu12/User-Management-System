import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    return user.isSuperAdmin === true;
  }
}
