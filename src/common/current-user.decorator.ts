import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// //current-user.decorator.ts

// import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// /**
//  * Custom decorator to extract the current user from the request object.
//  * This decorator should be used in conjunction with the JwtAuthGuard.
//  *
//  * Example usage:
//  * ```
//  * @Get('profile')
//  * @UseGuards(JwtAuthGuard)
//  * getProfile(@CurrentUser() user: User) {
//  *   return user;
//  * }
//  * ```
//  */
// export const CurrentUser = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext) => {
//     const request = ctx.switchToHttp().getRequest();
//     return request.user;
//   },
// );

// // Controller

//  @Get("profile")
//   @ApiOperation({ summary: "Get current user profile" })
//   @ApiResponse({
//     status: 200,
//     description: "User profile retrieved successfully",
//   })
//   async getProfile(@CurrentUser() user: User) {
//     return this.userService.findById(user.id);
//   }
