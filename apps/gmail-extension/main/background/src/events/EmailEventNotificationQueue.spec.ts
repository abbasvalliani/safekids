import { EmailEventNotificationQueue } from './EmailEventNotificationQueue';
import { mock, instance, when, verify } from 'ts-mockito';
import { EmailEventService } from '../api/emailEventService';
import { EmailNotificationEvent, EventType } from '@shared/types/events.types';
import { NLPResultCacheData } from '../cache/NLPResultCacheData';

describe('EmailEventNotificationQueueTest', () => {
  test('send a not thread read event', async () => {
    const emailService = mock<EmailEventService>();
    jest.spyOn(emailService, 'sendEvent');

    const queue = new EmailEventNotificationQueue(emailService, 10);
    const event: EmailNotificationEvent = {
      eventTypeId: EventType.EMAIL_MESSAGE_FLAG_EVENT,
    };
    queue.put(event);
    expect(emailService.sendEvent).toHaveBeenCalledTimes(1);
    expect(emailService.sendEvent).toHaveBeenCalledWith(event);
  });

  test('send a thread read event without max messages', async () => {
    const emailService = mock<EmailEventService>();
    jest.spyOn(emailService, 'sendEvent');

    const queue = new EmailEventNotificationQueue(emailService, 10);
    const event: EmailNotificationEvent = {
      eventTypeId: EventType.EMAIL_THREAD_READ_EVENT,
    };
    queue.put(event);
    expect(emailService.sendEvent).toHaveBeenCalledTimes(0);
  });

  test('send a thread read event and sent it since max messages exceeded', async () => {
    const emailService = mock<EmailEventService>();
    jest.spyOn(emailService, 'sendEvent');

    const queue = new EmailEventNotificationQueue(emailService, 0);
    const event: EmailNotificationEvent = {
      eventTypeId: EventType.EMAIL_THREAD_READ_EVENT,
    };
    queue.put(event);
    expect(emailService.sendEvent).toHaveBeenCalledTimes(1);
    expect(emailService.sendEvent).toHaveBeenCalledWith(event);
  });

  test('flush messages after cache load success', async () => {
    const emailService = mock<EmailEventService>();
    jest.spyOn(emailService, 'sendEvent');

    const queue = new EmailEventNotificationQueue(emailService, 5);
    const event1: EmailNotificationEvent = {
      eventTypeId: EventType.EMAIL_THREAD_READ_EVENT,
      threadId: 'a',
    };
    const event2: EmailNotificationEvent = {
      eventTypeId: EventType.EMAIL_THREAD_READ_EVENT,
      threadId: 'b',
    };
    const event3: EmailNotificationEvent = {
      eventTypeId: EventType.EMAIL_THREAD_READ_EVENT,
      threadId: 'c',
    };
    const event4: EmailNotificationEvent = {
      eventTypeId: EventType.EMAIL_THREAD_READ_EVENT,
      threadId: 'd',
    };
    const event5: EmailNotificationEvent = {
      eventTypeId: EventType.EMAIL_THREAD_READ_EVENT,
      threadId: null,
    };

    queue.put(event1);
    queue.put(event2);
    queue.put(event3);
    queue.put(event4);

    const cacheData = new NLPResultCacheData('a', 'c');
    queue.onCacheLoadSuccess(cacheData);

    expect(emailService.sendEvent).toHaveBeenCalledTimes(2);
    expect(emailService.sendEvent).toHaveBeenNthCalledWith(1, event2);
    expect(emailService.sendEvent).toHaveBeenNthCalledWith(2, event4);
  });

  test('flush messages after cache load failure', async () => {
    const emailService = mock<EmailEventService>();
    jest.spyOn(emailService, 'sendEvent');

    const queue = new EmailEventNotificationQueue(emailService, 4);
    const event1: EmailNotificationEvent = {
      eventTypeId: EventType.EMAIL_THREAD_READ_EVENT,
      threadId: 'a',
    };
    const event2: EmailNotificationEvent = {
      eventTypeId: EventType.EMAIL_THREAD_READ_EVENT,
      threadId: 'b',
    };
    const event3: EmailNotificationEvent = {
      eventTypeId: EventType.EMAIL_THREAD_READ_EVENT,
      threadId: 'c',
    };
    const event4: EmailNotificationEvent = {
      eventTypeId: EventType.EMAIL_THREAD_READ_EVENT,
      threadId: 'd',
    };

    queue.put(event1);
    queue.put(event2);
    queue.put(event3);
    queue.put(event4);

    const cacheData = new NLPResultCacheData('a', 'c');
    queue.onCacheLoadFail(new Error('foo'));

    expect(emailService.sendEvent).toHaveBeenCalledTimes(4);
    expect(emailService.sendEvent).toHaveBeenNthCalledWith(1, event1);
    expect(emailService.sendEvent).toHaveBeenNthCalledWith(2, event2);
    expect(emailService.sendEvent).toHaveBeenNthCalledWith(3, event3);
    expect(emailService.sendEvent).toHaveBeenNthCalledWith(4, event4);
  });
});
