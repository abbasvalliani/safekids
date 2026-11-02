import { Test, TestingModule } from '@nestjs/testing';
import { PrrNotificationService } from './prr-notification.service';
import { PrrSmsNotificationService } from './prr.sms.notification.service';
import { AccountService } from '../accounts/account.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { PrrMessageErrors } from './prr.message.errors';
import { LoggingService } from '../logger/logging.service';
import { JwtTokenService } from '../auth/jwtToken/jwt.token.service';
import { UserErrors } from '../error/users.errors';

class Fixture {
  static getMock() {
    return jest.fn();
  }

  static PrrSmsNotificationService = class {};

  static Repository = class {
    static sequelize = Fixture.getMock().mockReturnThis();
    static query = Fixture.getMock().mockReturnThis();
    static update = Fixture.getMock();
  };

  static AccountService = class {
    static findOne = Fixture.getMock();
  };

  static JwtTokenService = {
    verifyToken: jest.fn(),
  };

  static getLoggingService() {
    return {
      className: Fixture.getMock(),
      debug: Fixture.getMock(),
      info: Fixture.getMock(),
      error: Fixture.getMock(),
    };
  }

  static getEmailService() {
    return {
      saveEmail: Fixture.getMock(),
      sendEmailToUser: Fixture.getMock(),
      sendEmail: Fixture.getMock(),
    };
  }

  static getPrrLevelData() {
    return { count: 1, reduced: '10%', increased: '10%' };
  }

  static getReductionData() {
    return { date: '1', reduction: '10%' };
  }

  static getTopIntercepted() {
    return { url: 'url', sentiment: 'sentiment', category: 'category' };
  }

  static buildEventWebDetail() {
    return { webDetail: { url: 'url', sentiment: 'sentiment' } };
  }

  static getEventService() {
    return {
      getPRRLevelData: jest.fn().mockResolvedValue(Fixture.getPrrLevelData()),
      getReductionToDate: jest
        .fn()
        .mockResolvedValue(Fixture.getReductionData()),
      getPRRLevelDailyInstances: jest.fn().mockResolvedValue(5),
      getTopInterceptedEvent: jest
        .fn()
        .mockResolvedValue(Fixture.getTopIntercepted()),
      getEventsByPRRLevel: jest.fn().mockResolvedValue([]),
      getKidLastEvent: jest
        .fn()
        .mockResolvedValue(Fixture.buildEventWebDetail()),
    };
  }

  static getKidQueue() {
    return {
      kidNotificationQueue: {
        url: 'url',
        maxNumberOfMessages: 10,
        visibilityTimeout: 0,
        pollingWaitTimeMs: 1,
      },
    };
  }

  static getConfigService = {
    get: Fixture.getMock().mockReturnValue(Fixture.getKidQueue()),
  };

  static getGlobalService() {
    return {
      get: Fixture.getMock(),
    };
  }

  static buildMessage() {
    return {
      _id: '_id',
      userId: 'userId',
      kidName: 'kidName',
      read: false,
      messages: [],
      date: new Date(),
    };
  }
}

describe('Crises Management Service Unit Test', () => {
  let service: PrrNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrrNotificationService,
        {
          provide: 'PRRNOTIFICATION_REPOSITORY',
          useValue: Fixture.Repository,
        },
        {
          provide: PrrSmsNotificationService,
          useValue: Fixture.PrrSmsNotificationService,
        },
        {
          provide: AccountService,
          useValue: Fixture.AccountService,
        },
        {
          provide: LoggingService,
          useValue: Fixture.getLoggingService(),
        },
        {
          provide: JwtTokenService,
          useValue: Fixture.JwtTokenService,
        },
      ],
    }).compile();

    service = module.get<PrrNotificationService>(PrrNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Verify token', () => {
    it('Should throw exception if notification does not exists', async () => {
      //given
      const accountId = 'accountId';
      const id = 'messagedId';
      Fixture.JwtTokenService.verifyToken.mockReturnValue({ accountId, id });
      jest.spyOn(service, 'findOneByCode').mockResolvedValue(undefined);

      //when
      try {
        await service.verifyToken('');
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe(PrrMessageErrors.notFound(id));
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
        expect(Fixture.AccountService.findOne).toHaveBeenCalledTimes(0);
      }
    });

    it('Should throw exception if account does not exists', async () => {
      //given
      const accountId = 'accountId';
      const id = 'messagedId';
      Fixture.JwtTokenService.verifyToken.mockReturnValue({ accountId, id });
      jest.spyOn(service, 'findOneByCode').mockResolvedValue({ id });
      Fixture.AccountService.findOne.mockResolvedValue(undefined);

      //when
      try {
        await service.verifyToken('');
      } catch (e) {
        //then
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe(UserErrors.notFound(accountId));
        expect(e.status).toBe(HttpStatus.NOT_FOUND);
        expect(Fixture.AccountService.findOne).toHaveBeenCalledTimes(1);
      }
    });

    it('Should update account with read true', async () => {
      //given
      const accountId = 'accountId';
      const account = {
        emergencyContactName: 'ali',
        primaryDomain: 'dev',
      };
      const notification = {
        kidName: 'kidName',
        url: 'url',
        lastIntercept: 'url',
        category: 'category',
        activityTime: 'time',
      };
      const id = 'messagedId';
      Fixture.JwtTokenService.verifyToken.mockReturnValue({ accountId, id });
      jest.spyOn(service, 'findOneByCode').mockResolvedValue(notification);
      Fixture.AccountService.findOne.mockResolvedValue(account);
      Fixture.Repository.update.mockResolvedValue({});

      //when
      const response = await service.verifyToken('');

      //then
      expect(Fixture.AccountService.findOne).toHaveBeenCalledTimes(1);
      expect(Fixture.Repository.update).toHaveBeenCalledTimes(1);
      expect(Fixture.Repository.update.mock.calls[0][0]).toMatchObject({
        read: true,
      });
      expect(Fixture.Repository.update.mock.calls[0][1]).toMatchObject({
        where: { id },
      });
      const accountRes = {
        userName: account.emergencyContactName,
        schoolName: account.primaryDomain,
      };
      const notificationRes = notification;
      notificationRes.lastIntercept = notification.url;
      delete notificationRes.url;
      const expected = { ...notificationRes, ...accountRes };
      expect(response).toMatchObject(expected);
    });
  });
});
