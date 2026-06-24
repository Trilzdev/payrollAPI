// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 1. Tell Passport to look inside the 'access_token' cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: false,
      // 2. Must match the secret in your AuthModule
      secretOrKey: process.env.JWT_SECRET || 'OFC_SECRET_SIGNING_KEY_2026',
    });
  }

  // 3. If the cookie is valid, this attaches the user data to the request
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}