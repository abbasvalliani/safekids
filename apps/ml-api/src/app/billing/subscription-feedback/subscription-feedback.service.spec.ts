import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionFeedbackService } from './subscription-feedback.service';
import { SubscriptionFeedbackDto } from './dto/subscription-feedback-dto';

class Fixture {
  static SUBSCRIPTION_FEEDBACK_REPOSITORY = class {
    static destroy = Fixture.getMock();
    static create = Fixture.getMock();
  };

  static getMock() {
    return jest.fn();
  }
}

describe('Subscription feedback Service tests', () => {
  let service: SubscriptionFeedbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionFeedbackService,

        {
          provide: 'SUBSCRIPTION_FEEDBACK_REPOSITORY',
          useValue: Fixture.SUBSCRIPTION_FEEDBACK_REPOSITORY,
        },
      ],
    }).compile();

    service = module.get<SubscriptionFeedbackService>(
      SubscriptionFeedbackService,
    );
  });

  it('Should create subscription', async () => {
    //given
    const dto = {
      feedback: [],
      accountId: 'accountId',
    } as SubscriptionFeedbackDto;

    //when
    await service.create(dto);

    //then
    expect(
      Fixture.SUBSCRIPTION_FEEDBACK_REPOSITORY.create,
    ).toHaveBeenCalledTimes(1);
    expect(
      Fixture.SUBSCRIPTION_FEEDBACK_REPOSITORY.create,
    ).toHaveBeenCalledWith(dto);
  });

  it('Should soft delete subscription', async () => {
    //given
    const accountId = 'accountId';

    //when
    await service.delete(accountId, true);

    //then
    expect(
      Fixture.SUBSCRIPTION_FEEDBACK_REPOSITORY.destroy,
    ).toHaveBeenCalledTimes(1);
    expect(
      Fixture.SUBSCRIPTION_FEEDBACK_REPOSITORY.destroy,
    ).toHaveBeenCalledWith({ where: { accountId } });
  });

  it('Should hard delete subscription', async () => {
    //given
    const accountId = 'accountId';

    //when
    await service.delete(accountId, false);

    //then
    expect(
      Fixture.SUBSCRIPTION_FEEDBACK_REPOSITORY.destroy,
    ).toHaveBeenCalledTimes(1);
    expect(
      Fixture.SUBSCRIPTION_FEEDBACK_REPOSITORY.destroy,
    ).toHaveBeenCalledWith({ where: { accountId }, force: true });
  });
});
