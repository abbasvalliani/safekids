import { SQSClient } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { AccountService } from '../accounts/account.service';
import { UserService } from '../user/user.service';
import { PrrNotificationService } from '../prr-notification/prr-notification.service';
import { LoggingService } from '../logger/logging.service';
import { getPrrLevelName } from './prr-level-names';
import { QueryTypes } from 'sequelize';
import { ActivityTypes } from '../activity-type/default-activitytypes';
import { PrrLevels } from '../prr-level/prr-level.default';
import { PrrTriggers } from '../prr-trigger/prr-triggers.default';
import { Categories } from '../category/default-categories';
import { Statuses } from '../status/default-status';
import { AccountTypes } from '../account-type/account-type.enum';
import { EmailService } from '../email/email.service';

import { PrrActivityRequest } from '../chrome/dto/prr.activity.request';
import { PrrActivityDto } from '../chrome/dto/prr.activity.dto';
import { ActivityAiDataService } from '../activity-ai-data/activity-ai-data.service';

class Fixture {
  static getMock() {
    return jest.fn();
  }

  static Sequelize = class {
    static transaction = Fixture.getMock().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn(),
    });
  };

  static getLoggingService() {
    return {
      className: Fixture.getMock(),
      debug: Fixture.getMock(),
      info: Fixture.getMock(),
      error: Fixture.getMock(),
    };
  }

  static getFromPart(keyword: string) {
    return `FROM
                activity a
                 INNER JOIN user u  on
                   u.id = a.user_id
                 INNER JOIN category c on
                   c.id = a.prr_category_id
            WHERE
                a.account_id = :accountId
              AND (u.last_name like '%${keyword}%'
              OR u.first_name like '%${keyword}%'
              OR u.primary_email like '%${keyword}%'
              OR concat(u.first_name,' ',u.last_name) like '%${keyword}%' )
            ORDER BY
                u.last_name DESC
                `;
  }

  static getPagination() {
    return 'LIMIT :offset, :limit ;';
  }

  static getQueryOptions(accountId: string, offset: number, limit: number) {
    return {
      replacements: { accountId, offset, limit },
      type: QueryTypes.SELECT,
    };
  }

  static AccountService = class {
    static findOne = Fixture.getMock();
  };

  static PrrNotificationService = class {
    static createNotification = Fixture.getMock();
  };

  static UserService = class {
    static findOneById = Fixture.getMock();
    static findParentAccount = Fixture.getMock();
  };

  static getEmailService = class {
    static sendEmail = Fixture.getMock();
  };

  static ACTIVITY_REPOSITORY = class {
    static sequelize = { query: jest.fn() };
    static create = Fixture.getMock();
  };

  static getPrrInfo(level: string) {
    return {
      lastName: 'lastName',
      firstName: 'firstName',
      email: 'email',
      interceptionDate: new Date(),
      urlAttempted: 'urlAttempted',
      category: 'category',
      prrLevel: level,
    };
  }
  static getSelectPart() {
    return `SELECT
                             u.last_name     as lastName,
                             u.first_name    as firstName,
                             u.primary_email as email,
                             a.activity_time as interceptionDate,
                             a.web_url       as urlAttempted,
                             a.prr_category_id as category,
                             a.prr_level_id  as prrLevel`;
  }

  static getConfigService = class {
    static _isDevelopment = Fixture.getMock().mockReturnValue(true);
    static get = Fixture.getMock().mockReturnValue(Fixture.getEventQueue());
  };

  static getActivityAiDataService = class {
    static create = Fixture.getMock();
  };

  static getEventQueue() {
    return {
      kidActivity: {
        url: 'url',
        maxNumberOfMessages: 10,
        visibilityTimeout: 0,
        pollingWaitTimeMs: 1,
        delaySeconds: 0,
        consumerCount: 1,
      },
    };
  }
}

// AWS SDK v3: one shared client whose send() resolves the command.
jest.mock('@aws-sdk/client-sqs', () => {
  const SQSMocked = { send: jest.fn() };
  return {
    SQSClient: jest.fn(() => SQSMocked),
    SendMessageCommand: jest.fn((input) => ({ input })),
  };
});
const sqs = new SQSClient({
  region: 'us-east-1',
});

describe('Activity service test', () => {
  let service: ActivityService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: AccountService,
          useValue: Fixture.AccountService,
        },
        {
          provide: PrrNotificationService,
          useValue: Fixture.PrrNotificationService,
        },
        {
          provide: UserService,
          useValue: Fixture.UserService,
        },
        {
          provide: EmailService,
          useValue: Fixture.getEmailService,
        },
        {
          provide: LoggingService,
          useValue: Fixture.getLoggingService(),
        },
        {
          provide: 'ACTIVITY_REPOSITORY',
          useValue: Fixture.ACTIVITY_REPOSITORY,
        },
        {
          provide: 'SEQUELIZE',
          useValue: Fixture.Sequelize,
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
          provide: ConfigService,
          useValue: Fixture.getConfigService,
        },
        {
          provide: ActivityAiDataService,
          useValue: Fixture.getActivityAiDataService,
        },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  describe('Search students', () => {
    it('Should search students with default limit and offset and return data with total count', async () => {
      //given
      const keyword = 'data';
      const timezone = 'Asia/karachi';
      const accountId = 'accountId';
      const level = '1';
      const prrInfo = Fixture.getPrrInfo(level);
      const count = 5;
      jest
        .spyOn(Fixture.ACTIVITY_REPOSITORY.sequelize, 'query')
        .mockResolvedValueOnce([prrInfo]);
      jest
        .spyOn(Fixture.ACTIVITY_REPOSITORY.sequelize, 'query')
        .mockResolvedValueOnce([{ count }]);

      //when
      const response = await service.searchStudents(
        undefined,
        undefined,
        keyword,
        timezone,
        accountId,
      );

      //then
      expect(response).toBeTruthy();
      expect(response.totalCount).toBe(count);
      expect(response.data.length).toBe(1);
      prrInfo.prrLevel = getPrrLevelName(level);
      expect(response.data[0]).toMatchObject(prrInfo);
      const dataSelect = Fixture.getSelectPart();
      const dataQuery = `${dataSelect} ${Fixture.getFromPart(keyword)} ${Fixture.getPagination()}`;
      expect(
        Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][0],
      ).toEqual(dataQuery);
      expect(
        Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][1],
      ).toEqual(Fixture.getQueryOptions(accountId, 0, 15));
    });

    it('Should search students with provided limit and offset and return data with total count', async () => {
      //given
      const keyword = 'data';
      const timezone = 'Asia/karachi';
      const accountId = 'accountId';
      const level = '3';
      const prrInfo = Fixture.getPrrInfo(level);
      const count = 15;
      const offset = 3;
      const limit = 20;
      jest
        .spyOn(Fixture.ACTIVITY_REPOSITORY.sequelize, 'query')
        .mockResolvedValueOnce([prrInfo]);
      jest
        .spyOn(Fixture.ACTIVITY_REPOSITORY.sequelize, 'query')
        .mockResolvedValueOnce([{ count }]);

      //when
      const response = await service.searchStudents(
        offset,
        limit,
        keyword,
        timezone,
        accountId,
      );

      //then
      expect(response).toBeTruthy();
      expect(response.totalCount).toBe(count);
      expect(response.data.length).toBe(1);
      prrInfo.prrLevel = getPrrLevelName(level);
      expect(response.data[0]).toMatchObject(prrInfo);
      const dataSelect = Fixture.getSelectPart();
      const dataQuery = `${dataSelect} ${Fixture.getFromPart(keyword)} ${Fixture.getPagination()}`;
      expect(
        Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][0],
      ).toEqual(dataQuery);
      expect(
        Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][1],
      ).toEqual(Fixture.getQueryOptions(accountId, offset * 15, limit));
    });
  });

  describe('Autocomplete search', () => {
    it('Should search students with default limit and offset and return data with name and email with total count', async () => {
      //given
      const keyword = 'data';
      const accountId = 'accountId';
      jest
        .spyOn(Fixture.ACTIVITY_REPOSITORY.sequelize, 'query')
        .mockResolvedValueOnce([]);

      //when
      const response = await service.autocompleteSearch(
        undefined,
        undefined,
        keyword,
        accountId,
      );

      //then
      expect(response).toBeTruthy();
      expect(response.length).toBe(0);
      const dataSelect = `SELECT
                             DISTINCT(u.primary_email) as email,
                             u.last_name     as lastName,
                             u.first_name    as firstName`;
      const dataQuery = `${dataSelect} ${Fixture.getFromPart(keyword)} ${Fixture.getPagination()}`;
      expect(
        Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][0],
      ).toEqual(dataQuery);
      expect(
        Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][1],
      ).toEqual(Fixture.getQueryOptions(accountId, 0, 15));
    });
  });

  describe('Download activity', () => {
    it('Should return csv parsed data if records were found for search criteria ', async () => {
      //given
      const keyword = 'data';
      const timezone = 'Asia/karachi';
      const accountId = 'accountId';
      const level = '3';
      const prrInfo = Fixture.getPrrInfo(level);
      jest
        .spyOn(Fixture.ACTIVITY_REPOSITORY.sequelize, 'query')
        .mockResolvedValueOnce([prrInfo]);

      //when
      const response = await service.downloadActivity(
        keyword,
        timezone,
        accountId,
      );

      //then
      expect(response).toBeTruthy();
      const dataSelect = Fixture.getSelectPart();
      const dataQuery = `${dataSelect} ${Fixture.getFromPart(keyword)}`;
      expect(
        Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][0],
      ).toEqual(dataQuery);
      const queryOptions = {
        replacements: { accountId },
        type: QueryTypes.SELECT,
      };
      expect(
        Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][1],
      ).toEqual(queryOptions);
    });

    it('Should return nothing if no records were found for search criteria ', async () => {
      //given
      const keyword = 'data';
      const timezone = 'Asia/karachi';
      const accountId = 'accountId';
      jest
        .spyOn(Fixture.ACTIVITY_REPOSITORY.sequelize, 'query')
        .mockResolvedValueOnce([]);

      //when
      const response = await service.downloadActivity(
        keyword,
        timezone,
        accountId,
      );

      //then
      expect(response).toBeFalsy();
      const dataSelect = Fixture.getSelectPart();
      const dataQuery = `${dataSelect} ${Fixture.getFromPart(keyword)}`;
      expect(
        Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][0],
      ).toEqual(dataQuery);
      const queryOptions = {
        replacements: { accountId },
        type: QueryTypes.SELECT,
      };
      expect(
        Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][1],
      ).toEqual(queryOptions);
    });
  });
  describe('Send Message to Queue', () => {
    it('Should push kid activity to queue', async () => {
      //given
      const time = new Date();
      //given
      const prrDTO = {
        prrActivityTypeId: ActivityTypes.PRR_TRIGGER,
        webUrl: 'www.guns.com',
        fullWebUrl: 'https://okikoky.com',
        prrLevelId: PrrLevels.THREE,
        prrTriggerId: PrrTriggers.AI_NLP_VISION,
        prrCategoryId: Categories.WEAPONS,
        webCategoryId: Categories.WEAPONS,
        webActivityTypeId: ActivityTypes.PRR_TRIGGER,
        userDeviceLinkId: '54689ac3-6500-41eb-956f-396a0e26ccf9',
        mlVersion: '0.0.4',
        nlpVersion: '0.0.27',
        extensionVersion: '1.1.9',
        browser: 'Chrome',
        browserVersion: '106',
        isOffDay: false,
        isOffTime: false,
        statusId: Statuses.ACTIVE,
        activityTime: new Date(),
        userId: 'userId',
        teacherId: null,
        accountId: 'accountId',
      };
      //given
      const prrDTO1 = {
        prrActivityTypeId: ActivityTypes.PRR_TRIGGER,
        webUrl: 'www.facebook.com',
        fullWebUrl: 'https://facebook.com',
        prrLevelId: PrrLevels.THREE,
        prrTriggerId: PrrTriggers.AI_NLP_VISION,
        prrCategoryId: Categories.SOCIAL_NETWORKING,
        webCategoryId: Categories.SOCIAL_NETWORKING,
        webActivityTypeId: ActivityTypes.PRR_TRIGGER,
        userDeviceLinkId: '54689ac3-6500-41eb-956f-396a0e26ccf9',
        mlVersion: '0.0.4',
        nlpVersion: '0.0.27',
        extensionVersion: '1.1.9',
        browser: 'Chrome',
        browserVersion: '106',
        isOffDay: false,
        isOffTime: false,
        statusId: Statuses.ACTIVE,
        activityTime: new Date(),
        userId: 'userId',
        teacherId: null,
        accountId: 'accountId',
      };
      const token = {
        deviceLinkId: '1dfa3252356',
        userId: '3251235135fwasfddsaf',
        deviceId: '41235235egwertgwet',
        accountId: '14523521sdgsdgdg',
        email: 'test@email.com',
        userDeviceLinkId: '1241463246sdfasdg',
      };
      const payload: PrrActivityRequest = {
        activities: [prrDTO, prrDTO1] as PrrActivityDto[],
        token,
        type: 'ACTIVITY',
      };

      //mock dependencies
      (sqs.send as jest.MockedFunction<any>).mockResolvedValueOnce({
        $response: { error: null, httpResponse: { statusCode: 200 } },
      });

      //when
      await service.sendMessage(payload);

      //then
      expect(sqs.send).toHaveBeenCalledTimes(1);
      const sendMessageRequest = {
        QueueUrl: Fixture.getEventQueue().kidActivity.url,
        MessageBody: JSON.stringify(payload),
        DelaySeconds: Fixture.getEventQueue().kidActivity.delaySeconds,
      };
      expect(sqs.send).toHaveBeenCalledWith(
        expect.objectContaining({ input: expect.objectContaining(sendMessageRequest) }),
      );
    });
  });
  describe('Send Message to Queue', () => {
    it('Should push kid activity to queue', async () => {
      //given
      const time = new Date();
      //given
      const prrDTO = {
        prrActivityTypeId: ActivityTypes.PRR_TRIGGER,
        webUrl: 'www.guns.com',
        fullWebUrl: 'https://okikoky.com',
        prrLevelId: PrrLevels.THREE,
        prrTriggerId: PrrTriggers.AI_NLP_VISION,
        prrCategoryId: Categories.WEAPONS,
        webCategoryId: Categories.WEAPONS,
        webActivityTypeId: ActivityTypes.PRR_TRIGGER,
        userDeviceLinkId: '54689ac3-6500-41eb-956f-396a0e26ccf9',
        mlVersion: '0.0.4',
        nlpVersion: '0.0.27',
        extensionVersion: '1.1.9',
        browser: 'Chrome',
        browserVersion: '106',
        isOffDay: false,
        isOffTime: false,
        statusId: Statuses.ACTIVE,
        activityTime: new Date(),
        userId: 'userId',
        teacherId: null,
        accountId: 'accountId',
      };
      //given
      const prrDTO1 = {
        prrActivityTypeId: ActivityTypes.PRR_TRIGGER,
        webUrl: 'www.facebook.com',
        fullWebUrl: 'https://facebook.com',
        prrLevelId: PrrLevels.THREE,
        prrTriggerId: PrrTriggers.AI_NLP_VISION,
        prrCategoryId: Categories.SOCIAL_NETWORKING,
        webCategoryId: Categories.SOCIAL_NETWORKING,
        webActivityTypeId: ActivityTypes.PRR_TRIGGER,
        userDeviceLinkId: '54689ac3-6500-41eb-956f-396a0e26ccf9',
        mlVersion: '0.0.4',
        nlpVersion: '0.0.27',
        extensionVersion: '1.1.9',
        browser: 'Chrome',
        browserVersion: '106',
        isOffDay: false,
        isOffTime: false,
        statusId: Statuses.ACTIVE,
        activityTime: new Date(),
        userId: 'userId',
        teacherId: null,
        accountId: 'accountId',
      };
      const token = {
        deviceLinkId: '1dfa3252356',
        userId: '3251235135fwasfddsaf',
        deviceId: '41235235egwertgwet',
        accountId: '14523521sdgsdgdg',
        email: 'test@email.com',
        userDeviceLinkId: '1241463246sdfasdg',
      };
      const payload: PrrActivityRequest = {
        activities: [prrDTO, prrDTO1] as PrrActivityDto[],
        token,
        type: 'ACTIVITY',
      };

      //mock dependencies
      (sqs.send as jest.MockedFunction<any>).mockResolvedValueOnce({
        $response: { error: null, httpResponse: { statusCode: 200 } },
      });

      //when
      await service.sendMessage(payload);

      //then
      expect(sqs.send).toHaveBeenCalledTimes(1);
      const sendMessageRequest = {
        QueueUrl: Fixture.getEventQueue().kidActivity.url,
        MessageBody: JSON.stringify(payload),
        DelaySeconds: Fixture.getEventQueue().kidActivity.delaySeconds,
      };
      expect(sqs.send).toHaveBeenCalledWith(
        expect.objectContaining({ input: expect.objectContaining(sendMessageRequest) }),
      );
    });
  });

  describe('Save activity', () => {
    it('Should save activity and send email for consumer user', async () => {
      //given
      const prrDTO = {
        prrActivityTypeId: ActivityTypes.PRR_TRIGGER,
        webUrl: 'www.guns.com',
        fullWebUrl: 'https://okikoky.com',
        prrLevelId: PrrLevels.THREE,
        prrTriggerId: PrrTriggers.AI_NLP_VISION,
        prrCategoryId: Categories.WEAPONS,
        webCategoryId: Categories.WEAPONS,
        webActivityTypeId: ActivityTypes.PRR_TRIGGER,
        userDeviceLinkId: '54689ac3-6500-41eb-956f-396a0e26ccf9',
        mlVersion: '0.0.4',
        nlpVersion: '0.0.27',
        extensionVersion: '1.1.9',
        browser: 'Chrome',
        browserVersion: '106',
        isOffDay: false,
        isOffTime: false,
        statusId: Statuses.ACTIVE,
        activityTime: new Date(),
        userId: 'userId',
        teacherId: 'teacherId',
        accountId: 'accountId',
      };

      //mock dependencies
      const user = {
        id: 'userId',
        email: 'user@gmail.com',
        firstName: 'firstName',
        lastName: 'lastName',
        orgUnitId: 'orgUnitId',
        accountId: 'accountId',
      };
      const teacher = {
        firstName: 'firstName',
        lastName: 'lastName',
      };
      const account = {
        id: 'id',
        accountTypeId: AccountTypes.CONSUMER,
        emergencyContactName: 'parent',
        emergencyContactPhone: '+923101797979',
      };

      const parentEmail = 'parent@gmail.com';
      Fixture.UserService.findOneById.mockResolvedValueOnce(user);
      Fixture.AccountService.findOne.mockResolvedValueOnce(account);
      Fixture.AccountService.findOne.mockResolvedValueOnce(account);
      Fixture.UserService.findOneById.mockResolvedValueOnce(teacher);
      Fixture.UserService.findOneById.mockResolvedValueOnce(user);
      Fixture.UserService.findParentAccount.mockResolvedValueOnce([
        { email: parentEmail },
      ]);
      Fixture.AccountService.findOne.mockResolvedValueOnce({
        accountTypeId: AccountTypes.CONSUMER,
      });

      //when
      await service.savePrrActivity(prrDTO);

      //then
      expect(Fixture.UserService.findOneById).toHaveBeenCalledTimes(2);
      expect(Fixture.UserService.findParentAccount).toHaveBeenCalledTimes(1);
      expect(Fixture.UserService.findParentAccount).toHaveBeenCalledWith(
        user.accountId,
      );
      expect(Fixture.getEmailService.sendEmail).toHaveBeenCalledTimes(1);
    });
    it('Should save activity and send sms for school user', async () => {
      //given
      const prrDTO = {
        prrActivityTypeId: ActivityTypes.PRR_TRIGGER,
        webUrl: 'www.guns.com',
        fullWebUrl: 'https://okikoky.com',
        prrLevelId: PrrLevels.THREE,
        prrTriggerId: PrrTriggers.AI_NLP_VISION,
        prrCategoryId: Categories.WEAPONS,
        webCategoryId: Categories.WEAPONS,
        webActivityTypeId: ActivityTypes.PRR_TRIGGER,
        userDeviceLinkId: '54689ac3-6500-41eb-956f-396a0e26ccf9',
        mlVersion: '0.0.4',
        nlpVersion: '0.0.27',
        extensionVersion: '1.1.9',
        browser: 'Chrome',
        browserVersion: '106',
        isOffDay: false,
        isOffTime: false,
        statusId: Statuses.ACTIVE,
        activityTime: new Date(),
        userId: 'userId',
        teacherId: null,
        accountId: 'accountId',
      };

      //mock dependencies
      const user = {
        id: 'userId',
        email: 'user@gmail.com',
        firstName: 'firstName',
        lastName: 'lastName',
        orgUnitId: 'orgUnitId',
        accountId: 'accountId',
      };
      const account = {
        id: 'id',
        accountTypeId: AccountTypes.SCHOOL,
        emergencyContactName: 'parent',
        emergencyContactPhone: '+923101797979',
      };
      Fixture.AccountService.findOne.mockResolvedValueOnce(account);
      Fixture.AccountService.findOne.mockResolvedValueOnce(account);
      Fixture.UserService.findOneById.mockResolvedValueOnce(user);
      Fixture.AccountService.findOne.mockResolvedValueOnce(account);
      Fixture.ACTIVITY_REPOSITORY.create.mockResolvedValueOnce({
        id: 'activityId',
      });

      //when
      await service.savePrrActivity(prrDTO);

      //then
      expect(Fixture.UserService.findOneById).toHaveBeenCalledTimes(1);
      expect(Fixture.AccountService.findOne).toHaveBeenCalledTimes(2);
      expect(
        Fixture.PrrNotificationService.createNotification,
      ).toHaveBeenCalledTimes(1);
    });
    it('Should save activity and dont send sms or email', async () => {
      //given
      const prrDTO = {
        prrActivityTypeId: ActivityTypes.PRR_TRIGGER,
        webUrl: 'www.guns.com',
        fullWebUrl: 'https://okikoky.com',
        prrLevelId: PrrLevels.THREE,
        prrTriggerId: PrrTriggers.AI_NLP_VISION,
        prrCategoryId: Categories.WEAPONS,
        webCategoryId: Categories.WEAPONS,
        webActivityTypeId: ActivityTypes.PRR_TRIGGER,
        userDeviceLinkId: '54689ac3-6500-41eb-956f-396a0e26ccf9',
        mlVersion: '0.0.4',
        nlpVersion: '0.0.27',
        extensionVersion: '1.1.9',
        browser: 'Chrome',
        browserVersion: '106',
        isOffDay: false,
        isOffTime: false,
        statusId: Statuses.ACTIVE,
        activityTime: new Date(),
        userId: 'userId',
        teacherId: null,
        accountId: 'accountId',
        isAIGenerated: true,
      };

      //mock dependencies
      const user = {
        id: 'userId',
        email: 'user@gmail.com',
        firstName: 'firstName',
        lastName: 'lastName',
        orgUnitId: 'orgUnitId',
        accountId: 'accountId',
      };
      const account = {
        id: 'id',
        accountTypeId: AccountTypes.SCHOOL,
        emergencyContactName: 'parent',
        emergencyContactPhone: '+923101797979',
      };
      Fixture.AccountService.findOne.mockResolvedValueOnce(account);
      Fixture.UserService.findOneById.mockResolvedValueOnce(user);
      Fixture.UserService.findOneById.mockResolvedValueOnce(user);
      Fixture.ACTIVITY_REPOSITORY.create.mockResolvedValueOnce({
        id: 'activityId',
      });

      //when
      await service.savePrrActivity(prrDTO);

      //then
      expect(Fixture.UserService.findOneById).toHaveBeenCalledTimes(1);
      expect(Fixture.AccountService.findOne).toHaveBeenCalledTimes(1);
      expect(
        Fixture.PrrNotificationService.createNotification,
      ).toHaveBeenCalledTimes(0);
      expect(Fixture.getEmailService.sendEmail).toHaveBeenCalledTimes(0);
    });
  });

  describe('Save bulk activity', () => {
    it('Should save bulk activities and send email for consumer user', async () => {
      //given
      const prrDTO = {
        prrActivityTypeId: ActivityTypes.PRR_TRIGGER,
        webUrl: 'www.guns.com',
        fullWebUrl: 'https://okikoky.com',
        prrLevelId: PrrLevels.THREE,
        prrTriggerId: PrrTriggers.AI_NLP_VISION,
        prrCategoryId: Categories.WEAPONS,
        webCategoryId: Categories.WEAPONS,
        webActivityTypeId: ActivityTypes.PRR_TRIGGER,
        userDeviceLinkId: '54689ac3-6500-41eb-956f-396a0e26ccf9',
        mlVersion: '0.0.4',
        nlpVersion: '0.0.27',
        extensionVersion: '1.1.9',
        browser: 'Chrome',
        browserVersion: '106',
        isOffDay: false,
        isOffTime: false,
        statusId: Statuses.ACTIVE,
        activityTime: new Date(),
        userId: 'userId',
        teacherId: 'teacherId',
        accountId: 'accountId',
      };
      const token = {
        deviceLinkId: '1dfa3252356',
        userId: '3251235135fwasfddsaf',
        deviceId: '41235235egwertgwet',
        accountId: '14523521sdgsdgdg',
        email: 'test@email.com',
        userDeviceLinkId: '1241463246sdfasdg',
      };
      const prrActivityRequest: PrrActivityRequest = {
        activities: [prrDTO] as PrrActivityDto[],
        token,
        type: 'ACTIVITY',
      };

      //mock dependencies
      const user = {
        id: 'userId',
        email: 'user@gmail.com',
        firstName: 'firstName',
        lastName: 'lastName',
        orgUnitId: 'orgUnitId',
        accountId: 'accountId',
      };
      const teacher = {
        firstName: 'firstName',
        lastName: 'lastName',
      };
      const account = {
        id: 'id',
        accountTypeId: AccountTypes.CONSUMER,
      };

      const parentEmail = 'parent@gmail.com';
      Fixture.AccountService.findOne.mockResolvedValueOnce(account);
      Fixture.UserService.findOneById.mockResolvedValueOnce(user);
      Fixture.UserService.findOneById.mockResolvedValueOnce(teacher);
      Fixture.UserService.findParentAccount.mockResolvedValue([
        { email: parentEmail },
      ]);
      Fixture.AccountService.findOne.mockResolvedValueOnce(account);
      Fixture.ACTIVITY_REPOSITORY.create.mockResolvedValueOnce({
        id: 'activityId',
      });
      //when
      await service.savePrrActivityInBulk(prrActivityRequest);

      //then
      expect(Fixture.UserService.findOneById).toHaveBeenCalledTimes(2);
    });
  });

  it('Should find top categories for account', async () => {
    //given
    const accountId = 'accountId';
    const startDate = new Date();
    const endDate = new Date();

    //mock dependencies
    Fixture.ACTIVITY_REPOSITORY.sequelize.query.mockResolvedValueOnce([
      { category: 'abc', count: 2 },
    ]);

    //when
    await service.findTopCategoriesByAccount(accountId, startDate, endDate);

    //then
    const query =
      'select ' +
      'ca.name as category, ' +
      'COUNT(*) as count ' +
      'from ' +
      'activity a ' +
      'inner join category ca on ' +
      'ca.id = a.prr_category_id ' +
      'where ' +
      'ca.enabled = 1 ' +
      'and is_offday = false ' +
      'and is_offtime = false ' +
      'and a.account_id = :accountId ' +
      'and DATE(activity_time) between DATE(:start) and DATE(:end) ' +
      'and prr_level_id is not null ' +
      'group by ' +
      'prr_category_id ' +
      'order by ' +
      'count desc ' +
      'limit :limit;';
    expect(
      Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][0],
    ).toEqual(query);
    const queryOptions = {
      replacements: {
        accountId: accountId,
        start: startDate,
        end: endDate,
        limit: 5,
      },
      type: QueryTypes.SELECT,
      mapToModel: true,
    };
    expect(
      Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][1],
    ).toEqual(queryOptions);
  });

  it('Should find top categories for user', async () => {
    //given
    const userId = 'userId';
    const startDate = new Date();
    const endDate = new Date();

    //mock dependencies
    Fixture.ACTIVITY_REPOSITORY.sequelize.query.mockResolvedValueOnce([
      { category: 'abc', count: 2 },
    ]);

    //when
    await service.findTopCategoriesByUser(userId, startDate, endDate);

    //then
    const query =
      'select ' +
      'ca.name as name, ' +
      'COUNT(*) as count ' +
      'from ' +
      'activity a ' +
      'inner join category ca on ' +
      'ca.id = a.prr_category_id ' +
      'where ' +
      'ca.enabled = 1 ' +
      'and is_offday = false ' +
      'and is_offtime = false ' +
      'and a.user_id = :userId ' +
      'and DATE(activity_time) between DATE(:start) and DATE(:end) ' +
      'and prr_level_id is not null ' +
      'group by ' +
      'prr_category_id ' +
      'order by ' +
      'count desc ' +
      'limit :limit;';
    expect(
      Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][0],
    ).toEqual(query);
    const queryOptions = {
      replacements: {
        userId,
        start: startDate,
        end: endDate,
        limit: 5,
      },
      type: QueryTypes.SELECT,
      mapToModel: true,
    };
    expect(
      Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][1],
    ).toEqual(queryOptions);
  });

  it('Should find all prr level counts for user', async () => {
    //given
    const userId = 'userId';
    const startDate = new Date();
    const endDate = new Date();

    //mock dependencies
    Fixture.ACTIVITY_REPOSITORY.sequelize.query.mockResolvedValueOnce([
      { level: 3, counts: 2 },
    ]);

    //when
    await service.findAllPrrLevelsCount(userId, startDate, endDate);

    //then
    const query =
      'SELECT COUNT(*) AS counts, l.id AS level ' +
      'FROM activity a ' +
      'INNER JOIN prr_level l ON l.id = a.prr_level_id ' +
      'WHERE a.user_id = :userId ' +
      'AND DATE(activity_time) BETWEEN DATE(:start) AND DATE(:end) ' +
      'GROUP BY prr_level_id ' +
      'ORDER BY prr_level_id ASC';
    expect(
      Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][0],
    ).toEqual(query);
    const queryOptions = {
      replacements: {
        userId,
        start: startDate,
        end: endDate,
      },
      type: QueryTypes.SELECT,
      mapToModel: true,
    };
    expect(
      Fixture.ACTIVITY_REPOSITORY.sequelize.query.mock.calls[0][1],
    ).toEqual(queryOptions);
  });
});
