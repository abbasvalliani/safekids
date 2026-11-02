import { Test, TestingModule } from '@nestjs/testing';
import { InformPrrVisitsService } from './inform-prr-visits.service';
import { LoggingService } from '../logger/logging.service';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import { ActivityService } from '../activity/activity.service';
import { ConfigService } from '@nestjs/config';
import { Consumer } from 'sqs-consumer';
import { SQSClient } from '@aws-sdk/client-sqs';

class Fixture {
  static getMock() {
    return jest.fn();
  }
  static getUserService = class {
    static limitAccess = Fixture.getMock();
    static findOneByAccountId = Fixture.getMock();
    static findOneById = async () => {
      return { firstName: 'Kid', lastName: 'Wid' };
    };
    static findParentAccount = async () => {
      return [{ email: 'test@email.com' }];
    };
    static findUserByAccessCode = Fixture.getMock();
  };

  static getEmailService = class {
    static sendEmail = Fixture.getMock();
  };

  static getLoggingService = class {
    static className = Fixture.getMock();
    static debug = Fixture.getMock();
    static info = Fixture.getMock();
    static error = Fixture.getMock();
  };

  static getActivityService = class {
    static findUserLastActivity = Fixture.getMock();
    static deleteAll = Fixture.getMock();
    static findOneByEventId = async () => {
      return { id: 1111 };
    };
  };

  static INFORM_PRR_VISIT_REPOSITORY = class {
    static create = Fixture.getMock();
    static findAll = Fixture.getMock();
    static bulkCreate = Fixture.getMock();
  };

  static getConfigService = class {
    static _isDevelopment = Fixture.getMock().mockReturnValue(true);
    static get = Fixture.getMock().mockReturnValue(Fixture.getEventQueue());
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

describe('InformPrrVisitsService', () => {
  let service: InformPrrVisitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InformPrrVisitsService,
        {
          provide: LoggingService,
          useValue: Fixture.getLoggingService,
        },
        {
          provide: ActivityService,
          useValue: Fixture.getActivityService,
        },
        {
          provide: UserService,
          useValue: Fixture.getUserService,
        },
        {
          provide: EmailService,
          useValue: Fixture.getEmailService,
        },
        {
          provide: 'INFORM_PRR_VISIT_REPOSITORY',
          useValue: Fixture.INFORM_PRR_VISIT_REPOSITORY,
        },
        {
          provide: ConfigService,
          useValue: Fixture.getConfigService,
        },
      ],
    }).compile();

    service = module.get<InformPrrVisitsService>(InformPrrVisitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should initialize inform prr module and start polling', async () => {
    //given
    const consumer = new Consumer({
      queueUrl: 'dummy',
      handleMessage: jest.fn(),
    });
    jest.spyOn(consumer, 'start').mockReturnValueOnce();
    jest.spyOn(Consumer, 'create').mockReturnValueOnce(consumer);

    //when
    await service.onModuleInit();

    expect(consumer.start).toHaveBeenCalledTimes(1);
  });

  it('Should push inform prr event to queue', async () => {
    //given
    const time = new Date();
    const visits = [{ url: 'ok.ok', time }];
    const payload = {
      eventId: '1111',
      visits,
      userId: '222',
      accountId: '123456',
      tabId: 324235,
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

  it('Should create inform event visits', async () => {
    //given
    const time = new Date();
    const visits = [{ url: 'ok.ok', time }];
    const expected = [{ activityId: 1111, url: 'ok.ok', visitTime: time }];

    const prrDto = {
      eventId: '1111',
      visits,
      userId: '222',
      accountId: '123456',
      tabId: 324235,
    };
    //when
    await service.saveInformPrrVisits(prrDto);

    //then
    expect(Fixture.INFORM_PRR_VISIT_REPOSITORY.bulkCreate).toHaveBeenCalledWith(
      expected,
    );
    expect(Fixture.getEmailService.sendEmail).toHaveBeenCalled();
  });
});
