import { Test, TestingModule } from '@nestjs/testing';
import { KidConfigService } from '../kid-config/kid-config.service';
import { EmailService } from '../email/email.service';
import { LoggingService } from '../logger/logging.service';
import { ConfigService } from '@nestjs/config';
import { ParentEmailConfigService } from './parent-email-config.service';
import { SQSClient } from '@aws-sdk/client-sqs';
import { QueryException } from '../error/common.exception';
import { HttpStatus } from '@nestjs/common';
import { ExtensionStatus } from '../kid-config/enum/extension-status';
import { EmailTemplates } from '../email/email.templates';
import { Consumer } from 'sqs-consumer';

class Fixture {
  static getMock() {
    return jest.fn();
  }

  static getKidConfigService = class {
    static fetch = Fixture.getMock();
    static update = Fixture.getMock();
  };
  static getEmailService = class {
    static sendEmail = Fixture.getMock();
  };

  static getLoggingService() {
    return {
      className: Fixture.getMock(),
      debug: Fixture.getMock(),
      error: Fixture.getMock(),
      info: Fixture.getMock(),
    };
  }

  static getConfigService = {
    get: Fixture.getMock().mockReturnValue(Fixture.getEmailQueue()),
  };

  static getEmailQueue() {
    return {
      parentEmailQueue: {
        url: 'url',
        maxNumberOfMessages: 10,
        visibilityTimeout: 0,
        pollingWaitTimeMs: 1,
        delaySeconds: 300,
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

describe('Parent email config service test', () => {
  let service: ParentEmailConfigService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentEmailConfigService,
        {
          provide: KidConfigService,
          useValue: Fixture.getKidConfigService,
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
          provide: ConfigService,
          useValue: Fixture.getConfigService,
        },
      ],
    }).compile();

    service = module.get<ParentEmailConfigService>(ParentEmailConfigService);
  });

  it('Should handle messages in batch', async () => {
    //given
    const id = 'ID';
    const firstName = 'firstName';
    const lastName = 'lastName';
    const parentEmail = 'parentEmail';
    const messages = [
      {
        Body: JSON.stringify({
          id: id,
          firstName,
          lastName,
          parentEmail,
        }),
      },
    ];

    //mock dependencies
    Fixture.getKidConfigService.fetch.mockResolvedValueOnce({
      extensionStatus: ExtensionStatus.UNINSTALLED,
    });

    //when
    await service.handleMessages(messages);

    //then
    expect(Fixture.getKidConfigService.fetch).toHaveBeenCalledTimes(1);
    expect(Fixture.getKidConfigService.fetch).toHaveBeenCalledWith(id);

    expect(Fixture.getEmailService.sendEmail).toHaveBeenCalledTimes(1);
    expect(Fixture.getEmailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        useSupportEmail: true,
        meta: {
          kidName: `${firstName} ${lastName}`,
        },
        to: parentEmail,
        content: {
          templateName: EmailTemplates.INFORM_EXTENSION_UNINSTALL_DISABLED,
        },
      }),
    );
  });

  it('Should initialize module and start polling', async () => {
    //given
    jest.spyOn(service, 'handleMessages').mockResolvedValueOnce();
    const consumer = new Consumer({
      queueUrl: 'dummy',
      handleMessageBatch: jest.fn(),
    });
    jest.spyOn(consumer, 'start').mockReturnValueOnce();
    jest.spyOn(Consumer, 'create').mockReturnValueOnce(consumer);

    //when
    await service.onModuleInit();

    expect(consumer.start).toHaveBeenCalledTimes(1);
  });

  describe('Push parent email event to queue', () => {
    it('Should push parent email event to queue', async () => {
      //given
      const payload = {
        id: 'id',
        firstName: 'firstName',
        lastName: 'lastName',
        parentEmail: 'primaryDomain',
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
        QueueUrl: Fixture.getEmailQueue().parentEmailQueue.url,
        MessageBody: JSON.stringify(payload),
        DelaySeconds: Fixture.getEmailQueue().parentEmailQueue.delaySeconds,
      };
      expect(sqs.send).toHaveBeenCalledWith(
        expect.objectContaining({ input: expect.objectContaining(sendMessageRequest) }),
      );
    });
    it('Should throw exception when push parent email event to queue', async () => {
      //given
      const payload = {
        id: 'id',
        firstName: 'firstName',
        lastName: 'lastName',
        parentEmail: 'primaryDomain',
      };

      //mock dependencies
      (sqs.send as jest.MockedFunction<any>).mockResolvedValueOnce({
        $response: {
          error: 'some error from aws',
          httpResponse: { statusCode: 500 },
        },
      });

      //when
      service.sendMessage(payload).catch((e) => {
        //then
        expect(sqs.send).toHaveBeenCalledTimes(1);
        const sendMessageRequest = {
          QueueUrl: Fixture.getEmailQueue().parentEmailQueue.url,
          MessageBody: JSON.stringify(payload),
          DelaySeconds: Fixture.getEmailQueue().parentEmailQueue.delaySeconds,
        };
        expect(sqs.send).toHaveBeenCalledWith(
        expect.objectContaining({ input: expect.objectContaining(sendMessageRequest) }),
      );

        expect(e).toBeInstanceOf(QueryException);
        expect(e.message).toBe(QueryException.save());
        expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });
});
