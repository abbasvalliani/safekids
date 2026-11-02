import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GoogleOauthService } from './googleOauth.service';
import { LoggingService } from '../logger/logging.service';
import { JwtTokenService } from '../auth/jwtToken/jwt.token.service';
import { AccountService } from '../accounts/account.service';
import { OrgUnitService } from '../org-unit/org-unit.service';
import { UserService } from '../user/user.service';
import { AuthTokenService } from '../auth-token/auth-token.service';
import { DirectoryService } from '../directory-service/directory.service';
import { CreateOrgUnitDto } from '../org-unit/dto/create-org-unit.dto';
import { QueryException } from '../error/common.exception';
import {
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRoles } from '../user/user.roles';
import { AccountErrors } from '../accounts/account.errors';
import { GoogleApisErrors } from '../google-apis/google-apis.errors';

class Fixture {
  static getMock() {
    return jest.fn();
  }

  static getLoggingService() {
    return {
      className: Fixture.getMock(),
      debug: Fixture.getMock(),
      info: Fixture.getMock(),
      error: Fixture.getMock(),
    };
  }

  static getRootOU() {
    return {
      name: 'rootName',
      googleOrgUnitId: 'rootGoogleOrgUnitId',
      parent: 'rootParent',
      parentOuId: 'rootParentOuId',
      description: 'rootDescription',
      orgUnitPath: 'rootOrgUnitPath',
    } as CreateOrgUnitDto;
  }

  static getQueueConfig() {
    return {
      url: 'url',
      client_id: 'client_id',
      client_secret: 'client_secret',
    };
  }

  static JwtTokenService = class {
    static generateRegistrationToken = Fixture.getMock();
  };
  static AccountService = class {
    static upsertByDomain = Fixture.getMock().mockResolvedValue({
      id: 'accountId',
    });
    static findAdminAccount = Fixture.getMock();
  };
  static OrgUnitService = class {
    static upsert = Fixture.getMock().mockResolvedValue(Fixture.getRootOU());
  };
  static UserService = class {
    static upsert = Fixture.getMock().mockResolvedValue({ id: 'userId' });
    static findOneByEmail = Fixture.getMock();
  };

  static Sequelize = class {
    static transaction = Fixture.getMock().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn(),
    });
  };

  static AuthTokenService = class {
    static upsert = Fixture.getMock().mockResolvedValue({ id: 'userId' });
  };
  static DirectoryService = class {
    static populateOrgUnits = Fixture.getMock().mockResolvedValue({});
  };
  static getConfigService = {
    get: Fixture.getMock().mockReturnValue({
      url: 'url',
      client_id: 'client_id',
      client_secret: 'client_secret',
    }),
  };
}

describe('Google Oauth service test', () => {
  let service: GoogleOauthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleOauthService,
        {
          provide: JwtTokenService,
          useValue: Fixture.JwtTokenService,
        },
        {
          provide: AccountService,
          useValue: Fixture.AccountService,
        },
        {
          provide: OrgUnitService,
          useValue: Fixture.OrgUnitService,
        },
        {
          provide: UserService,
          useValue: Fixture.UserService,
        },
        {
          provide: AuthTokenService,
          useValue: Fixture.AuthTokenService,
        },
        {
          provide: DirectoryService,
          useValue: Fixture.DirectoryService,
        },
        {
          provide: LoggingService,
          useValue: Fixture.getLoggingService(),
        },
        {
          provide: ConfigService,
          useValue: Fixture.getConfigService,
        },
        {
          provide: 'SEQUELIZE',
          useValue: Fixture.Sequelize,
        },
      ],
    }).compile();

    service = module.get<GoogleOauthService>(GoogleOauthService);
  });

  describe('Authorize urls', () => {
    it('Should generate url for teacher', async () => {
      //given
      const res = { redirect: jest.fn() };
      const isTeacher = true;
      const expectedUrl = `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&prompt=consent&response_type=code&client_id=client_id&redirect_uri=url%2Fauth%2Fgoogle%2Fredirect%2Fteacher`;

      //when
      await service.authorize(res, isTeacher);

      //then
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(expectedUrl);
    });

    it('Should generate url for admin', async () => {
      //given
      const res = { redirect: jest.fn() };
      const isTeacher = false;
      const expectedUrl = `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fadmin.directory.user.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fadmin.directory.orgunit.readonly&prompt=consent&response_type=code&client_id=client_id&redirect_uri=url%2Fauth%2Fgoogle%2Fredirect`;
      //when
      await service.authorize(res, isTeacher);

      //then
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(expectedUrl);
    });
  });

  describe('Authenticate admin', () => {
    it('Should authenticate admin', async () => {
      //given
      const code = 'code';
      jest.spyOn(service, 'getTokenCredentials').mockResolvedValue({});
      jest.spyOn(service, 'getUserInfo').mockResolvedValue({});
      jest
        .spyOn(service, 'getRootOrgUnits')
        .mockResolvedValue(Fixture.getRootOU());

      //when
      await service.authenticateAdmin(code);

      //then
      expect(Fixture.AccountService.upsertByDomain).toHaveBeenCalledTimes(1);
      expect(Fixture.OrgUnitService.upsert).toHaveBeenCalledTimes(1);
      expect(Fixture.UserService.upsert).toHaveBeenCalledTimes(1);
      expect(Fixture.AuthTokenService.upsert).toHaveBeenCalledTimes(1);
      expect(Fixture.DirectoryService.populateOrgUnits).toHaveBeenCalledTimes(
        1,
      );
      expect(
        Fixture.JwtTokenService.generateRegistrationToken,
      ).toHaveBeenCalledTimes(1);
      const payload = {
        userId: 'userId',
        accountId: 'accountId',
      };
      expect(
        Fixture.JwtTokenService.generateRegistrationToken,
      ).toHaveBeenCalledWith(payload);
      expect(Fixture.DirectoryService.populateOrgUnits).toHaveBeenCalledWith(
        payload.accountId,
        payload.userId,
      );
    });

    it('Should throw exception if error occurs when populating OUs', async () => {
      //given
      const code = 'code';
      jest.spyOn(service, 'getTokenCredentials').mockResolvedValue({});
      jest.spyOn(service, 'getUserInfo').mockResolvedValue({});
      jest
        .spyOn(service, 'getRootOrgUnits')
        .mockResolvedValue(Fixture.getRootOU());
      Fixture.DirectoryService.populateOrgUnits.mockRejectedValueOnce(
        'error when populating OUs',
      );

      //when
      try {
        await service.authenticateAdmin(code);
      } catch (e) {
        //then
        expect(Fixture.AccountService.upsertByDomain).toHaveBeenCalledTimes(1);
        expect(Fixture.OrgUnitService.upsert).toHaveBeenCalledTimes(1);
        expect(Fixture.UserService.upsert).toHaveBeenCalledTimes(1);
        expect(Fixture.AuthTokenService.upsert).toHaveBeenCalledTimes(1);
        expect(Fixture.DirectoryService.populateOrgUnits).toHaveBeenCalledTimes(
          1,
        );
        expect(
          Fixture.JwtTokenService.generateRegistrationToken,
        ).toHaveBeenCalledTimes(0);
        expect(Fixture.DirectoryService.populateOrgUnits).toHaveBeenCalledWith(
          'accountId',
          'userId',
        );

        expect(e).toBeInstanceOf(QueryException);
        expect(e.message).toBe(QueryException.save());
        expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('Authenticate teacher', () => {
    it('Should authenticate teacher', async () => {
      //given
      const code = 'code';
      jest.spyOn(service, 'getTokenCredentials').mockResolvedValue({});
      const userInfo = { hd: 'domain.com', email: 'email.com' };
      jest.spyOn(service, 'getUserInfo').mockResolvedValue(userInfo);
      Fixture.UserService.findOneByEmail.mockResolvedValue({
        id: 'userId',
        role: UserRoles.DISTRICT_USER,
      });
      Fixture.AccountService.findAdminAccount.mockResolvedValue({
        id: 'accountId',
      });

      //when
      await service.authenticateTeacher(code);

      //then
      expect(Fixture.AccountService.findAdminAccount).toHaveBeenCalledTimes(1);
      expect(Fixture.UserService.findOneByEmail).toHaveBeenCalledTimes(1);
      expect(
        Fixture.JwtTokenService.generateRegistrationToken,
      ).toHaveBeenCalledTimes(1);
      const payload = {
        userId: 'userId',
        accountId: 'accountId',
      };
      expect(
        Fixture.JwtTokenService.generateRegistrationToken,
      ).toHaveBeenCalledWith(payload);
    });

    it('Should throw exception if account not found', async () => {
      //given
      const code = 'code';
      jest.spyOn(service, 'getTokenCredentials').mockResolvedValue({});
      const userInfo = { hd: 'domain.com', email: 'email.com' };
      jest.spyOn(service, 'getUserInfo').mockResolvedValue(userInfo);
      Fixture.UserService.findOneByEmail.mockResolvedValue({
        id: 'userId',
        role: UserRoles.DISTRICT_USER,
      });
      Fixture.AccountService.findAdminAccount.mockResolvedValue(null);

      //when
      try {
        await service.authenticateTeacher(code);
      } catch (e) {
        //then
        //then
        expect(Fixture.AccountService.findAdminAccount).toHaveBeenCalledTimes(
          1,
        );
        expect(Fixture.UserService.findOneByEmail).toHaveBeenCalledTimes(0);
        expect(
          Fixture.JwtTokenService.generateRegistrationToken,
        ).toHaveBeenCalledTimes(0);

        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe(AccountErrors.domainNotFound(userInfo.hd));
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('Should throw exception if user is admin', async () => {
      //given
      const code = 'code';
      jest.spyOn(service, 'getTokenCredentials').mockResolvedValue({});
      const userInfo = { hd: 'domain.com', email: 'email.com' };
      jest.spyOn(service, 'getUserInfo').mockResolvedValue(userInfo);
      Fixture.UserService.findOneByEmail.mockResolvedValue({
        id: 'userId',
        role: UserRoles.DISTRICT_USER,
        isAdmin: true,
      });
      Fixture.AccountService.findAdminAccount.mockResolvedValue({});

      //when
      try {
        await service.authenticateTeacher(code);
      } catch (e) {
        //then
        //then
        expect(Fixture.AccountService.findAdminAccount).toHaveBeenCalledTimes(
          1,
        );
        expect(Fixture.UserService.findOneByEmail).toHaveBeenCalledTimes(1);
        expect(
          Fixture.JwtTokenService.generateRegistrationToken,
        ).toHaveBeenCalledTimes(0);

        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toBe(AccountErrors.adminLink());
        expect(e.status).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it('Should throw exception if user is not teacher yet', async () => {
      //given
      const code = 'code';
      jest.spyOn(service, 'getTokenCredentials').mockResolvedValue({});
      const userInfo = { hd: 'domain.com', email: 'email.com' };
      jest.spyOn(service, 'getUserInfo').mockResolvedValue(userInfo);
      Fixture.UserService.findOneByEmail.mockResolvedValue({
        id: 'userId',
        role: UserRoles.STUDENT,
      });
      Fixture.AccountService.findAdminAccount.mockResolvedValue({});

      //when
      try {
        await service.authenticateTeacher(code);
      } catch (e) {
        //then
        //then
        expect(Fixture.AccountService.findAdminAccount).toHaveBeenCalledTimes(
          1,
        );
        expect(Fixture.UserService.findOneByEmail).toHaveBeenCalledTimes(1);
        expect(
          Fixture.JwtTokenService.generateRegistrationToken,
        ).toHaveBeenCalledTimes(0);

        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe(GoogleApisErrors.contactAdmin());
        expect(e.status).toBe(HttpStatus.UNAUTHORIZED);
      }
    });
  });
});
