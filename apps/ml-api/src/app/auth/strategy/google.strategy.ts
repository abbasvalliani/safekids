import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { config } from 'dotenv';
import jwtConfig from '../../config/jwt';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GoogleOauthTokenDto } from '../../google-ouath/dto/google.oauth.token.dto';
import { UserService } from '../../user/user.service';
config({ quiet: true }); // dotenv 17+ logs on load unless quiet

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtConfig().jwtConfig.secretKey,
        });
    }

    async validate(dto: GoogleOauthTokenDto): Promise<GoogleOauthTokenDto> {
        const user = await this.userService.findOneById(dto.userId);
        if (!user || user.accountId !== dto.accountId) {
            throw new UnauthorizedException('You are not authorized to perform the operation');
        }
        return dto;
    }
}
