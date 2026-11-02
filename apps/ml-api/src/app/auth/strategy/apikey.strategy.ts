import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { InternalApiKeyService } from '../../internal-api-key/internal-api-key.service';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

@Injectable()
export class ApikeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'api-key-auth') {
    // @nestjs/passport 11 supplies the verify callback itself and calls validate().
    constructor(protected readonly internalApiKeyService: InternalApiKeyService) {
        super({ header: 'x-api-key', prefix: '' }, false);
    }

    async validate(apikey: string) {
        const checkKey = await this.internalApiKeyService.findOne(apikey);
        // A falsy result makes passport fail the request (401), as done(false) did.
        return checkKey || false;
    }
}
