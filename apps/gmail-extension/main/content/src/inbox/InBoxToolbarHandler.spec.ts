import { IInboxDialogs } from './InboxDialogs';
import { IInboxEventHandler } from './InBoxEventHandler';
import { FlagOption } from '../InBoxSdkHandler';
import {
  ComposeView,
  MessageView,
  ThreadRowView,
  ThreadView,
  ToolbarButtonOnClickEvent,
} from '@inboxsdk/core';
import {
  mock,
  instance,
  when,
  verify,
  anything,
  deepEqual,
  capture,
} from 'ts-mockito';
import { InBoxToolbarHandler } from './InBoxToolbarHandler';
import {
  threadUnkindMessageCSS,
  threadUnkindMessageLabel,
} from './InBoxLabels';
import {
  EmailNotificationEvent,
  EventType,
  Flag,
} from '@shared/types/events.types';
import { EmailMessage } from '@shared/types/EmailMessage';

function createClassFromType<T>(defaults: Partial<T>): new () => T {
  return class {
    constructor() {
      Object.assign(this, defaults);
    }
  } as any;
}

const mockContentCommunicator = {
  handleMLEmailEvent: jest.fn(
    (a): Promise<boolean> => new Promise((resolve) => resolve(true)),
  ),
  isToxicAsync: jest.fn(
    (a, b, c, d, e): Promise<boolean> =>
      new Promise((resolve) => resolve(true)),
  ),
  getToxicMLThreadStatus: jest.fn(
    (a): Promise<boolean[] | null> =>
      new Promise((resolve) => {
        const ret = [];
        for (let i = 0; i < a.length; i++) {
          if (a[i] === '1234') {
            ret.push(true);
          } else {
            ret.push(false);
          }
        }
        resolve(ret);
      }),
  ),
  handleUserFeedback: jest.fn(
    (a, b, c, d): Promise<void> => new Promise((resolve) => resolve()),
  ),
  notifyActivity: jest.fn(
    (a): Promise<void> => new Promise((resolve) => resolve()),
  ),
};

describe('content => single method calls', () => {
  test('getThreadMLToxicFlags', async () => {
    const setup = mockToolbarHandler(FlagOption.INAPPROPRIATE);
    const {
      handler,
      mockContentCommunicator,
      instanceEventHandler,
      instanceDialogs,
    } = setup;
    const threadIDs = ['a', 'b', 'c'];

    jest.spyOn(mockContentCommunicator, 'getToxicMLThreadStatus');
    jest
      .spyOn(mockContentCommunicator, 'getToxicMLThreadStatus')
      .mockImplementation(
        () => new Promise((resolve) => resolve([true, false])),
      );

    const result = await handler.getThreadMLToxicFlags(threadIDs);
    expect(
      mockContentCommunicator.getToxicMLThreadStatus,
    ).toHaveBeenCalledTimes(1);
    expect(mockContentCommunicator.getToxicMLThreadStatus).toHaveBeenCalledWith(
      ['a', 'b', 'c'],
    );
    expect(result).toStrictEqual([true, false]);
  });

  test('getThreadIDs', async () => {
    const setup = mockToolbarHandler(FlagOption.INAPPROPRIATE);
    const { handler, mockContentCommunicator } = setup;
    const subject = 'Test';
    const htmlNode = mockHTMLTextNode(subject, false);
    const {
      instanceThreadRowView: instanceThreadRowView1,
      mockThreadRowView: mockThreadRowView1,
    } = mockThreadRowView('1234', subject, htmlNode, false);
    const {
      instanceThreadRowView: instanceThreadRowView2,
      mockThreadRowView: mockThreadRowView2,
    } = mockThreadRowView('5678', subject, htmlNode, false);
    const threadIDs = await handler.getThreadIDs([
      instanceThreadRowView1,
      instanceThreadRowView2,
    ]);
    expect(threadIDs).toStrictEqual(['1234', '5678']);
  });
});

describe('content => InBoxToolbarHandler', () => {
  test('test event handler notifications', async () => {
    const setup = mockToolbarHandler(FlagOption.INAPPROPRIATE);
    const { mockEventHandler, instanceEventHandler } = setup;
    const subject = 'toxic subject';
    const htmlNode = mockHTMLTextNode(subject, false);
    const {
      instanceThreadRowView: instanceThreadRowView1,
      mockThreadRowView: mockThreadRowView1,
    } = mockThreadRowView('1234', subject, htmlNode, false);
    const {
      instanceThreadRowView: instanceThreadRowView2,
      mockThreadRowView: mockThreadRowView2,
    } = mockThreadRowView('5678', subject, htmlNode, false);
    const { mockToolbar, instanceMockToolBar } = mockToolbarEvents(
      [instanceThreadRowView1, instanceThreadRowView2],
      [],
    );

    jest.spyOn(mockEventHandler, 'notifyActivity');
    await setup.handler.handleToolbarButtonClick(instanceMockToolBar);

    verify(mockEventHandler.notifyActivity(anything())).twice();

    const firstEvent: EmailNotificationEvent = {
      eventTypeId: EventType.EMAIL_THREAD_FLAG_EVENT,
      threadId: '1234',
      messageId: null,
      mlFlag: Flag.UNKIND,
      prrAction: 'THREAD_ACTION_ITS_UNKIND',
      prrMessage: "Yes, it's unkind",
      prrTriggered: true,
      userFlag: Flag.UNKIND,
      emailMessage: new EmailMessage(
        null,
        null,
        subject,
        null,
        undefined,
        undefined,
      ),
    };

    const secondEvent: EmailNotificationEvent = {
      eventTypeId: EventType.EMAIL_THREAD_FLAG_EVENT,
      threadId: '5678',
      messageId: null,
      mlFlag: Flag.KIND,
      prrAction: 'THREAD_ACTION_ITS_UNKIND',
      prrMessage: "Yes, it's unkind",
      prrTriggered: true,
      userFlag: Flag.UNKIND,
      emailMessage: new EmailMessage(
        null,
        null,
        subject,
        null,
        undefined,
        undefined,
      ),
    };

    // const [actualArgs] = capture(setup.mockEventHandler.notifyActivity).last();
    // const test = actualArgs;
    // console.log(test)

    verify(setup.mockEventHandler.notifyActivity(deepEqual(firstEvent))).once();
    verify(
      setup.mockEventHandler.notifyActivity(deepEqual(secondEvent)),
    ).once();
  });

  test('single thread view message clean->flag', async () => {
    const setup = mockToolbarHandler(FlagOption.INAPPROPRIATE);
    const subject = 'toxic subject';
    const htmlNode = mockHTMLTextNode(subject, false);
    const {
      instanceThreadRowView: instanceThreadRowView1,
      mockThreadRowView: mockThreadRowView1,
    } = mockThreadRowView('1234', subject, htmlNode, false);
    const { mockToolbar, instanceMockToolBar } = mockToolbarEvents(
      [instanceThreadRowView1],
      [],
    );

    jest.spyOn(mockThreadRowView1, 'addLabel');
    await setup.handler.handleToolbarButtonClick(instanceMockToolBar);

    verify(mockThreadRowView1.addLabel(anything())).once();
    verify(mockThreadRowView1.addLabel(threadUnkindMessageCSS)).once();
  });

  test('single thread view message flag->clean', async () => {
    const beforeToxic = true;
    const setup = mockToolbarHandler(FlagOption.APPROPRIATE);
    const subject = 'some subject';
    const htmlNode = mockHTMLTextNode(subject, beforeToxic);
    const {
      instanceThreadRowView: instanceThreadRowView1,
      mockThreadRowView: mockThreadRowView1,
    } = mockThreadRowView('1234', subject, htmlNode, beforeToxic);
    const { mockToolbar, instanceMockToolBar } = mockToolbarEvents(
      [instanceThreadRowView1],
      [],
    );
    const elementNode = instanceThreadRowView1.getElement();

    jest.spyOn(mockThreadRowView1, 'addLabel');

    expect(elementNode.childNodes[0].textContent).toBe(
      threadUnkindMessageLabel,
    );

    await setup.handler.handleToolbarButtonClick(instanceMockToolBar);

    verify(mockThreadRowView1.addLabel(anything())).never();
    expect(elementNode.childNodes.length).toBe(1);
    expect(elementNode.childNodes[0].textContent).toBe('');
  });
});

const mockToolbarHandler = (flagOption: FlagOption) => {
  const mockEventHandler = mock<IInboxEventHandler>();
  const mockDialogs = mock<IInboxDialogs>();

  when(mockDialogs.doPRRFlag()).thenReturn(
    new Promise((resolve) => resolve(flagOption)),
  );

  const instanceEventHandler = instance(mockEventHandler);
  const instanceDialogs = instance(mockDialogs);

  const handler = new InBoxToolbarHandler(
    instanceDialogs,
    instanceEventHandler,
    mockContentCommunicator,
  );

  return {
    handler,
    mockContentCommunicator,
    mockEventHandler,
    instanceEventHandler,
    instanceDialogs,
  };
};

const mockToolbarEvents = (
  selectedThreadRowView: ThreadRowView[],
  selectedThreadViews: ThreadView[],
) => {
  const mockToolbar = mock<ToolbarButtonOnClickEvent>();
  when(mockToolbar.selectedThreadViews).thenReturn(selectedThreadViews);
  when(mockToolbar.selectedThreadRowViews).thenReturn(selectedThreadRowView);
  const instanceMockToolBar = instance(mockToolbar);

  return { mockToolbar, instanceMockToolBar };
};

const mockThreadRowView = (
  threadID: string,
  subject: string,
  htmlElement: HTMLElement,
  hasToxicLabel: boolean,
) => {
  const ThreadRowViewClass = createClassFromType<ThreadRowView>({
    getThreadIDAsync(): Promise<string> {
      return new Promise((resolve) => resolve(threadID));
    },
    getSubject(): string {
      return subject;
    },
    getThreadID(): string {
      return threadID;
    },
    getElement(): HTMLElement {
      return htmlElement;
    },
  });

  const threadRowViewInstance = new ThreadRowViewClass();
  const mockThreadRowView = mock<typeof threadRowViewInstance>();

  when(mockThreadRowView.getThreadIDAsync()).thenReturn(
    new Promise((resolve) => resolve(threadID)),
  );
  when(mockThreadRowView.getSubject()).thenReturn(subject);
  when(mockThreadRowView.getElement()).thenReturn(htmlElement);
  when(mockThreadRowView.getThreadID()).thenReturn(threadID);

  const instanceThreadRowView = instance(mockThreadRowView);
  return { instanceThreadRowView, mockThreadRowView };
};

const mockHTMLTextNode = (subject: string, insertToxicLabel: boolean) => {
  const label = insertToxicLabel ? threadUnkindMessageLabel : subject;
  const textNode = document.createTextNode(label);
  const div = document.createElement('div');
  div.appendChild(textNode);
  return div;
};

const mockThreadView = (
  threadID: string,
  subject: string,
  messages: string[],
) => {
  const threadRowView = mock<ThreadView>({
    getThreadIDAsync(): Promise<string> {
      return new Promise((resolve) => resolve(threadID));
    },
    getSubject(): string {
      return subject;
    },
    getMessageViews(): Array<MessageView> {
      const messageViews = messages.map((message) => {
        const messageView = mock<MessageView>({
          getMessageIDAsync(): Promise<string> {
            return new Promise((resolve) => resolve('some message id'));
          },
          getBodyElement(): HTMLElement {
            const div = document.createElement('div');
            div.innerText = message;
            return div;
          },
        });
        return messageView;
      });
      return messageViews;
    },
  });
  return threadRowView;
};
