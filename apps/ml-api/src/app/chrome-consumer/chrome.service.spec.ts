import { FilteredProcessService } from './../filtered-process/filtered-process.service';
import moment from 'moment';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { ChromeService } from './chrome.service';
import { FilteredUrlService } from '../filtered-url/filtered-url.service';
import { FilteredCategoryService } from '../filtered-category/filtered-category.service';
import { CalendarService } from '../calendar/calendar.service';
import { InterceptionTimeService } from '../interception-time/interception-time.service';
import { AccountService } from '../accounts/account.service';
import { UserService } from '../user/user.service';
import { WebTimeService } from '../web-time/web-time.service';
import { FeedbackService } from '../feedback/feedback.service';
import { NonSchoolDaysConfigService } from '../non-school-days-config/non-school-days-config.service';
import { KidConfigService } from '../kid-config/kid-config.service';
import { CategoryStatus } from '../category/category.status';
import { CategoryDTO } from '../filtered-category/dto/filtered-category.dto';
import { CategoryTimeDto } from './domain/category.time.dto';
import { Statuses } from '../status/default-status';
import { OnboardStatusDto } from './domain/onboard.status.dto';
import { CreateFeedbackDto } from '../feedback/dto/create-feedback.dto';
import { CreateWebTimeDto } from '../web-time/dto/create-web-time.dto';
import { KidRequestService } from '../kid-request/kid-request.service';
import { EmailService } from '../email/email.service';
import { JwtTokenService } from '../auth/jwtToken/jwt.token.service';
import { LoggingService } from '../logger/logging.service';
import { ConfigService } from '@nestjs/config';
import { KidRequestDto } from '../kid-request/domain/kid-request-dto';
import { QueryException } from '../error/common.exception';
import { ExtensionStatus } from '../kid-config/enum/extension-status';
import { ParentEmailConfigService } from '../parent-email-config/parent-email-config.service';
import { SubscriptionService } from '../billing/subscription/subscription.service';

class Fixture {
    static getMock() {
        return jest.fn();
    }

    static getFilteredUrlsService = class {
        static findAllTypeUrls = Fixture.getMock();
    };

    static getFilteredCategoryService = class {
        static findAllByAccountAndUserId = Fixture.getMock();
        static updateCategory = Fixture.getMock();
    };

    static getCalendarService = class {
        static checkHoliday = Fixture.getMock();
    };

    static getInterceptionTimeService = class {
        static findByAccountId = Fixture.getMock();
    };
    static SubscriptionService = class {
        static findOneByAccountId = Fixture.getMock();
        static getSubscriptionPlanByAccountId = Fixture.getMock();
    };

    static getAccountService = class {
        static findOne = Fixture.getMock();
    };

    static getUserService = class {
        static limitAccess = Fixture.getMock();
        static findOneByAccountId = Fixture.getMock();
        static findOneById = Fixture.getMock();
        static findParentAccount = Fixture.getMock();
        static findUserByAccessCode = Fixture.getMock();
    };

    static getWebTimeService = class {
        static create = Fixture.getMock();
    };

    static getFeedbackService = class {
        static create = Fixture.getMock();
    };

    static getNonSchoolDaysConfigService = class {
        static findByAccountId = Fixture.getMock();
    };

    static getKidConfigService = class {
        static fetch = Fixture.getMock();
        static update = Fixture.getMock();
    };
    static getKidRequestService = class {
        static findOne = Fixture.getMock();
        static updateAccessGranted = Fixture.getMock();
        static create = Fixture.getMock();
        static findAllByUserDeviceId = Fixture.getMock();
    };
    static getEmailService = class {
        static sendEmail = Fixture.getMock();
    };
    static getJwtTokenService = class {
        static generateChromeExtensionToken = Fixture.getMock();
        static verifyUninstallExtensionToken = Fixture.getMock();
    };
    static getLoggingService() {
        return {
            className: Fixture.getMock(),
            debug: Fixture.getMock(),
            error: Fixture.getMock(),
        };
    }
    static getConfigService = {
        get: Fixture.getMock().mockReturnValue({
            url: 'url',
            client_id: 'client_id',
            client_secret: 'client_secret',
        }),
    };
    static response = {
        writeHead: Fixture.getMock(),
        end: Fixture.getMock(),
    } as unknown as Response;

    static Sequelize = class {
        static transaction = Fixture.getMock().mockResolvedValue({
            commit: jest.fn(),
            rollback: jest.fn(),
        });
    };

    static getParentEmailCofigService = class {
        static pushMessageToQueue = Fixture.getMock();
    };

    static getFilteredProcessService = class {
        static findAllByOrgUnitId = Fixture.getMock();
    };
}

JSON.parse = jest.fn().mockImplementationOnce(() => {
    return {
        id: '5a5c53a3-f28e-42d4-a032-86780a954f75',
        offTime: '21:00',
        userId: '5de67d10-d02e-4ff0-acb1-af0aab8d9f90',
        status: 'IN_PROGRESS',
        step: 0,
        extensionStatus: 'UNINSTALLED',
        extensionStatusUpdatedAt: '2022-12-29T09:14:01.000Z',
        accessLimitedAt: null,
        planType: 'FREE',
    };
});
// Spy (real implementation kept): Nest >=10.4.16 hashes module metadata with
// JSON.stringify, so stubbing it to return undefined breaks createTestingModule.
jest.spyOn(JSON, "stringify");

describe('Chrome service test', () => {
    let service: ChromeService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChromeService,
                {
                    provide: 'SEQUELIZE',
                    useValue: Fixture.Sequelize,
                },
                {
                    provide: SubscriptionService,
                    useValue: Fixture.SubscriptionService,
                },
                {
                    provide: FilteredUrlService,
                    useValue: Fixture.getFilteredUrlsService,
                },
                {
                    provide: FilteredCategoryService,
                    useValue: Fixture.getFilteredCategoryService,
                },
                {
                    provide: CalendarService,
                    useValue: Fixture.getCalendarService,
                },
                {
                    provide: InterceptionTimeService,
                    useValue: Fixture.getInterceptionTimeService,
                },
                {
                    provide: AccountService,
                    useValue: Fixture.getAccountService,
                },
                {
                    provide: UserService,
                    useValue: Fixture.getUserService,
                },
                {
                    provide: WebTimeService,
                    useValue: Fixture.getWebTimeService,
                },
                {
                    provide: FeedbackService,
                    useValue: Fixture.getFeedbackService,
                },
                {
                    provide: NonSchoolDaysConfigService,
                    useValue: Fixture.getNonSchoolDaysConfigService,
                },
                {
                    provide: KidConfigService,
                    useValue: Fixture.getKidConfigService,
                },
                {
                    provide: KidRequestService,
                    useValue: Fixture.getKidRequestService,
                },
                {
                    provide: EmailService,
                    useValue: Fixture.getEmailService,
                },
                {
                    provide: JwtTokenService,
                    useValue: Fixture.getJwtTokenService,
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
                    provide: ParentEmailConfigService,
                    useValue: Fixture.getParentEmailCofigService,
                },
                {
                    provide: FilteredProcessService,
                    useValue: Fixture.getFilteredProcessService,
                },
            ],
        }).compile();

        service = module.get<ChromeService>(ChromeService);
    });

    it('Should find all web filter configurations', async () => {
        //given
        const userId = 'userId';
        const accountId = 'accountId';
        const orgUnitId = 'orgUnitId';
        const userDeviceLinkid = 'userDeviceLinkid';

        //mock dependencies
        Fixture.getFilteredUrlsService.findAllTypeUrls.mockResolvedValueOnce({ permissible: [], nonPermissible: [] });
        Fixture.getFilteredCategoryService.findAllByAccountAndUserId.mockResolvedValueOnce([
            {
                categoryId: 'categoryId',
                status: 'status',
                timeDuration: 'timeDuration',
            },
        ]);
        Fixture.getAccountService.findOne.mockResolvedValueOnce({ interceptionCategories: [] });
        Fixture.getKidConfigService.fetch.mockResolvedValueOnce({ userId });
        Fixture.getUserService.findOneById.mockResolvedValueOnce({ accessLimited: true });
        Fixture.SubscriptionService.findOneByAccountId.mockResolvedValueOnce(true);
        Fixture.getKidRequestService.findAllByUserDeviceId.mockResolvedValueOnce({ INFORM: ['facebook.com'] });
        Fixture.getFilteredProcessService.findAllByOrgUnitId.mockResolvedValueOnce([
            {
                name: 'name',
            },
            {
                name: 'name1',
            },
        ]);

        //when
        const configuration = await service.getWebFilterConfiguration(accountId, userId, orgUnitId, userDeviceLinkid);

        //then
        expect(Fixture.getFilteredUrlsService.findAllTypeUrls).toHaveBeenCalledTimes(1);
        expect(Fixture.getFilteredUrlsService.findAllTypeUrls).toHaveBeenCalledWith(accountId, userId);
        expect(Fixture.getUserService.findOneById).toHaveBeenCalledTimes(1);
        expect(Fixture.getUserService.findOneById).toHaveBeenCalledWith(userId);
        expect(Fixture.getFilteredCategoryService.findAllByAccountAndUserId).toHaveBeenCalledTimes(1);
        expect(Fixture.getFilteredCategoryService.findAllByAccountAndUserId).toHaveBeenCalledWith(accountId, userId, orgUnitId);
        expect(Fixture.getAccountService.findOne).toHaveBeenCalledTimes(1);
        expect(Fixture.getAccountService.findOne).toHaveBeenCalledWith(accountId);
        expect(Fixture.getKidConfigService.fetch).toHaveBeenCalledTimes(1);
        expect(Fixture.getKidConfigService.fetch).toHaveBeenCalledWith(userId);

        expect(Fixture.getFilteredProcessService.findAllByOrgUnitId).toHaveBeenCalledTimes(1);
        expect(Fixture.getFilteredProcessService.findAllByOrgUnitId).toHaveBeenCalledWith(orgUnitId, accountId);

        expect(configuration).toHaveProperty(['permissible']);
        expect(configuration).toHaveProperty(['nonPermissible']);
        expect(configuration).toHaveProperty(['interceptionCategories']);
        expect(configuration).toHaveProperty(['filteredCategories']);
        expect(configuration).toHaveProperty(['kidConfig']);
        expect(configuration).toHaveProperty(['accessLimited']);
        expect(configuration).toHaveProperty(['exemptedProcesses']);
        expect(configuration).not.toHaveProperty(['random']);
    });

    describe('Should check holiday status', () => {
        it('Should return holiday status as false if no holiday', async () => {
            //given
            const date = '6/12/2022';
            const accountId = 'accountId';

            //mock dependencies
            Fixture.getCalendarService.checkHoliday.mockResolvedValueOnce(false);
            Fixture.getNonSchoolDaysConfigService.findByAccountId.mockResolvedValueOnce({ weekendsEnabled: false });

            //when
            const response = await service.checkHoliday(accountId, date);

            //then
            expect(Fixture.getCalendarService.checkHoliday).toHaveBeenCalledTimes(1);
            expect(Fixture.getCalendarService.checkHoliday).toHaveBeenCalledWith(accountId, new Date(Date.parse(date)));
            expect(Fixture.getNonSchoolDaysConfigService.findByAccountId).toHaveBeenCalledTimes(1);
            expect(Fixture.getNonSchoolDaysConfigService.findByAccountId).toHaveBeenCalledWith(accountId);
            expect(response).toEqual({ holiday: false });
        });

        it('Should return holiday status as true if its weekend and is holiday', async () => {
            //given
            const date = '6/12/2022';
            const accountId = 'accountId';

            //mock dependencies
            Fixture.getCalendarService.checkHoliday.mockResolvedValueOnce(false);
            Fixture.getNonSchoolDaysConfigService.findByAccountId.mockResolvedValueOnce({ weekendsEnabled: true });

            //when
            const response = await service.checkHoliday(accountId, date);

            //then
            expect(Fixture.getCalendarService.checkHoliday).toHaveBeenCalledTimes(1);
            expect(Fixture.getCalendarService.checkHoliday).toHaveBeenCalledWith(accountId, new Date(Date.parse(date)));
            expect(Fixture.getNonSchoolDaysConfigService.findByAccountId).toHaveBeenCalledTimes(1);
            expect(Fixture.getNonSchoolDaysConfigService.findByAccountId).toHaveBeenCalledWith(accountId);
            expect(response).toEqual({ holiday: true });
        });
    });

    it('Should get intercept times', async () => {
        //given
        const accountId = 'accountId';

        //when
        await service.getInterceptTimes(accountId);

        //then
        expect(Fixture.getInterceptionTimeService.findByAccountId).toHaveBeenCalledTimes(1);
        expect(Fixture.getInterceptionTimeService.findByAccountId).toHaveBeenCalledWith(accountId);
    });

    it('Should update access limit', async () => {
        //given
        const userId = 'userId';
        const accountId = 'accountId';
        const accessLimitDTO = { accessLimited: true, category: 'social' };

        //mockDependencies
        Fixture.getUserService.findParentAccount.mockResolvedValueOnce([{ email: 'email.com' }]);
        Fixture.getUserService.findOneById.mockResolvedValueOnce([{ firstName: 'firstName', lastName: 'lastName' }]);
        Fixture.getJwtTokenService.generateChromeExtensionToken.mockResolvedValueOnce({ jwt_token: 'some' });

        //when
        await service.updateAccessLimit(userId, accountId, accessLimitDTO);

        //then
        expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledTimes(1);
        expect(Fixture.getUserService.findOneById).toHaveBeenCalledTimes(1);
        expect(Fixture.getJwtTokenService.generateChromeExtensionToken).toHaveBeenCalledTimes(1);
        expect(Fixture.getEmailService.sendEmail).toHaveBeenCalledTimes(1);
        expect(Fixture.getUserService.limitAccess).toHaveBeenCalledTimes(1);
        expect(Fixture.getUserService.limitAccess).toHaveBeenCalledWith(userId, accessLimitDTO.accessLimited);
    });

    it('Should get access limit status', async () => {
        //given
        const userId = 'userId';
        const accountId = 'accountId';

        //mock dependencies
        Fixture.getUserService.findOneByAccountId.mockResolvedValueOnce({ accessLimited: false });

        //when
        const response = await service.isAccessLimited(accountId, userId);

        //then
        expect(Fixture.getUserService.findOneByAccountId).toHaveBeenCalledTimes(1);
        expect(Fixture.getUserService.findOneByAccountId).toHaveBeenCalledWith(accountId, userId);
        expect(response).toEqual({ accessLimited: false });
    });

    it('Should save feedback', async () => {
        //given
        const deviceLinkId = 'deviceLinkId';
        const accountId = 'accountId';
        const feedback = {} as CreateFeedbackDto;

        //when
        await service.saveFeedback(accountId, deviceLinkId, feedback);

        //then
        expect(Fixture.getFeedbackService.create).toHaveBeenCalledTimes(1);
        feedback.accountId = accountId;
        feedback.userDeviceLinkId = deviceLinkId;
        expect(Fixture.getFeedbackService.create).toHaveBeenCalledWith(feedback);
    });

    it('Should save web time', async () => {
        //given
        const webTime = {} as CreateWebTimeDto;

        const user = { id: 'id', email: 'email', orgUnitId: '123' };

        //mock dependencies
        Fixture.getUserService.findOneById.mockResolvedValueOnce(user);

        //when
        await service.saveWebTime(webTime);

        //then
        expect(Fixture.getWebTimeService.create).toHaveBeenCalledTimes(1);
        webTime.userId = user.id;
        webTime.userEmail = user.email;
        webTime.orgUnitId = user.orgUnitId;
        expect(Fixture.getWebTimeService.create).toHaveBeenCalledWith(webTime);
    });

    it('Should find parent', async () => {
        //given
        const accountId = '123';

        const users = { id: 'id', email: 'email', orgUnitId: '123' };

        //mock dependencies
        Fixture.getUserService.findParentAccount.mockResolvedValueOnce(users);

        //when
        const userResponse = await service.findParent(accountId);

        //then
        expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledTimes(1);
        expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledWith(accountId);
        expect(userResponse).toEqual(users);
    });

    it('Should update category', async () => {
        //given
        const orgUnitId = 'orgUnitId';
        const accountId = 'accountId';
        const dto = {
            id: 'id',
            status: CategoryStatus.ALLOW,
        } as CategoryDTO;

        //when
        await service.updateCategory(accountId, orgUnitId, dto);

        //then
        expect(Fixture.getFilteredCategoryService.updateCategory).toHaveBeenCalledTimes(1);
        expect(Fixture.getFilteredCategoryService.updateCategory).toHaveBeenCalledWith(accountId, orgUnitId, dto.id, { status: dto.status });
    });

    it('Should update category and time config', async () => {
        //given
        const orgUnitId = 'orgUnitId';
        const accountId = 'accountId';
        const userId = 'userId';
        const category1 = {
            id: 'id',
            timeDuration: 120,
        } as CategoryDTO;
        const category2 = {
            id: 'id2',
            timeDuration: 120,
        } as CategoryDTO;
        const dto = {
            offTime: '21:00',
            categories: [category1, category2],
        } as CategoryTimeDto;

        //when
        await service.updateCategoryTimeAndConfig(accountId, orgUnitId, userId, dto);

        //then
        expect(Fixture.getFilteredCategoryService.updateCategory).toHaveBeenCalledTimes(2);
        expect(Fixture.getFilteredCategoryService.updateCategory).toHaveBeenNthCalledWith(1, accountId, orgUnitId, category1.id, {
            timeDuration: category1.timeDuration,
        });
        expect(Fixture.getFilteredCategoryService.updateCategory).toHaveBeenNthCalledWith(2, accountId, orgUnitId, category2.id, {
            timeDuration: category2.timeDuration,
        });
        expect(Fixture.getKidConfigService.update).toHaveBeenCalledTimes(1);
        expect(Fixture.getKidConfigService.update).toHaveBeenCalledWith(userId, { offTime: dto.offTime });
    });

    it('Should update on boarding status', async () => {
        //given
        const userId = 'userId';
        const dto = {
            status: Statuses.ACTIVE,
            step: 1,
        } as OnboardStatusDto;

        //when
        await service.updateOnBoardingStatus(userId, dto);

        //then
        expect(Fixture.getKidConfigService.update).toHaveBeenCalledTimes(1);
        expect(Fixture.getKidConfigService.update).toHaveBeenCalledWith(userId, dto);
    });

    it('Should get on boarding status', async () => {
        //given
        const userId = 'userId';
        const accountId = 'accountId';

        Fixture.getKidConfigService.fetch.mockResolvedValueOnce({ planType: 'FREE' });
        Fixture.SubscriptionService.getSubscriptionPlanByAccountId.mockResolvedValueOnce({ planType: 'FREE' });

        //when
        await service.getOnBoardingStatus(userId, accountId);

        //then
        expect(Fixture.getKidConfigService.fetch).toHaveBeenCalledTimes(1);
        expect(Fixture.getKidConfigService.fetch).toHaveBeenCalledWith(userId);

        expect(Fixture.SubscriptionService.getSubscriptionPlanByAccountId).toHaveBeenCalledTimes(1);
        expect(Fixture.SubscriptionService.getSubscriptionPlanByAccountId).toHaveBeenCalledWith(accountId);
    });

    describe('Ask parent', () => {
        it('Should update request to false if request is there and send email', async () => {
            //given
            const orgUnitId = 'orgUnitId';
            const accountId = 'accountId';
            const kidId = 'kidId';
            const url = 'url';
            const informParentDto = {
                categoryId: 'categoryId',
                url: 'url',
            } as KidRequestDto;
            const requestId = '1';

            //mock dependencies
            Fixture.getUserService.findOneById.mockResolvedValueOnce({});
            Fixture.getUserService.findParentAccount.mockResolvedValueOnce([{ id: '1' }]);
            Fixture.getKidRequestService.findOne.mockResolvedValueOnce([{ id: requestId, accessGranted: true }]);
            Fixture.getJwtTokenService.generateChromeExtensionToken.mockResolvedValueOnce({ jwt_token: '123' });
            Fixture.getEmailService.sendEmail.mockResolvedValueOnce('');

            //when
            await service.saveKidRequests(kidId, accountId, orgUnitId, informParentDto);

            //then
            expect(Fixture.getUserService.findOneById).toHaveBeenCalledTimes(1);
            expect(Fixture.getUserService.findOneById).toHaveBeenCalledWith(kidId);

            expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledTimes(1);
            expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledWith(accountId);

            expect(Fixture.getKidRequestService.findOne).toHaveBeenCalledTimes(1);
            expect(Fixture.getKidRequestService.findOne).toHaveBeenCalledWith(informParentDto.url, kidId);

            expect(Fixture.getKidRequestService.updateAccessGranted).toHaveBeenCalledTimes(1);
            expect(Fixture.getKidRequestService.updateAccessGranted).toHaveBeenCalledWith(kidId, url, false);

            expect(Fixture.getJwtTokenService.generateChromeExtensionToken).toHaveBeenCalledTimes(1);
            const payload = {
                url: informParentDto.url,
                orgUnitId,
                id: requestId,
            };
            expect(Fixture.getJwtTokenService.generateChromeExtensionToken).toHaveBeenCalledWith(payload);
        });

        it('Should create request to true if request is not there and send email for ai', async () => {
            //given
            const orgUnitId = 'orgUnitId';
            const accountId = 'accountId';
            const kidId = 'kidId';
            const url = 'url';
            const informParentDto = {
                categoryId: 'categoryId',
                url: 'url',
                ai: true,
                type: 'INFORM_AI',
            } as KidRequestDto;
            const requestId = '1';

            //mock dependencies
            Fixture.getUserService.findOneById.mockResolvedValueOnce({ id: 'kidId' });
            Fixture.getUserService.findParentAccount.mockResolvedValueOnce([{ id: '1' }]);
            Fixture.getKidRequestService.findOne.mockResolvedValueOnce(null);
            Fixture.getJwtTokenService.generateChromeExtensionToken.mockResolvedValueOnce({ jwt_token: '123' });
            Fixture.getEmailService.sendEmail.mockResolvedValueOnce('');
            Fixture.getKidRequestService.create.mockResolvedValueOnce({ id: requestId });

            //when
            await service.saveKidRequests(kidId, accountId, orgUnitId, informParentDto);

            //then
            expect(Fixture.getUserService.findOneById).toHaveBeenCalledTimes(1);
            expect(Fixture.getUserService.findOneById).toHaveBeenCalledWith(kidId);

            expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledTimes(1);
            expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledWith(accountId);

            expect(Fixture.getKidRequestService.findOne).toHaveBeenCalledTimes(1);
            expect(Fixture.getKidRequestService.findOne).toHaveBeenCalledWith(informParentDto.url, kidId);

            expect(Fixture.getKidRequestService.updateAccessGranted).toHaveBeenCalledTimes(0);

            expect(Fixture.getJwtTokenService.generateChromeExtensionToken).toHaveBeenCalledTimes(1);
            const payload = {
                kidId,
                url: informParentDto.url,
                orgUnitId,
                id: requestId,
            };
            expect(Fixture.getJwtTokenService.generateChromeExtensionToken).toHaveBeenCalledWith(payload);
        });

        it('Should create request to true if request is not there and send email for inform only', async () => {
            //given
            const orgUnitId = 'orgUnitId';
            const accountId = 'accountId';
            const kidId = 'kidId';
            const informParentDto = {
                categoryId: 'categoryId',
                url: 'url',
                ask: true,
                type: 'INFORM',
            } as KidRequestDto;
            const requestId = '1';

            //mock dependencies
            Fixture.getUserService.findOneById.mockResolvedValueOnce({ id: 'kidId' });
            Fixture.getUserService.findParentAccount.mockResolvedValueOnce([{ id: '1' }]);
            Fixture.getKidRequestService.findOne.mockResolvedValueOnce(null);
            Fixture.getJwtTokenService.generateChromeExtensionToken.mockResolvedValueOnce({ jwt_token: '123' });
            Fixture.getEmailService.sendEmail.mockResolvedValueOnce('');
            Fixture.getKidRequestService.create.mockResolvedValueOnce({ id: requestId });

            //when

            await service.saveKidRequests(kidId, accountId, orgUnitId, informParentDto);

            //then
            expect(Fixture.getUserService.findOneById).toHaveBeenCalledTimes(1);
            expect(Fixture.getUserService.findOneById).toHaveBeenCalledWith(kidId);

            expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledTimes(1);
            expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledWith(accountId);

            expect(Fixture.getKidRequestService.findOne).toHaveBeenCalledTimes(1);
            expect(Fixture.getKidRequestService.findOne).toHaveBeenCalledWith(informParentDto.url, kidId);

            // expect(Fixture.getKidRequestService.updateAccessGranted).toHaveBeenCalledTimes(0);

            expect(Fixture.getJwtTokenService.generateChromeExtensionToken).toHaveBeenCalledTimes(1);
            const payload = {
                kidId,
                url: informParentDto.url,
                orgUnitId,
                id: requestId,
            };
            expect(Fixture.getJwtTokenService.generateChromeExtensionToken).toHaveBeenCalledWith(payload);
        });
        it.skip('Should only send email if request is already sent', async () => {
            //given
            const orgUnitId = 'orgUnitId';
            const accountId = 'accountId';
            const kidId = 'kidId';
            const informParentDto = {
                categoryId: 'categoryId',
                url: 'url',
            } as KidRequestDto;

            //mock dependencies
            Fixture.getUserService.findOneById.mockResolvedValueOnce({});
            Fixture.getUserService.findParentAccount.mockResolvedValueOnce([{ id: '1' }]);
            Fixture.getKidRequestService.findOne.mockResolvedValueOnce([{ id: '1', accessGranted: false }]);
            Fixture.getJwtTokenService.generateChromeExtensionToken.mockResolvedValueOnce({ jwt_token: '123' });
            Fixture.getEmailService.sendEmail.mockResolvedValueOnce('');

            //when
            await service.saveKidRequests(kidId, accountId, orgUnitId, informParentDto);
            //then
            expect(Fixture.getUserService.findOneById).toHaveBeenCalledTimes(0);
            expect(Fixture.getUserService.findOneById).toHaveBeenCalledWith(kidId);

            expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledTimes(1);
            expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledWith(accountId);

            expect(Fixture.getKidRequestService.findOne).toHaveBeenCalledTimes(1);
            expect(Fixture.getKidRequestService.findOne).toHaveBeenCalledWith(informParentDto.categoryId, informParentDto.url, kidId);
        });
        it('Should throw exception if error occurs when finding user', async () => {
            //given
            const orgUnitId = 'orgUnitId';
            const accountId = 'accountId';
            const kidId = 'kidId';
            const informParentDto = {
                categoryId: 'categoryId',
                url: 'url',
            } as KidRequestDto;

            //mock dependencies
            Fixture.getUserService.findOneById.mockImplementationOnce(async () => {
                throw new QueryException(QueryException.save());
            });
            Fixture.getUserService.findParentAccount.mockResolvedValueOnce([{ id: '1' }]);
            Fixture.getKidRequestService.findOne.mockResolvedValueOnce([{ id: '1', accessGranted: false }]);

            //when
            service.saveKidRequests(kidId, accountId, orgUnitId, informParentDto).catch((e) => {
                //then
                expect(Fixture.getUserService.findOneById).toHaveBeenCalledTimes(1);
                expect(Fixture.getUserService.findOneById).toHaveBeenCalledWith(kidId);

                expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledTimes(0);

                expect(e).toBeInstanceOf(QueryException);
                expect(e.message).toBe(QueryException.save());
                expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
            });
        });
    });

    describe('Update Extension Status', () => {
        it('it should update uninstall status -> new/after 5 mint grace period time', async () => {
            //given
            const token = 'dumy_token';
            const userId = 'userId';
            const response: Response = Fixture.response;
            const updateKidConfig = { extensionStatus: ExtensionStatus.UNINSTALLED, extensionStatusUpdatedAt: moment() };

            //received
            const kidParentResponse = {
                id: 'id',
                accountId: 'accountId',
                firstName: 'firstName',
                lastName: 'lastName',
                email: 'email',
            };

            jest.mock('moment', () => {
                const momentParams = {
                    format: jest.fn(() => '10/04/2020'),
                    startOf: jest.fn().mockReturnThis(),
                    isAfter: jest.fn().mockReturnValue(true),
                    isValid: jest.fn().mockReturnValue(true),
                };

                const fn = jest.fn((newMoment) => {
                    momentParams.format = jest.fn(() => newMoment);
                    return momentParams;
                });

                return fn;
            });

            //mock dependencies
            Fixture.getUserService.findUserByAccessCode.mockResolvedValueOnce(kidParentResponse);
            Fixture.getKidConfigService.update.mockResolvedValueOnce(true);
            Fixture.getUserService.findParentAccount.mockResolvedValueOnce([{ email: 'email' }]);
            Fixture.getEmailService.sendEmail.mockResolvedValueOnce('');

            //when
            await service.updateExtensionStatus(token, response);

            //then
            expect(Fixture.getUserService.findUserByAccessCode).toHaveBeenCalledTimes(1);
            expect(Fixture.getKidConfigService.update).toHaveBeenCalledTimes(1);
            expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledTimes(1);
            expect(Fixture.getEmailService.sendEmail).toHaveBeenCalledTimes(1);
        });

        it('it should not update uninstall status -> invalid tokenw code', async () => {
            //given
            const token = 'dumy_token';
            const response: Response = Fixture.response;

            //mock dependencies
            Fixture.getUserService.findUserByAccessCode.mockResolvedValueOnce(null);

            //when
            await service.updateExtensionStatus(token, response).catch((e) => {
                //then
                expect(Fixture.getUserService.findUserByAccessCode).toHaveBeenCalledTimes(1);
                expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledTimes(0);

                expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
            });
        });
    });

    describe('Extension uninstall inform', () => {
        it('Should not send email to parent if uninstall within 5 minutes', async () => {
            //given
            const accountId = 'accountId';
            const userId = 'kidId';

            //mock dependencies
            const d = new Date();
            const date = new Date(d.setMinutes(d.getMinutes() - 4));
            Fixture.getKidConfigService.fetch.mockResolvedValueOnce({ extensionStatusUpdatedAt: date });

            //when
            await service.extUninstallInform(userId, accountId);

            //then
            expect(Fixture.getKidConfigService.fetch).toHaveBeenCalledTimes(1);
            expect(Fixture.getKidConfigService.fetch).toHaveBeenCalledWith(userId);

            expect(Fixture.getKidConfigService.update).toHaveBeenCalledTimes(0);
        });
        it('Should send email to parent', async () => {
            //given
            const accountId = 'accountId';
            const userId = 'kidId';

            //mock dependencies
            Fixture.getKidConfigService.fetch.mockResolvedValueOnce({ extensionStatusUpdatedAt: null });
            Fixture.getUserService.findOneById.mockResolvedValueOnce({ firstName: '1', lastName: '2' });
            Fixture.getAccountService.findOne.mockResolvedValueOnce({ primaryDomain: 'parent@gmail.com' });

            //when
            await service.extUninstallInform(userId, accountId);

            //then
            expect(Fixture.getKidConfigService.fetch).toHaveBeenCalledTimes(1);
            expect(Fixture.getKidConfigService.fetch).toHaveBeenCalledWith(userId);

            expect(Fixture.getKidConfigService.update).toHaveBeenCalledTimes(1);
            expect(Fixture.getUserService.findOneById).toHaveBeenCalledTimes(1);
            expect(Fixture.getUserService.findOneById).toHaveBeenCalledWith(userId);
            expect(Fixture.getAccountService.findOne).toHaveBeenCalledTimes(1);
            expect(Fixture.getAccountService.findOne).toHaveBeenCalledWith(accountId);
        });
    });

    it('Should update extension status to installed', async () => {
        //given
        const userId = 'kidId';

        //when
        await service.extUninstallCancel(userId);

        //then
        expect(Fixture.getKidConfigService.update).toHaveBeenCalledTimes(1);
        const payload = { extensionStatus: ExtensionStatus.INSTALLED, extensionStatusUpdatedAt: null };
        expect(Fixture.getKidConfigService.update).toHaveBeenCalledWith(userId, payload);
    });

    it('Should inform AI crisis', async () => {
        //given
        const accountId = 'accountId';
        const kidId = 'kidId';
        const informParentDto = {
            categoryId: 'categoryId',
            url: 'url',
        } as KidRequestDto;

        //mock dependencies
        Fixture.getUserService.findOneById.mockResolvedValueOnce({ firstName: 'firstName' });
        Fixture.getUserService.findParentAccount.mockResolvedValueOnce([{ email: 'email' }]);

        //when
        await service.informAICrisis(kidId, accountId, informParentDto);

        //then
        expect(Fixture.getUserService.findOneById).toHaveBeenCalledTimes(1);
        expect(Fixture.getUserService.findOneById).toHaveBeenCalledWith(kidId);

        expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledTimes(1);
        expect(Fixture.getUserService.findParentAccount).toHaveBeenCalledWith(accountId);

        expect(Fixture.getEmailService.sendEmail).toBeCalledTimes(1);
    });
});
