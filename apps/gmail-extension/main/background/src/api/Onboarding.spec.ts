import { OnBoardingService } from '../api/onboarding';
import * as ChromeUtil from '../api/chromeUtil';
import { OptIn } from '../api/chromeUtil';
import { Logger } from '@shared/utils/Logger';
import { HttpService } from './httpService';

//common mock implementations
jest.mock('src/constants', () => ({
  ENVIRONMENT: 'development',
  API_URL: 'http://localhost:3000',
}));

describe('background => OnBoarding Flow ', () => {
  const logger = new Logger();
  const httpService = new HttpService(logger);
  let onboardingService: OnBoardingService;

  beforeEach(() => {
    onboardingService = new OnBoardingService(logger, httpService);
  });

  test('save opt-in for school user.', async () => {
    const storeUserOptInBackendSpy =
      await mockStoreUserOptInBackendSpy(onboardingService);
    await mockReadJWTToken('fakejwttoken123456');
    const mockMarkOnBoardingDoneSpy = jest
      .spyOn(onboardingService, 'markOnBoardingDone')
      .mockImplementation(async () => {
        Promise.resolve();
      });

    const optin: OptIn = { onboardingDone: true, onboardingTime: new Date() };
    await onboardingService.saveUserOnboarding(optin);

    expect(storeUserOptInBackendSpy).toHaveBeenCalled();
    expect(mockMarkOnBoardingDoneSpy).toHaveBeenCalled();
  });

  test('save opt-in for consumer user.', async () => {
    const mockMarkOnBoardingDoneSpy = jest
      .spyOn(onboardingService, 'markOnBoardingDone')
      .mockImplementation(async () => {
        Promise.resolve();
      });
    await mockReadJWTToken(undefined);
    const storeUserOptInBackendSpy =
      await mockStoreUserOptInBackendSpy(onboardingService);

    const optin: OptIn = { onboardingDone: true, onboardingTime: new Date() };
    await onboardingService.saveUserOnboarding(optin);

    expect(mockMarkOnBoardingDoneSpy).toHaveBeenCalled();
    expect(storeUserOptInBackendSpy).toHaveBeenCalledTimes(0);
  });

  test('redirect to on-boarding page when on-boarding is not done.', async () => {
    jest.spyOn(onboardingService, 'shouldOnboardUser').mockResolvedValue(true);
    const redirectToOnBoardingSpy = jest.spyOn(
      onboardingService,
      'redirectToOnBoarding',
    );

    await onboardingService.checkOnBoarding();

    expect(redirectToOnBoardingSpy).toHaveBeenCalled();
    expect(redirectToOnBoardingSpy).toHaveBeenCalled();
  });

  test('Should allow onboard if user has not onboarded remotely.', async () => {
    jest.spyOn(ChromeUtil, 'getJWTToken').mockResolvedValue('12134444');
    jest
      .spyOn(onboardingService, 'getOnBoardingStatus')
      .mockResolvedValue(false);
    const remoteOptInSpy = jest
      .spyOn(onboardingService, 'getUserOptInFromBackend')
      .mockResolvedValue({
        emailOptInSelection: true,
        onboardingDone: false,
      });

    const result = await onboardingService.shouldOnboardUser();

    //expect
    expect(result).toBeTruthy();
    expect(remoteOptInSpy).toHaveBeenCalled();
  });

  test('Should allow onboard if user has not logged in locally.', async () => {
    jest.spyOn(ChromeUtil, 'getJWTToken').mockResolvedValue(undefined);
    jest
      .spyOn(onboardingService, 'getOnBoardingStatus')
      .mockResolvedValue(false);

    const result = await onboardingService.shouldOnboardUser();

    //expect
    expect(result).toBeTruthy();
  });

  test('Should not allow onboard if user has not logged in locally.', async () => {
    jest.spyOn(ChromeUtil, 'getJWTToken').mockResolvedValue(undefined);
    jest
      .spyOn(onboardingService, 'getOnBoardingStatus')
      .mockResolvedValue(true);

    const result = await onboardingService.shouldOnboardUser();

    //expect
    expect(result).toBeFalsy();
  });
  test('Should not allow onboard if user has not logged in locally.', async () => {
    jest.spyOn(ChromeUtil, 'getJWTToken').mockResolvedValue('12345678');
    jest
      .spyOn(onboardingService, 'getOnBoardingStatus')
      .mockResolvedValue(false);
    const remoteOptInSpy = jest
      .spyOn(onboardingService, 'getUserOptInFromBackend')
      .mockResolvedValue({
        onboardingDone: true,
      });
    const result = await onboardingService.shouldOnboardUser();

    //expect
    expect(remoteOptInSpy).toHaveBeenCalled();
    expect(result).toBeFalsy();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
const mockReadJWTToken = async (token: any) => {
  jest.spyOn(ChromeUtil, 'getJWTToken').mockResolvedValue(token);
};

const mockStoreUserOptInBackendSpy = async (
  onboardingService: OnBoardingService,
): Promise<any> => {
  return jest
    .spyOn(onboardingService, 'storeUserOptInBackend')
    .mockImplementation(async () => {
      Promise.resolve({});
    });
};
