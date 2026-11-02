import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '../../logger/logging.service';
import { AuthService } from './auth.service';
import { Statuses } from '../../status/default-status';
import { JwtTokenService } from '../../auth/jwtToken/jwt.token.service';
import { AccountService } from '../../accounts/account.service';
import { OrgUnitService } from '../../org-unit/org-unit.service';
import { ConsumerUserService } from '../user/consumer-user.service';
import { EmailService } from '../../email/email.service';
import { UserCodeService } from '../user-code/user-code.service';
import { FilteredCategoryService } from '../../filtered-category/filtered-category.service';
import { ConfigService } from '@nestjs/config';
import { AccountTypes } from '../../account-type/dto/account-types';
import { CreateAccountDto } from '../../accounts/dto/create-account.dto';
import { CreateOrgUnitDto } from '../../org-unit/dto/create-org-unit.dto';
import { UserRoles } from '../../user/user.roles';
import { UserDto } from '../user/dto/user.dto';
import { CodeType } from '../user-code/code_type';
import { UserCodeDTO } from '../user-code/dto/user-code.dto';
import { EmailTemplates } from '../../email/email.templates';
import { ValidationException } from '../../error/common.exception';
import { UserErrors } from '../user/users.errors';
import { HttpStatus } from '@nestjs/common';
import { CustomerService } from '../../billing/customer/customer.service';
import { SubscriptionService } from '../../billing/subscription/subscription.service';
import { PlanService } from '../../billing/plan/plan.service';

class Fixture {
  static getMock() {
    return jest.fn();
  }

  static getJwtTokenService = class {
    static generateRegistrationToken = Fixture.getMock();
  };

  static SUBSCRIPTION_REPOSITORY = class {
    static sequelize = { query: jest.fn() };
  };

  static getAccountService = class {
    static create = Fixture.getMock();
    static findOne = Fixture.getMock();
    static update = Fixture.getMock();
  };

  static getOrgUnitService = class {
    static create = Fixture.getMock();
  };

  static getConsumerUserService = class {
    static create = Fixture.getMock();
    static update = Fixture.getMock();
    static findOneById = Fixture.getMock();
    static findOneByEmail = Fixture.getMock();
  };

  static getLoggingService() {
    return {
      className: Fixture.getMock(),
      debug: Fixture.getMock(),
      error: Fixture.getMock(),
    };
  }

  static getEmailService = class {
    static sendEmail = Fixture.getMock();
  };

  static CustomerService = class {
    static createCustomer = Fixture.getMock();
  };

  static getUserCodeService = class {
    static create = Fixture.getMock();
    static findOne = Fixture.getMock();
    static update = Fixture.getMock();
    static deleteOne = Fixture.getMock();
  };

  static getFilteredCategoryService = class {
    static saveDefaultCategoriesForOrgUnit = Fixture.getMock();
  };

  static getConfigService = class {
    static _isDevelopment = Fixture.getMock().mockReturnValue(true);
  };

  static Sequelize = class {
    static transaction = Fixture.getMock().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn(),
    });
  };

  static getUserDTO() {
    return {
      id: 'id',
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      password: 'password',
      statusId: Statuses.ACTIVE,
    };
  }
}

describe('Auth service unit tests', () => {
  let service: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtTokenService,
          useValue: Fixture.getJwtTokenService,
        },
        {
          provide: AccountService,
          useValue: Fixture.getAccountService,
        },
        {
          provide: CustomerService,
          useValue: Fixture.CustomerService,
        },
        {
          provide: SubscriptionService,
          useValue: Fixture.CustomerService,
        },
        {
          provide: PlanService,
          useValue: Fixture.CustomerService,
        },
        {
          provide: OrgUnitService,
          useValue: Fixture.getOrgUnitService,
        },
        {
          provide: ConsumerUserService,
          useValue: Fixture.getConsumerUserService,
        },
        {
          provide: LoggingService,
          useValue: Fixture.getLoggingService(),
        },
        {
          provide: EmailService,
          useValue: Fixture.getEmailService,
        },
        {
          provide: UserCodeService,
          useValue: Fixture.getUserCodeService,
        },
        {
          provide: FilteredCategoryService,
          useValue: Fixture.getFilteredCategoryService,
        },
        {
          provide: ConfigService,
          useValue: Fixture.getConfigService,
        },
        {
          provide: 'SEQUELIZE',
          useValue: Fixture.Sequelize,
        },
        {
          provide: 'SUBSCRIPTION_REPOSITORY',
          useValue: Fixture.SUBSCRIPTION_REPOSITORY,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('Sign up parent', () => {
    it('Should create parent account, user, organizational unit,send email and generate token', async () => {
      //given
      const userDTO = Fixture.getUserDTO();
      const fullName = userDTO.firstName + ' ' + userDTO.lastName;
      const accountId = 'accountId';
      const orgUnitId = 'orgUnitId';
      const userId = 'userId';
      const userCode = 'userCode';

      //mock dependencies
      Fixture.getAccountService.create.mockResolvedValueOnce({ id: accountId });
      Fixture.getOrgUnitService.create.mockResolvedValueOnce({ id: orgUnitId });
      Fixture.getConsumerUserService.create.mockResolvedValueOnce({
        id: userId,
        firstName: userDTO.firstName,
        lastName: userDTO.lastName,
        email: userDTO.email,
      });
      Fixture.getUserCodeService.create.mockResolvedValueOnce({
        code: userCode,
      });

      //when
      await service.signUp(userDTO);

      //then
      const accountDTO = {
        name: fullName,
        primaryDomain: userDTO.email,
        accountTypeId: AccountTypes.CONSUMER,
        onBoardingStatusId: Statuses.IN_PROGRESS,
      } as CreateAccountDto;
      expect(Fixture.getAccountService.create).toHaveBeenCalledTimes(1);
      expect(Fixture.getAccountService.create).toHaveBeenCalledWith(accountDTO);

      const orgUnitDTO = {
        name: 'All',
        googleOrgUnitId: 'id:' + userDTO.email,
        accountId: 'accountId',
        orgUnitPath: '/',
      } as CreateOrgUnitDto;
      expect(Fixture.getOrgUnitService.create).toHaveBeenCalledTimes(1);
      expect(Fixture.getOrgUnitService.create).toHaveBeenCalledWith(orgUnitDTO);

      expect(
        Fixture.getFilteredCategoryService.saveDefaultCategoriesForOrgUnit,
      ).toHaveBeenCalledTimes(1);
      expect(
        Fixture.getFilteredCategoryService.saveDefaultCategoriesForOrgUnit,
      ).toHaveBeenCalledWith(accountId, orgUnitId, null);

      const user = {
        firstName: userDTO.firstName,
        lastName: userDTO.lastName,
        email: userDTO.email,
        accountId: accountId,
        orgUnitId: orgUnitId,
        role: UserRoles.PARENT,
        statusId: Statuses.PENDING,
      } as UserDto;

      expect(Fixture.getConsumerUserService.create).toHaveBeenCalledTimes(1);
      expect(Fixture.getConsumerUserService.create).toHaveBeenCalledWith(
        expect.objectContaining(user),
      );

      const userCodeDTO = {
        userId: userId,
        codeType: CodeType.EMAIL,
      } as UserCodeDTO;
      expect(Fixture.getUserCodeService.create).toHaveBeenCalledTimes(1);
      expect(Fixture.getUserCodeService.create).toHaveBeenCalledWith(
        expect.objectContaining(userCodeDTO),
      );

      const emailObj = {
        meta: {
          userId,
          VerificationCode: userCode,
          firstName: userDTO.firstName,
          lastName: userDTO.lastName,
        },
        to: userDTO.email,
        content: {
          templateName: EmailTemplates.SignUp,
        },
      };
      expect(Fixture.getEmailService.sendEmail).toHaveBeenCalledTimes(1);
      expect(Fixture.getEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining(emailObj),
      );

      const payload = {
        userId: userId,
        accountId: accountId,
      };
      expect(
        Fixture.getJwtTokenService.generateRegistrationToken,
      ).toHaveBeenCalledTimes(1);
      expect(
        Fixture.getJwtTokenService.generateRegistrationToken,
      ).toHaveBeenCalledWith(payload);
    });
  });

  describe('Verify email', () => {
    it('Should verify email', async () => {
      //given
      const userId = 'userId';
      const accountId = 'accountId';
      const userCode = 'userCode';

      //mock dependencies
      Fixture.getUserCodeService.findOne.mockResolvedValueOnce({
        code: userCode,
        userId,
      });
      Fixture.getAccountService.findOne.mockResolvedValueOnce({
        primaryDomain: 'primaryDomain',
        name: 'name',
      });

      //when
      await service.verifyEmail(userId, accountId, userCode);

      //then
      expect(Fixture.getUserCodeService.findOne).toHaveBeenCalledTimes(1);
      expect(Fixture.getUserCodeService.findOne).toHaveBeenCalledWith(
        userId,
        CodeType.EMAIL,
      );

      expect(Fixture.getConsumerUserService.update).toHaveBeenCalledTimes(1);
      expect(Fixture.getConsumerUserService.update).toHaveBeenCalledWith(
        userId,
        { statusId: Statuses.ACTIVE },
      );
    });

    it('Should throw exception when verify email', async () => {
      //given
      const userId = 'userId';
      const userCode = 'userCode';
      const accountId = 'accountId';

      //mock dependencies
      Fixture.getUserCodeService.findOne.mockResolvedValueOnce(null);

      try {
        //when
        await service.verifyEmail(userId, accountId, userCode);
      } catch (e) {
        //then
        expect(Fixture.getUserCodeService.findOne).toHaveBeenCalledTimes(1);
        expect(Fixture.getUserCodeService.findOne).toHaveBeenCalledWith(
          userId,
          CodeType.EMAIL,
        );

        expect(Fixture.getConsumerUserService.update).toHaveBeenCalledTimes(0);

        expect(e).toBeInstanceOf(ValidationException);
        expect(e.message).toBe(UserErrors.invalidCode());
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('Resend email code', () => {
    it('Should resend email code', async () => {
      //given
      const userId = 'userId';
      const userCode = 'userCode';
      const userDTO = Fixture.getUserDTO();

      //mock dependencies
      Fixture.getUserCodeService.findOne.mockResolvedValueOnce({
        code: userCode,
        userId,
      });
      Fixture.getConsumerUserService.findOneById.mockResolvedValueOnce({
        id: userId,
        firstName: userDTO.firstName,
        lastName: userDTO.lastName,
        email: userDTO.email,
      });

      //when
      await service.resendEmailCode(userId);

      //then
      expect(Fixture.getUserCodeService.findOne).toHaveBeenCalledTimes(1);
      expect(Fixture.getUserCodeService.findOne).toHaveBeenCalledWith(
        userId,
        CodeType.EMAIL,
      );

      expect(Fixture.getConsumerUserService.findOneById).toHaveBeenCalledTimes(
        1,
      );
      expect(Fixture.getConsumerUserService.findOneById).toHaveBeenCalledWith(
        userId,
      );

      expect(Fixture.getUserCodeService.update).toHaveBeenCalledTimes(1);
      expect(Fixture.getUserCodeService.update.mock.calls[0][0]).toEqual(
        userId,
      );
      expect(Fixture.getUserCodeService.update.mock.calls[0][1]).toEqual(
        CodeType.EMAIL,
      );

      expect(Fixture.getEmailService.sendEmail).toHaveBeenCalledTimes(1);
    });

    it('Should throw exception when resend email code', async () => {
      //given
      const userId = 'userId';

      //mock dependencies
      Fixture.getUserCodeService.findOne.mockResolvedValueOnce(null);
      Fixture.getConsumerUserService.findOneById.mockResolvedValueOnce(null);

      try {
        //when
        await service.resendEmailCode(userId);
      } catch (e) {
        //then
        expect(Fixture.getUserCodeService.findOne).toHaveBeenCalledTimes(1);
        expect(Fixture.getUserCodeService.findOne).toHaveBeenCalledWith(
          userId,
          CodeType.EMAIL,
        );

        expect(
          Fixture.getConsumerUserService.findOneById,
        ).toHaveBeenCalledTimes(1);
        expect(Fixture.getConsumerUserService.findOneById).toHaveBeenCalledWith(
          userId,
        );

        expect(Fixture.getUserCodeService.update).toHaveBeenCalledTimes(0);
        expect(Fixture.getEmailService.sendEmail).toHaveBeenCalledTimes(0);

        expect(e).toBeInstanceOf(ValidationException);
        expect(e.message).toBe(UserErrors.notFound(userId));
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('Login user', () => {
    it('Should login user successfully', async () => {
      //given
      const userId = 'userId';
      const accountId = 'accountId';
      const email = 'email';
      const loginDTO = { email, password: 'password' };

      //mock dependencies
      Fixture.getConsumerUserService.findOneByEmail.mockResolvedValueOnce({
        id: userId,
        accountId,
      });

      //when
      await service.login(loginDTO);

      //then
      expect(
        Fixture.getConsumerUserService.findOneByEmail,
      ).toHaveBeenCalledTimes(1);
      expect(
        Fixture.getConsumerUserService.findOneByEmail,
      ).toHaveBeenCalledWith(email);

      const payload = { userId, accountId };
      expect(
        Fixture.getJwtTokenService.generateRegistrationToken,
      ).toHaveBeenCalledTimes(1);
      expect(
        Fixture.getJwtTokenService.generateRegistrationToken,
      ).toHaveBeenCalledWith(payload);
    });
  });

  describe('Forgot password', () => {
    it('Should reset password successfully and send password reset  email', async () => {
      //given
      const userId = 'userId';
      const email = 'email';

      //mock dependencies
      Fixture.getConsumerUserService.findOneByEmail.mockResolvedValueOnce({
        id: userId,
        email,
      });

      //when
      await service.forgotPassword(email);

      //then
      expect(
        Fixture.getConsumerUserService.findOneByEmail,
      ).toHaveBeenCalledTimes(1);
      expect(
        Fixture.getConsumerUserService.findOneByEmail,
      ).toHaveBeenCalledWith(email);

      expect(Fixture.getUserCodeService.deleteOne).toHaveBeenCalledTimes(1);
      expect(Fixture.getUserCodeService.deleteOne).toHaveBeenCalledWith(
        userId,
        CodeType.PASSWORD,
      );

      const userCodeDTO = { userId, codeType: CodeType.PASSWORD };
      expect(Fixture.getUserCodeService.create).toHaveBeenCalledTimes(1);
      expect(Fixture.getUserCodeService.create).toHaveBeenCalledWith(
        expect.objectContaining(userCodeDTO),
      );
      expect(Fixture.getEmailService.sendEmail).toHaveBeenCalledTimes(1);
    });
    it('Should throw exception when forgot password', async () => {
      //given
      const email = 'email';

      //mock dependencies
      Fixture.getConsumerUserService.findOneByEmail.mockResolvedValueOnce(null);

      try {
        //when
        await service.forgotPassword(email);
      } catch (e) {
        //then
        expect(
          Fixture.getConsumerUserService.findOneByEmail,
        ).toHaveBeenCalledTimes(1);
        expect(
          Fixture.getConsumerUserService.findOneByEmail,
        ).toHaveBeenCalledWith(email);

        expect(Fixture.getUserCodeService.deleteOne).toHaveBeenCalledTimes(0);
        expect(Fixture.getUserCodeService.create).toHaveBeenCalledTimes(0);
        expect(Fixture.getEmailService.sendEmail).toHaveBeenCalledTimes(0);

        expect(e).toBeInstanceOf(ValidationException);
        expect(e.message).toBe(UserErrors.emailNotExists(email));
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('Verify password code', () => {
    it('Should verify password code successfully when input code matches', async () => {
      //given
      const userId = 'userId';
      const email = 'email';
      const code = 'code';
      const passwordCodeDTO = { code, email };

      //mock dependencies
      Fixture.getUserCodeService.findOne.mockResolvedValueOnce({
        code,
        userId,
      });
      Fixture.getConsumerUserService.findOneByEmail.mockResolvedValueOnce({
        id: userId,
        email,
      });

      //when
      await service.verifyPasswordCode(passwordCodeDTO);

      //then
      expect(
        Fixture.getConsumerUserService.findOneByEmail,
      ).toHaveBeenCalledTimes(1);
      expect(
        Fixture.getConsumerUserService.findOneByEmail,
      ).toHaveBeenCalledWith(email);

      expect(Fixture.getUserCodeService.findOne).toHaveBeenCalledTimes(1);
      expect(Fixture.getUserCodeService.findOne).toHaveBeenCalledWith(
        userId,
        CodeType.PASSWORD,
      );
    });
    it('Should throw exception when verify password code with incorrect code', async () => {
      //given
      const userId = 'userId';
      const email = 'email';
      const code = 'code';
      const passwordCodeDTO = { code, email };

      //mock dependencies
      Fixture.getUserCodeService.findOne.mockResolvedValueOnce({
        code,
        userId,
      });
      Fixture.getConsumerUserService.findOneByEmail.mockResolvedValueOnce({
        id: userId,
        email,
      });

      try {
        //when
        await service.verifyPasswordCode(passwordCodeDTO);
      } catch (e) {
        //then
        expect(
          Fixture.getConsumerUserService.findOneByEmail,
        ).toHaveBeenCalledTimes(1);
        expect(
          Fixture.getConsumerUserService.findOneByEmail,
        ).toHaveBeenCalledWith(email);

        expect(Fixture.getUserCodeService.findOne).toHaveBeenCalledTimes(1);
        expect(Fixture.getUserCodeService.findOne).toHaveBeenCalledWith(
          userId,
          CodeType.PASSWORD,
        );

        expect(e).toBeInstanceOf(ValidationException);
        expect(e.message).toBe(UserErrors.invalidCode());
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('Reset password', () => {
    it('Should reset password successfully', async () => {
      //given
      const userId = 'userId';
      const email = 'email';
      const resetPasswordDTO = { password: 'password', email };

      //mock dependencies
      Fixture.getConsumerUserService.findOneByEmail.mockResolvedValueOnce({
        id: userId,
        email,
      });

      //when
      await service.resetPassword(resetPasswordDTO);

      //then
      expect(
        Fixture.getConsumerUserService.findOneByEmail,
      ).toHaveBeenCalledTimes(1);
      expect(
        Fixture.getConsumerUserService.findOneByEmail,
      ).toHaveBeenCalledWith(email);

      expect(Fixture.getConsumerUserService.update).toHaveBeenCalledTimes(1);
      expect(Fixture.getConsumerUserService.update.mock.calls[0][0]).toEqual(
        userId,
      );
    });
    it('Should throw exception when reset password for which user does not exists', async () => {
      //given
      const email = 'email';
      const resetPasswordDTO = { password: 'password', email };

      //mock dependencies
      Fixture.getConsumerUserService.findOneByEmail.mockResolvedValueOnce(null);

      try {
        //when
        await service.resetPassword(resetPasswordDTO);
      } catch (e) {
        //then
        expect(
          Fixture.getConsumerUserService.findOneByEmail,
        ).toHaveBeenCalledTimes(1);
        expect(
          Fixture.getConsumerUserService.findOneByEmail,
        ).toHaveBeenCalledWith(email);

        expect(Fixture.getConsumerUserService.update).toHaveBeenCalledTimes(0);

        expect(e).toBeInstanceOf(ValidationException);
        expect(e.message).toBe(UserErrors.emailNotExists(email));
        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
