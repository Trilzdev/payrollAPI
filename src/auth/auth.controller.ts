// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: Record<string, string>, @Res({ passthrough: true }) res: Response) {
    const validatedUser = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    
    // Get the token and user from the service
    const { accessToken, user } = await this.authService.login(validatedUser);

    // Set the HttpOnly Cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true, // JavaScript cannot read this!
      secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
      sameSite: 'lax', // Protects against CSRF
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Only return the user data to the frontend
    return { user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }
}