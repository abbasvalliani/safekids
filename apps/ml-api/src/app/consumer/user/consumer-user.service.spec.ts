import { FilteredProcessService } from './../../filtered-process/filtered-process.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConsumerUserService } from './consumer-user.service';
import { UserRoles } from '../../user/user.roles';
import { OrgUnitService } from '../../org-unit/org-unit.service';
import { CreateOrgUnitDto } from '../../org-unit/dto/create-org-unit.dto';
import { Statuses } from '../../status/default-status';
import { UserDto } from './dto/user.dto';
import { ActivityService } from '../../activity/activity.service';
import { DeviceService } from '../../device/device.service';
import { UserDeviceLinkService } from '../../user-device-link/user-device-link.service';
import { FilteredUrlService } from '../../filtered-url/filtered-url.service';
import { FilteredCategoryService } from '../../filtered-category/filtered-category.service';
import { LoggingService } from '../../logger/logging.service';
import { KidConfigService } from '../../kid-config/kid-config.service';
import { CommonUtils } from '../../utils/commonUtils';
import { QueryException } from '../../error/common.exception';
import { HttpStatus } from '@nestjs/common';
import { KidRequestService } from '../../kid-request/kid-request.service';
import { ParentConsentService } from '../parent-consent/parent-consent.service';
import { PaymentService } from '../../billing/payment/payment.service';
import { SubscriptionService } from '../../billing/subscription/subscription.service';
import { SubscriptionFeedbackService } from '../../billing/subscription-feedback/subscription-feedback.service';
import { InvoiceService } from '../../billing/invoice/invoice.service';
import { PromoCodeService } from '../../billing/promo-code/promo-code.service';
import { PlanTypes } from '../../billing/plan/plan-types';

class Fixture {
  static getMock() {
    return jest.fn();
  }

  static getLoggingService() {
    return {
      className: Fixture.getMock(),
      debug: Fixture.getMock(),
      error: Fixture.getMock(),
    };
  }

  static USER_REPOSITORY = class {
    static create = Fixture.getMock();
    static findOne = Fixture.getMock();
    static update = Fixture.getMock();
    static findAll = Fixture.getMock();
    static destroy = Fixture.getMock();
  };

  static getOrgUnitService = class {
    static create = Fixture.getMock();
    static deleteAll = Fixture.getMock();
    static findOneAndUpdate = Fixture.getMock();
    static findAllByGoogleOrgUnitId = Fixture.getMock();
  };

  static getFilteredCategoryService = class {
    static deleteAll = Fixture.getMock();
    static saveDefaultCategoriesForOrgUnit = Fixture.getMock();
  };

  static getFilteredUrlService = class {
    static deleteAll = Fixture.getMock();
  };

  static getUserDeviceLinkService = class {
    static deleteAll = Fixture.getMock();
  };

  static getDeviceService = class {
    static findAllByOrgUnits = Fixture.getMock();
    static deleteAll = Fixture.getMock();
  };

  static getActivityService = class {
    static findUserLastActivity = Fixture.getMock();
    static deleteAll = Fixture.getMock();
    static findTopCategoriesByUser = Fixture.getMock();
    static findAllPrrLevelsCount = Fixture.getMock();
  };

  static getKidConfigService = class {
    static create = Fixture.getMock();
    static deleteByUserIds = Fixture.getMock();
  };

  static getKidRequestService = class {
    static deleteByKidIds = Fixture.getMock();
    static findAskRequests = Fixture.getMock();
  };

  static PLAN_REPOSITORY = class {
    static sequelize = { query: jest.fn() };
  };

  static getParentConsentService = class {
    static delete = Fixture.getMock();
  };

  static getPaymentService = class {
    static deleteAll = Fixture.getMock();
  };

  static getSubscriptionService = class {
    static delete = Fixture.getMock();
  };
  static PromoCodeService = class {
    static delete = Fixture.getMock();
  };

  static SubscriptionFeedbackService = class {
    static delete = Fixture.getMock();
  };

  static getFilteredProcessService = class {
    static deleteAll = Fixture.getMock();
  };

  static buildKids(count: number, addIds: boolean) {
    const kids = [];
    for (let i = 1; i <= count; i++) {
      const kid = {
        firstName: 'kid' + i,
        lastName: 'kid' + i,
        email: 'kid' + i + '@gmail.com',
        yearOfBirth: '2000',
        accessCode: 'accessCode' + i,
      };
      if (addIds) {
        kid['id'] = i;
      }
      if (addIds) {
        kid['id'] = i;
      }
      kids.push(kid);
    }
    return kids;
  }

  static Sequelize = class {
    static transaction = Fixture.getMock().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn(),
    });
  };

  static ACCOUNT_REPOSITORY = class {
    static findOne = Fixture.getMock();
    static destroy = Fixture.getMock();
  };

  static InvoiceService = class {
    static delete = Fixture.getMock();
  };
}

describe('Consumer user service unit tests', () => {
  let service: ConsumerUserService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerUserService,
        {
          provide: LoggingService,
          useValue: Fixture.getLoggingService(),
        },
        {
          provide: 'SEQUELIZE',
          useValue: Fixture.Sequelize,
        },
        {
          provide: 'USER_REPOSITORY',
          useValue: Fixture.USER_REPOSITORY,
        },
        {
          provide: 'ACCOUNT_REPOSITORY',
          useValue: Fixture.ACCOUNT_REPOSITORY,
        },
        {
          provide: 'PLAN_REPOSITORY',
          useValue: Fixture.PLAN_REPOSITORY,
        },
        {
          provide: ParentConsentService,
          useValue: Fixture.getParentConsentService,
        },
        {
          provide: OrgUnitService,
          useValue: Fixture.getOrgUnitService,
        },
        {
          provide: InvoiceService,
          useValue: Fixture.InvoiceService,
        },
        {
          provide: ActivityService,
          useValue: Fixture.getActivityService,
        },
        {
          provide: DeviceService,
          useValue: Fixture.getDeviceService,
        },
        {
          provide: UserDeviceLinkService,
          useValue: Fixture.getUserDeviceLinkService,
        },
        {
          provide: FilteredUrlService,
          useValue: Fixture.getFilteredUrlService,
        },
        {
          provide: FilteredCategoryService,
          useValue: Fixture.getFilteredCategoryService,
        },
        {
          provide: KidConfigService,
          useValue: Fixture.getKidConfigService,
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
          provide: PaymentService,
          useValue: Fixture.getPaymentService,
        },
        {
          provide: SubscriptionService,
          useValue: Fixture.getSubscriptionService,
        },
        {
          provide: SubscriptionFeedbackService,
          useValue: Fixture.getSubscriptionService,
        },
        {
          provide: PromoCodeService,
          useValue: Fixture.getSubscriptionService,
        },
        {
          provide: FilteredProcessService,
          useValue: Fixture.getFilteredProcessService,
        },
      ],
    }).compile();

    service = module.get<ConsumerUserService>(ConsumerUserService);
  });

  describe('Create user', () => {
    it('Should create user successfully', async () => {
      //given
      const userDTO = {
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        password: 'password',
      };

      //when
      await service.create(userDTO);

      //then
      expect(Fixture.USER_REPOSITORY.create).toHaveBeenCalledTimes(1);
      expect(Fixture.USER_REPOSITORY.create).toHaveBeenCalledWith(
        expect.objectContaining(userDTO),
      );
    });

    it('Should throw exception when create user', async () => {
      //given
      const userDTO = {
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        password: 'password',
      };

      //mock dependencies
      jest
        .spyOn(Fixture.USER_REPOSITORY, 'create')
        .mockImplementationOnce(async () => {
          throw new QueryException(QueryException.save());
        });

      //when
      service.create(userDTO).catch((e) => {
        //then
        expect(Fixture.USER_REPOSITORY.create).toHaveBeenCalledTimes(1);
        expect(Fixture.USER_REPOSITORY.create).toHaveBeenCalledWith(
          expect.objectContaining(userDTO),
        );

        expect(e).toBeInstanceOf(QueryException);
        expect(e.message).toBe(QueryException.save());
        expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });

  describe('Find one user by email', () => {
    it('Should fetch single user by email successfully', async () => {
      //given
      const email = 'email';

      //when
      await service.findOneByEmail(email);

      //then
      expect(Fixture.USER_REPOSITORY.findOne).toHaveBeenCalledTimes(1);
      expect(Fixture.USER_REPOSITORY.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });

  describe('Find one user by id', () => {
    it('Should fetch single user by id successfully', async () => {
      //given
      const id = 'id';

      //when
      await service.findOneById(id);

      //then
      expect(Fixture.USER_REPOSITORY.findOne).toHaveBeenCalledTimes(1);
      expect(Fixture.USER_REPOSITORY.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('Update user', () => {
    it('Should update user successfully', async () => {
      //given
      const id = 'id';
      const objToUpdate = { password: 'password' };

      //when
      await service.update(id, objToUpdate);

      //then
      expect(Fixture.USER_REPOSITORY.update).toHaveBeenCalledTimes(1);
      expect(Fixture.USER_REPOSITORY.update).toHaveBeenCalledWith(objToUpdate, {
        where: { id },
      });
    });

    it('Should throw exception when update user', async () => {
      //given
      const id = 'id';
      const objToUpdate = { password: 'password' };

      //mock dependencies
      jest
        .spyOn(Fixture.USER_REPOSITORY, 'update')
        .mockImplementationOnce(async () => {
          throw new QueryException(QueryException.update());
        });

      //when
      service.update(id, objToUpdate).catch((e) => {
        //then
        expect(Fixture.USER_REPOSITORY.update).toHaveBeenCalledTimes(1);
        expect(Fixture.USER_REPOSITORY.update).toHaveBeenCalledWith(
          objToUpdate,
          { where: { id } },
        );

        expect(e).toBeInstanceOf(QueryException);
        expect(e.message).toBe(QueryException.update());
        expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });

  describe('Find all users by account id', () => {
    it('Should find all users by account id successfully', async () => {
      //given
      const accountId = 'accountId';
      const role = UserRoles.KID;
      Fixture.USER_REPOSITORY.findAll.mockResolvedValueOnce([
        {
          id: 'userId',
          firstName: 'first',
          lastName: 'last',
          email: 'email',
          accessCode: 'code',
          statusId: Statuses.ACTIVE,
        },
      ]);
      Fixture.getActivityService.findUserLastActivity.mockResolvedValueOnce(
        false,
      );

      //when
      await service.findUsersByAccountId(accountId, role);

      //then
      expect(Fixture.USER_REPOSITORY.findAll).toHaveBeenCalledTimes(1);
      expect(Fixture.USER_REPOSITORY.findAll).toHaveBeenCalledWith({
        attributes: [
          'id',
          'firstName',
          'lastName',
          'accessCode',
          'statusId',
          'yearOfBirth',
        ],
        where: { accountId, role },
      });
      expect(
        Fixture.getActivityService.findUserLastActivity,
      ).toHaveBeenCalledTimes(1);
      expect(
        Fixture.getActivityService.findUserLastActivity,
      ).toHaveBeenCalledWith('userId');
    });

    it('Should find all users by account id and set connected status successfully', async () => {
      //given
      const accountId = 'accountId';
      const role = UserRoles.KID;
      Fixture.USER_REPOSITORY.findAll.mockResolvedValueOnce([
        {
          id: 'userId',
          firstName: 'first',
          lastName: 'last',
          email: 'email',
          accessCode: 'code',
          statusId: Statuses.ACTIVE,
        },
      ]);
      Fixture.getActivityService.findUserLastActivity.mockResolvedValueOnce(
        true,
      );

      //when
      await service.findUsersByAccountId(accountId, role);

      //then
      expect(Fixture.USER_REPOSITORY.findAll).toHaveBeenCalledTimes(1);
      expect(Fixture.USER_REPOSITORY.findAll).toHaveBeenCalledWith({
        attributes: [
          'id',
          'firstName',
          'lastName',
          'accessCode',
          'statusId',
          'yearOfBirth',
        ],
        where: { accountId, role },
      });
      expect(
        Fixture.getActivityService.findUserLastActivity,
      ).toHaveBeenCalledTimes(1);
      expect(
        Fixture.getActivityService.findUserLastActivity,
      ).toHaveBeenCalledWith('userId');
    });
  });

  describe('Sync kids', () => {
    it('Should create kids successfully', async () => {
      //given
      const parentId = 'parentId';
      const accountId = 'accountId';
      const kidsCount = 2;
      const kidsToCreate = Fixture.buildKids(kidsCount, false);
      const parentEmail = 'parentEmail';
      const orgUnitId = 'orgUnitId';
      const userId1 = 'userId1';
      const userId2 = 'userId2';

      //mock dependencies
      Fixture.USER_REPOSITORY.findOne.mockResolvedValueOnce({
        email: parentEmail,
        id: parentId,
      });
      Fixture.USER_REPOSITORY.findAll.mockResolvedValueOnce([]);
      Fixture.USER_REPOSITORY.create.mockResolvedValueOnce({ id: userId1 });
      Fixture.USER_REPOSITORY.create.mockResolvedValueOnce({ id: userId2 });
      Fixture.getOrgUnitService.create.mockResolvedValue({ id: orgUnitId });
      Fixture.USER_REPOSITORY.findOne.mockResolvedValueOnce(true);
      Fixture.PLAN_REPOSITORY.sequelize.query.mockResolvedValueOnce([
        { planType: PlanTypes.FREE },
      ]);
      jest
        .spyOn(CommonUtils, 'generate6DigitAlphanumericCode')
        .mockResolvedValueOnce('ABC123');
      jest
        .spyOn(CommonUtils, 'generate6DigitAlphanumericCode')
        .mockResolvedValueOnce('ASD123');
      jest
        .spyOn(CommonUtils, 'generate6DigitAlphanumericCode')
        .mockResolvedValueOnce('ABC123');
      jest
        .spyOn(CommonUtils, 'generate6DigitAlphanumericCode')
        .mockResolvedValueOnce('ASD123');

      //when
      await service.syncKids(parentId, accountId, kidsToCreate);

      //then

      //parent user was searched only once
      expect(Fixture.USER_REPOSITORY.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: parentId },
      });
      //existing kids were searched only once
      expect(Fixture.USER_REPOSITORY.findAll).toHaveBeenNthCalledWith(1, {
        where: { accountId, role: UserRoles.KID },
      });

      //For both kids access code was checked with existing kids
      expect(Fixture.USER_REPOSITORY.findOne).toHaveBeenNthCalledWith(2, {
        where: { accessCode: 'ABC123' },
      });
      expect(Fixture.USER_REPOSITORY.findOne).toHaveBeenNthCalledWith(3, {
        where: { accessCode: 'ASD123' },
      });

      //parent user was searched only once
      expect(Fixture.USER_REPOSITORY.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: parentId },
      });
      //existing kids were searched only once
      expect(Fixture.USER_REPOSITORY.findAll).toHaveBeenNthCalledWith(1, {
        where: { accountId, role: UserRoles.KID },
      });

      //For both kids access code was checked with existing kids
      expect(Fixture.USER_REPOSITORY.findOne).toHaveBeenNthCalledWith(2, {
        where: { accessCode: 'ABC123' },
      });
      expect(Fixture.USER_REPOSITORY.findOne).toHaveBeenNthCalledWith(3, {
        where: { accessCode: 'ASD123' },
      });

      expect(Fixture.USER_REPOSITORY.findOne).toHaveBeenCalledTimes(4);

      //Org units created for each kid
      expect(Fixture.getOrgUnitService.create).toHaveBeenCalledTimes(kidsCount);
      const orgUnitDTO = {
        name: kidsToCreate[0].firstName + ' ' + kidsToCreate[0].lastName,
        accountId: accountId,
        orgUnitPath:
          '/' + kidsToCreate[0].firstName + ' ' + kidsToCreate[0].lastName,
        parent: '/',
        parentOuId: 'id:' + parentEmail,
      } as CreateOrgUnitDto;
      expect(Fixture.getOrgUnitService.create).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining(orgUnitDTO),
      );
      const orgUnitDTO2 = {
        name: kidsToCreate[1].firstName + ' ' + kidsToCreate[1].lastName,
        accountId: accountId,
        orgUnitPath: `/${kidsToCreate[1].firstName} ${kidsToCreate[1].lastName}`,
        parent: '/',
        parentOuId: 'id:' + parentEmail,
      } as CreateOrgUnitDto;
      expect(Fixture.getOrgUnitService.create).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining(orgUnitDTO2),
      );

      //Filtered categories were created for each kid
      expect(
        Fixture.getFilteredCategoryService.saveDefaultCategoriesForOrgUnit,
      ).toHaveBeenCalledTimes(kidsCount);
      expect(
        Fixture.getFilteredCategoryService.saveDefaultCategoriesForOrgUnit,
      ).toHaveBeenCalledWith(accountId, orgUnitId, PlanTypes.FREE);

      //Two new users created
      expect(Fixture.USER_REPOSITORY.create).toHaveBeenCalledTimes(kidsCount);
      const userDTO1 = {
        firstName: kidsToCreate[0].firstName,
        lastName: kidsToCreate[0].lastName,
        yearOfBirth: kidsToCreate[0].yearOfBirth,
        accountId: accountId,
        orgUnitId: orgUnitId,
        role: UserRoles.KID,
        statusId: Statuses.INACTIVE,
      } as UserDto;
      expect(Fixture.USER_REPOSITORY.create).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining(userDTO1),
      );
      const userDTO2 = {
        firstName: kidsToCreate[1].firstName,
        lastName: kidsToCreate[1].lastName,
        yearOfBirth: kidsToCreate[1].yearOfBirth,
        accountId: accountId,
        orgUnitId: orgUnitId,
        role: UserRoles.KID,
        statusId: Statuses.INACTIVE,
      } as UserDto;
      expect(Fixture.USER_REPOSITORY.create).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining(userDTO2),
      );

      //Default configurations were created for each kid
      expect(Fixture.getKidConfigService.create).toHaveBeenCalledTimes(
        kidsCount,
      );
      expect(Fixture.getKidConfigService.create).toHaveBeenNthCalledWith(
        1,
        userId1,
      );
      expect(Fixture.getKidConfigService.create).toHaveBeenNthCalledWith(
        2,
        userId2,
      );

      //NO update calls
      expect(Fixture.getOrgUnitService.findOneAndUpdate).toHaveBeenCalledTimes(
        0,
      );
      expect(Fixture.USER_REPOSITORY.update).toHaveBeenCalledTimes(0);

      //NO deletion calls
      expect(
        Fixture.getOrgUnitService.findAllByGoogleOrgUnitId,
      ).toHaveBeenCalledTimes(0);
      expect(Fixture.USER_REPOSITORY.destroy).toHaveBeenCalledTimes(0);
    });

    it('Should update kids successfully', async () => {
      //given
      const parentId = 'parentId';
      const accountId = 'accountId';
      const kidsCount = 2;
      const kidsToUpdate = Fixture.buildKids(kidsCount, true);
      const parentEmail = 'parentEmail';

      //mock dependencies
      Fixture.USER_REPOSITORY.findOne.mockResolvedValueOnce({
        email: parentEmail,
        id: parentId,
      });
      Fixture.USER_REPOSITORY.findAll.mockResolvedValueOnce(kidsToUpdate);
      Fixture.USER_REPOSITORY.findOne.mockResolvedValueOnce(kidsToUpdate[0]);
      Fixture.USER_REPOSITORY.findOne.mockResolvedValueOnce(kidsToUpdate[1]);
      Fixture.PLAN_REPOSITORY.sequelize.query.mockResolvedValueOnce([
        { planType: PlanTypes.FREE },
      ]);

      //when
      await service.syncKids(parentId, accountId, kidsToUpdate);

      //then

      //parent user was searched only once
      expect(Fixture.USER_REPOSITORY.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: parentId },
      });
      //existing kids were searched only once
      expect(Fixture.USER_REPOSITORY.findAll).toHaveBeenNthCalledWith(1, {
        where: { accountId, role: UserRoles.KID },
      });

      //Org units updated for each kid
      expect(Fixture.getOrgUnitService.findOneAndUpdate).toHaveBeenCalledTimes(
        2,
      );

      //Two users updated
      expect(Fixture.USER_REPOSITORY.update).toHaveBeenCalledTimes(2);

      //No add calls
      expect(Fixture.getOrgUnitService.create).toHaveBeenCalledTimes(0);
      expect(
        Fixture.getFilteredCategoryService.saveDefaultCategoriesForOrgUnit,
      ).toHaveBeenCalledTimes(0);
      expect(Fixture.USER_REPOSITORY.create).toHaveBeenCalledTimes(0);
      expect(Fixture.getKidConfigService.create).toHaveBeenCalledTimes(0);

      //NO deletion calls
      expect(
        Fixture.getOrgUnitService.findAllByGoogleOrgUnitId,
      ).toHaveBeenCalledTimes(0);
      expect(Fixture.USER_REPOSITORY.destroy).toHaveBeenCalledTimes(0);
    });

    it('Should delete kids successfully', async () => {
      //given
      const parentId = 'parentId';
      const accountId = 'accountId';
      const kidsCount = 2;
      const kidsToDelete = Fixture.buildKids(kidsCount, true);
      const parentEmail = 'parentEmail';
      const orgUnits = [{ id: '1' }, { id: '2' }];
      const devices = [{ id: '1' }, { id: '2' }];

      let existingKids = Fixture.buildKids(kidsCount, true);
      existingKids.forEach((kid) => (kid.id = kid.id + '-deleted'));

      //mock dependencies
      Fixture.USER_REPOSITORY.findOne.mockResolvedValueOnce({
        email: parentEmail,
        id: parentId,
      });
      Fixture.USER_REPOSITORY.findAll.mockResolvedValueOnce(existingKids);
      Fixture.USER_REPOSITORY.findAll.mockResolvedValueOnce(existingKids);
      Fixture.USER_REPOSITORY.findOne.mockResolvedValueOnce(kidsToDelete[0]);
      Fixture.USER_REPOSITORY.findOne.mockResolvedValueOnce(kidsToDelete[1]);
      Fixture.getOrgUnitService.findAllByGoogleOrgUnitId.mockResolvedValue(
        orgUnits,
      );
      Fixture.getDeviceService.findAllByOrgUnits.mockResolvedValue(devices);
      Fixture.PLAN_REPOSITORY.sequelize.query.mockResolvedValueOnce([
        { planType: PlanTypes.FREE },
      ]);

      //when
      await service.syncKids(parentId, accountId, kidsToDelete);

      //then

      //parent user was searched only once
      expect(Fixture.USER_REPOSITORY.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: parentId },
      });
      //existing kids were searched only once
      expect(Fixture.USER_REPOSITORY.findAll).toHaveBeenNthCalledWith(1, {
        where: { accountId, role: UserRoles.KID },
      });
      //kids for access codes were searched only once
      existingKids = existingKids.map((kid) => kid.id);
      expect(Fixture.USER_REPOSITORY.findAll).toHaveBeenNthCalledWith(2, {
        attributes: ['id', 'accessCode'],
        where: { id: existingKids },
      });

      expect(
        Fixture.getOrgUnitService.findAllByGoogleOrgUnitId,
      ).toHaveBeenCalledTimes(1);
      expect(Fixture.getDeviceService.findAllByOrgUnits).toHaveBeenCalledTimes(
        1,
      );

      expect(Fixture.USER_REPOSITORY.destroy).toHaveBeenCalledTimes(1);
      expect(Fixture.getKidConfigService.deleteByUserIds).toHaveBeenCalledTimes(
        1,
      );

      //No add calls
      expect(Fixture.getOrgUnitService.create).toHaveBeenCalledTimes(0);
      expect(
        Fixture.getFilteredCategoryService.saveDefaultCategoriesForOrgUnit,
      ).toHaveBeenCalledTimes(0);
      expect(Fixture.USER_REPOSITORY.create).toHaveBeenCalledTimes(0);
      expect(Fixture.getKidConfigService.create).toHaveBeenCalledTimes(0);

      expect(Fixture.getOrgUnitService.findOneAndUpdate).toHaveBeenCalledTimes(
        2,
      );
      expect(Fixture.USER_REPOSITORY.update).toHaveBeenCalledTimes(2);
    });

    it('Should throw exception when create kids', async () => {
      //given
      const parentId = 'parentId';
      const accountId = 'accountId';
      const kidsCount = 2;
      const kidsToCreate = Fixture.buildKids(kidsCount, false);

      //mock dependencies
      jest.spyOn(service, 'findOneById').mockImplementationOnce(async () => {
        throw new QueryException(QueryException.save());
      });
      Fixture.PLAN_REPOSITORY.sequelize.query.mockResolvedValueOnce([
        { planType: PlanTypes.FREE },
      ]);

      //when
      service.syncKids(parentId, accountId, kidsToCreate).catch((e) => {
        //then
        expect(e).toBeInstanceOf(QueryException);
        expect(e.message).toBe(QueryException.save());
        expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });

  it('Should find consumer kids successfully', async () => {
    //given

    const userId = 'userId';
    const startDate = new Date();
    const endDate = new Date();
    const accountId = 'accountId';

    //mock dependencies
    Fixture.USER_REPOSITORY.findAll.mockResolvedValueOnce([
      { id: userId, firstName: 'a', lastName: '', statusId: Statuses.ACTIVE },
    ]);
    Fixture.getActivityService.findUserLastActivity.mockResolvedValueOnce(
      new Date().getTime(),
    );

    //when
    await service.findConsumerKids(accountId, startDate, endDate);

    //then
    expect(Fixture.USER_REPOSITORY.findAll).toHaveBeenCalledTimes(1);
    expect(Fixture.USER_REPOSITORY.findAll).toHaveBeenCalledWith({
      attributes: [
        'id',
        'firstName',
        'lastName',
        'accessCode',
        'statusId',
        'yearOfBirth',
        'accessLimited',
      ],
      where: { accountId, role: UserRoles.KID },
    });

    expect(
      Fixture.getActivityService.findUserLastActivity,
    ).toHaveBeenCalledTimes(1);
    expect(
      Fixture.getActivityService.findUserLastActivity,
    ).toHaveBeenCalledWith(userId);

    expect(
      Fixture.getActivityService.findTopCategoriesByUser,
    ).toHaveBeenCalledTimes(1);
    expect(
      Fixture.getActivityService.findAllPrrLevelsCount,
    ).toHaveBeenCalledTimes(1);

    expect(Fixture.getKidRequestService.findAskRequests).toHaveBeenCalledWith(
      userId,
    );
    expect(Fixture.getKidRequestService.findAskRequests).toHaveBeenCalledTimes(
      1,
    );
  });
});
