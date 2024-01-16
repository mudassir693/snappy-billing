import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Authorize } from 'src/config/helper/snappy-helper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  async validate(payload: any) {
    console.log(payload.expires_at < new Date().getTime())
    let token = ""
    if(payload.expires_at < new Date().getTime()){
        let {email, id, admin, staff} = payload
        try {
            token = (await Authorize({email, id, admin, staff})).data
        } catch (error) {
            throw new UnauthorizedException(error.message)
        }
    }
    return { userId: payload.id, username: payload.email, token };
  }
}