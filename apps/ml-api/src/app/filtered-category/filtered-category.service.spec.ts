import { Test, TestingModule } from '@nestjs/testing';
import { FilteredCategoryService } from './filtered-category.service';
import { DefaultCategoryService } from '../category/default-category.service';
import { QueryTypes } from 'sequelize';
import { FilteredCategory } from './entities/filtered-category.entity';
import { AccountTypes } from '../account-type/dto/account-types';
import { CategoryDTO } from './dto/filtered-category.dto';
import { LoggingService } from '../logger/logging.service';
import { CategoryStatus } from '../category/category.status';
import { QueryException } from '../error/common.exception';
import { HttpStatus } from '@nestjs/common';
import { AccountService } from '../accounts/account.service';

class Fixture {
  static getMock() {
    return jest.fn();
  }

  static getLoggingService() {
    return {
      className: Fixture.getMock(),
      debug: Fixture.getMock(),
      info: Fixture.getMock(),
      error: Fixture.getMock(),
    };
  }

  static FILTEREDCATEGORY_REPOSITORY = class {
    static findAll = Fixture.getMock();
    static destroy = Fixture.getMock();
    static bulkCreate = Fixture.getMock();
    static sequelize = { query: jest.fn() };
    static update = Fixture.getMock();
  };

  static getAccountService = class {
    static getAccountType = Fixture.getMock();
  };

  static Sequelize = class {
    static transaction = Fixture.getMock().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn(),
    });
  };

  static getCategoryService = class {
    static findAllByStatus = Fixture.getMock();
  };
}

describe('Filtered category service test', () => {
  let service: FilteredCategoryService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilteredCategoryService,
        {
          provide: LoggingService,
          useValue: Fixture.getLoggingService(),
        },
        {
          provide: 'FILTEREDCATEGORY_REPOSITORY',
          useValue: Fixture.FILTEREDCATEGORY_REPOSITORY,
        },
        {
          provide: AccountService,
          useValue: Fixture.getAccountService,
        },
        {
          provide: 'SEQUELIZE',
          useValue: Fixture.Sequelize,
        },
        {
          provide: DefaultCategoryService,
          useValue: Fixture.getCategoryService,
        },
      ],
    }).compile();

    service = module.get<FilteredCategoryService>(FilteredCategoryService);
  });

  describe('Find all categories', () => {
    it('Should find all categories by orgUnitId and accountId when no categories exists already', async () => {
      //when
      const orgUnitId = 'orgUnitId';
      const accountId = 'accountId';

      //mock dependencies
      Fixture.FILTEREDCATEGORY_REPOSITORY.findAll.mockResolvedValueOnce([]);
      jest
        .spyOn(service, 'saveDefaultCategoriesForOrgUnit')
        .mockResolvedValueOnce();

      //when
      await service.findAllByOrgUnitId(orgUnitId, accountId);

      //then
      expect(Fixture.FILTEREDCATEGORY_REPOSITORY.findAll).toHaveBeenCalledTimes(
        2,
      );
      expect(Fixture.FILTEREDCATEGORY_REPOSITORY.findAll).toHaveBeenCalledWith({
        where: { orgUnitId, accountId },
        order: [['name', 'ASC']],
      });
    });

    it('Should find all categories by orgUnitId and accountId when categories exists already', async () => {
      //given
      const orgUnitId = 'orgUnitId';
      const accountId = 'accountId';

      //mock dependencies
      const categories = [
        {
          id: 'VIOLENCE',
          name: 'Violence',
          enabled: true,
          schoolDefault: false,
          editable: false,
        },
        {
          id: 'WEAPONS',
          name: 'Weapons',
          enabled: true,
          schoolDefault: false,
          editable: false,
        },
      ];
      Fixture.FILTEREDCATEGORY_REPOSITORY.findAll.mockResolvedValueOnce(
        categories,
      );

      //when
      await service.findAllByOrgUnitId(orgUnitId, accountId);

      //then
      expect(Fixture.FILTEREDCATEGORY_REPOSITORY.findAll).toHaveBeenCalledTimes(
        1,
      );
      expect(Fixture.FILTEREDCATEGORY_REPOSITORY.findAll).toHaveBeenCalledWith({
        where: { orgUnitId, accountId },
        order: [['name', 'ASC']],
      });
    });
  });

  describe('Find all categories by accountId and userId', () => {
    it('Should find all categories by userId and accountId when no categories exists already', async () => {
      //given
      const userId = 'userId';
      const accountId = 'accountId';
      const orgUnitId = 'orgUnitId';
      const expectedResponse = [{ categoryId: 'ALCOHOL' }];

      //mock dependencies
      Fixture.FILTEREDCATEGORY_REPOSITORY.sequelize.query.mockResolvedValueOnce(
        [],
      );
      Fixture.FILTEREDCATEGORY_REPOSITORY.sequelize.query.mockResolvedValueOnce(
        expectedResponse,
      );
      jest
        .spyOn(service, 'saveDefaultCategoriesForOrgUnit')
        .mockResolvedValueOnce();
      const accountType = 'SCHOOL';
      Fixture.getAccountService.getAccountType.mockResolvedValueOnce({
        accountType,
      });
      Fixture.getAccountService.getAccountType.mockResolvedValueOnce({
        accountType,
      });

      //when
      const response = await service.findAllByAccountAndUserId(
        accountId,
        userId,
        orgUnitId,
      );

      //then
      expect(
        Fixture.FILTEREDCATEGORY_REPOSITORY.sequelize.query,
      ).toHaveBeenCalledTimes(2);
      const sql =
        'select * from filtered_category' +
        ' INNER JOIN user u on u.org_unit_id = filtered_category.org_unit_id ' +
        ' where u.id = :userId and filtered_category.account_id = :accountId and enabled=:enabled';
      const queryOptions = {
        replacements: { accountId: accountId, userId: userId, enabled: true },
        type: QueryTypes.SELECT,
        mapToModel: true,
        model: FilteredCategory,
      };
      expect(
        Fixture.FILTEREDCATEGORY_REPOSITORY.sequelize.query,
      ).toHaveBeenCalledWith(sql, queryOptions);
      expect(response).toEqual(expectedResponse);
      expect(response).toEqual(expectedResponse);
    });

    it('Should find all categories by userId and accountId when categories exists already', async () => {
      //given
      const userId = 'userId';
      const accountId = 'accountId';
      const orgUnitId = 'orgUnitId';
      const expectedResponse = [{ categoryId: 'ALCOHOL' }];
      Fixture.FILTEREDCATEGORY_REPOSITORY.sequelize.query.mockResolvedValueOnce(
        expectedResponse,
      );
      const accountType = 'CONSUMER';
      Fixture.getAccountService.getAccountType.mockResolvedValueOnce({
        accountType,
      });

      //when
      const response = await service.findAllByAccountAndUserId(
        accountId,
        userId,
        orgUnitId,
      );

      //then
      expect(
        Fixture.FILTEREDCATEGORY_REPOSITORY.sequelize.query,
      ).toHaveBeenCalledTimes(1);
      const sql =
        'select * from filtered_category' +
        ' INNER JOIN user u on u.org_unit_id = filtered_category.org_unit_id ' +
        ' where u.id = :userId and filtered_category.account_id = :accountId';
      const queryOptions = {
        replacements: { accountId: accountId, userId: userId },
        type: QueryTypes.SELECT,
        mapToModel: true,
        model: FilteredCategory,
      };
      expect(
        Fixture.FILTEREDCATEGORY_REPOSITORY.sequelize.query,
      ).toHaveBeenCalledWith(sql, queryOptions);
      expect(response).toEqual(expectedResponse);
      expect(response).toEqual(expectedResponse);
    });
  });

  describe('Delete categories by org unit ids', () => {
    it('Should delete categories by org unit ids', async () => {
      //given
      const orgUnitId = ['1', '2', '3'];

      //when
      await service.deleteAll(orgUnitId);

      //then
      expect(Fixture.FILTEREDCATEGORY_REPOSITORY.destroy).toHaveBeenCalledTimes(
        1,
      );
      expect(Fixture.FILTEREDCATEGORY_REPOSITORY.destroy).toHaveBeenCalledWith({
        where: { orgUnitId },
      });
    });
    it('Should throw exception when delete categories by org unit ids', async () => {
      //given
      const orgUnitId = ['1', '2', '3'];

      //mock dependencies
      jest
        .spyOn(Fixture.FILTEREDCATEGORY_REPOSITORY, 'destroy')
        .mockImplementationOnce(async () => {
          throw new QueryException(QueryException.delete());
        });

      //when
      service.deleteAll(orgUnitId).catch((e) => {
        //then
        expect(
          Fixture.FILTEREDCATEGORY_REPOSITORY.destroy,
        ).toHaveBeenCalledTimes(1);
        expect(
          Fixture.FILTEREDCATEGORY_REPOSITORY.destroy,
        ).toHaveBeenCalledWith({ where: { orgUnitId } });
        expect(e).toBeInstanceOf(QueryException);
        expect(e.message).toBe(QueryException.delete());
        expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });

  describe('Save default categories for orgUnit', () => {
    it('Should save default categories for orgUnit', async () => {
      //given
      const orgUnitId = 'orgUnitId';
      const accountId = 'accountId';

      const categories = [
        {
          id: 'VIOLENCE',
          name: 'Violence',
          enabled: true,
          schoolDefault: false,
          editable: false,
        },
        {
          id: 'WEAPONS',
          name: 'Weapons',
          enabled: true,
          schoolDefault: false,
          editable: false,
        },
      ];
      Fixture.getCategoryService.findAllByStatus.mockResolvedValueOnce(
        categories,
      );
      jest
        .spyOn(service, 'saveDefaultFilteredCategories')
        .mockResolvedValueOnce();
      const accountType = 'CONSUMER';
      Fixture.getAccountService.getAccountType.mockResolvedValueOnce({
        accountType,
      });

      //when
      await service.saveDefaultCategoriesForOrgUnit(accountId, orgUnitId, null);

      //then
      expect(Fixture.getAccountService.getAccountType).toHaveBeenCalledTimes(1);
      expect(Fixture.getAccountService.getAccountType).toHaveBeenCalledWith(
        accountId,
      );
      expect(Fixture.getCategoryService.findAllByStatus).toHaveBeenCalledTimes(
        1,
      );
      expect(Fixture.getCategoryService.findAllByStatus).toHaveBeenCalledWith(
        true,
      );
      expect(service.saveDefaultFilteredCategories).toHaveBeenCalledTimes(1);
      const expected = {
        categories: categories.map((category) => {
          return {
            name: category.name,
            id: category.id,
            enabled:
              accountType === AccountTypes.CONSUMER
                ? category.enabled
                : !category.schoolDefault,
            orgUnitId: orgUnitId,
          } as CategoryDTO;
        }),
        orgUnitIds: [orgUnitId],
      };
      expect(service.saveDefaultFilteredCategories).toHaveBeenCalledWith(
        expected,
        accountId,
        accountType,
        null,
      );
    });
  });

  describe('Save filtered categories', () => {
    it('Should save filtered categories', async () => {
      //given
      const accountId = 'accountId';
      const accountType = 'CONSUMER';
      Fixture.getAccountService.getAccountType.mockResolvedValueOnce({
        accountType,
      });
      const filteredCategoryDto = {
        orgUnitIds: ['1', '2', '3'],
        categories: [
          {
            id: 'VIOLENCE',
            name: 'Violence',
            enabled: true,
            status: CategoryStatus.ALLOW,
            timeDuration: 30,
          },
          {
            id: 'WEAPONS',
            name: 'Weapons',
            enabled: true,
            status: CategoryStatus.INFORM,
            timeDuration: 30,
          },
        ],
      };

      //when
      await service.saveFilteredCategories(filteredCategoryDto, accountId);

      //then
      expect(Fixture.FILTEREDCATEGORY_REPOSITORY.destroy).toHaveBeenCalledTimes(
        3,
      );
      expect(
        Fixture.FILTEREDCATEGORY_REPOSITORY.destroy.mock.calls[0][0],
      ).toEqual(expect.objectContaining({ where: { orgUnitId: '1' } }));
      expect(
        Fixture.FILTEREDCATEGORY_REPOSITORY.bulkCreate,
      ).toHaveBeenCalledTimes(3);
    });

    it('Should throw exception Should save filtered categories', async () => {
      //given
      const accountId = 'accountId';
      const accountType = 'CONSUMER';
      Fixture.getAccountService.getAccountType.mockResolvedValueOnce({
        accountType,
      });
      const filteredCategoryDto = {
        orgUnitIds: ['1', '2', '3'],
        categories: [
          {
            id: 'VIOLENCE',
            name: 'Violence',
            enabled: true,
            status: CategoryStatus.ALLOW,
            timeDuration: 30,
          },
          {
            id: 'WEAPONS',
            name: 'Weapons',
            enabled: true,
            status: CategoryStatus.INFORM,
            timeDuration: 30,
          },
        ],
      };

      //mock dependencies
      jest
        .spyOn(Fixture.FILTEREDCATEGORY_REPOSITORY, 'destroy')
        .mockImplementationOnce(async () => {
          throw new QueryException(QueryException.delete());
        });

      //when
      service
        .saveFilteredCategories(filteredCategoryDto, accountId)
        .catch((e) => {
          //then
          expect(
            Fixture.FILTEREDCATEGORY_REPOSITORY.destroy,
          ).toHaveBeenCalledTimes(1);
          expect(
            Fixture.FILTEREDCATEGORY_REPOSITORY.destroy.mock.calls[0][0],
          ).toEqual(expect.objectContaining({ where: { orgUnitId: '1' } }));
          expect(
            Fixture.FILTEREDCATEGORY_REPOSITORY.bulkCreate,
          ).toHaveBeenCalledTimes(0);

          expect(e).toBeInstanceOf(QueryException);
          expect(e.message).toBe(QueryException.save());
          expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });
    });
  });

  describe('Update filtered category', () => {
    it('Should update filtered category', async () => {
      //given
      const accountId = 'accountId';
      const orgUnitId = 'orgUnitId';
      const categoryId = 'ONLINE_GAMING';
      const filteredCategoryDto = {
        status: CategoryStatus.ALLOW,
      };

      //when
      await service.updateCategory(
        accountId,
        orgUnitId,
        categoryId,
        filteredCategoryDto,
      );

      //then
      expect(Fixture.FILTEREDCATEGORY_REPOSITORY.update).toHaveBeenCalledTimes(
        1,
      );
      expect(Fixture.FILTEREDCATEGORY_REPOSITORY.update).toHaveBeenCalledWith(
        filteredCategoryDto,
        { where: { orgUnitId, accountId, categoryId } },
      );
    });
    it('Should throw exception when update filtered category', async () => {
      //given
      const accountId = 'accountId';
      const orgUnitId = 'orgUnitId';
      const categoryId = 'ONLINE_GAMING';
      const filteredCategoryDto = {
        status: CategoryStatus.ALLOW,
      };

      jest
        .spyOn(Fixture.FILTEREDCATEGORY_REPOSITORY, 'update')
        .mockImplementationOnce(async () => {
          throw new QueryException(QueryException.update());
        });

      //when
      service
        .updateCategory(accountId, orgUnitId, categoryId, filteredCategoryDto)
        .catch((e) => {
          //then
          expect(
            Fixture.FILTEREDCATEGORY_REPOSITORY.update,
          ).toHaveBeenCalledTimes(1);
          expect(
            Fixture.FILTEREDCATEGORY_REPOSITORY.update,
          ).toHaveBeenCalledWith(filteredCategoryDto, {
            where: { orgUnitId, accountId, categoryId },
          });

          expect(e).toBeInstanceOf(QueryException);
          expect(e.message).toBe(QueryException.update());
          expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        });
    });
  });

  it('Should save default filtered categories', async () => {
    //given
    const accountId = 'accountId';
    const accountType = 'CONSUMER';
    Fixture.getAccountService.getAccountType.mockResolvedValueOnce({
      accountType,
    });
    const filteredCategoryDto = {
      orgUnitIds: ['1', '2', '3'],
      categories: [
        {
          id: 'VIOLENCE',
          name: 'Violence',
          enabled: true,
          status: CategoryStatus.ALLOW,
          timeDuration: 30,
        },
        {
          id: 'WEAPONS',
          name: 'Weapons',
          enabled: true,
          status: CategoryStatus.INFORM,
          timeDuration: 30,
        },
      ],
    };

    //when
    await service.saveDefaultFilteredCategories(
      filteredCategoryDto,
      accountId,
      accountType,
      null,
    );

    //then
    expect(Fixture.FILTEREDCATEGORY_REPOSITORY.destroy).toHaveBeenCalledTimes(
      3,
    );
    expect(
      Fixture.FILTEREDCATEGORY_REPOSITORY.destroy.mock.calls[0][0],
    ).toEqual(expect.objectContaining({ where: { orgUnitId: '1' } }));
    expect(
      Fixture.FILTEREDCATEGORY_REPOSITORY.bulkCreate,
    ).toHaveBeenCalledTimes(3);
  });
});
