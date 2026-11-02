import { Test, TestingModule } from '@nestjs/testing';
import { QueryTypes } from 'sequelize';
import { FilteredUrlService } from './filtered-url.service';
import { LoggingService } from '../logger/logging.service';
import { FilteredUrl } from './entities/filtered-url.entity';
import { CreateFilteredUrlDto } from './dto/create-filtered-url.dto';
import { QueryException } from '../error/common.exception';
import { HttpStatus } from '@nestjs/common';

class Fixture {
  static getMock() {
    return jest.fn();
  }

  static FILTEREDURL_REPOSITORY = class {
    static create = Fixture.getMock();
    static update = Fixture.getMock();
    static findAll = Fixture.getMock();
    static destroy = Fixture.getMock();
    static bulkCreate = Fixture.getMock();
    static sequelize = { query: jest.fn() };
  };

  static ORG_UNIT_REPOSITORY = class {
    static findOne = Fixture.getMock();
    static findAll = Fixture.getMock();
  };

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
}

describe('Filtered url service test', () => {
  let service: FilteredUrlService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilteredUrlService,
        {
          provide: LoggingService,
          useValue: Fixture.getLoggingService(),
        },
        {
          provide: 'FILTEREDURL_REPOSITORY',
          useValue: Fixture.FILTEREDURL_REPOSITORY,
        },
        {
          provide: 'ORG_UNIT_REPOSITORY',
          useValue: Fixture.ORG_UNIT_REPOSITORY,
        },
        {
          provide: 'SEQUELIZE',
          useValue: Fixture.Sequelize,
        },
      ],
    }).compile();

    service = module.get<FilteredUrlService>(FilteredUrlService);
  });

  it('Should create filtered url', async () => {
    //given
    const obj = {
      id: 'id',
      url: 'url',
      orgUnitId: '1',
      accountId: '2',
      enabled: true,
    } as CreateFilteredUrlDto;

    //when
    await service.create(obj);

    //then
    expect(Fixture.FILTEREDURL_REPOSITORY.create).toHaveBeenCalledTimes(1);
    expect(Fixture.FILTEREDURL_REPOSITORY.create).toHaveBeenCalledWith(obj);
  });

  it('Should create filtered url in bulk', async () => {
    //given
    const obj = [
      { id: 'id', url: 'url', orgUnitId: '1', accountId: '2', enabled: true },
    ] as CreateFilteredUrlDto[];

    //when
    await service.createBulk(obj);

    //then
    expect(Fixture.FILTEREDURL_REPOSITORY.bulkCreate).toHaveBeenCalledTimes(1);
    expect(Fixture.FILTEREDURL_REPOSITORY.bulkCreate).toHaveBeenCalledWith(obj);
  });

  it('Should throw exception if error occurs when create filtered url in bulk', async () => {
    //given
    const obj = [
      { id: 'id', url: 'url', orgUnitId: '1', accountId: '2', enabled: true },
    ] as CreateFilteredUrlDto[];

    //mock dependencies
    Fixture.FILTEREDURL_REPOSITORY.bulkCreate.mockImplementationOnce(
      async () => {
        throw new QueryException(QueryException.bulkCreate());
      },
    );

    //when
    service.createBulk(obj).catch((e) => {
      //then
      expect(Fixture.FILTEREDURL_REPOSITORY.bulkCreate).toHaveBeenCalledTimes(
        1,
      );
      expect(e).toBeInstanceOf(QueryException);
      expect(e.message).toBe(QueryException.bulkCreate());
      expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  it('Should update filtered url', async () => {
    //given
    const id = '1';
    const obj = { enabled: true };

    //when
    await service.update(id, obj);

    //then
    expect(Fixture.FILTEREDURL_REPOSITORY.update).toHaveBeenCalledTimes(1);
    expect(Fixture.FILTEREDURL_REPOSITORY.update).toHaveBeenCalledWith(obj, {
      where: { id: id },
    });
  });

  it('Should find one filtered url by org unit id', async () => {
    //given
    const orgUnitId = '1';
    let url = '1';

    //when
    await service.findOne(orgUnitId, url);

    //then
    const query = `select fu.id,fu.enabled from filtered_url fu where fu.org_unit_id = :orgUnitId and fu.url LIKE :url`;
    url = `%${url}%`;
    const queryOptions = {
      replacements: { orgUnitId, url },
      type: QueryTypes.SELECT,
      mapToModel: true,
      model: FilteredUrl,
    };
    expect(
      Fixture.FILTEREDURL_REPOSITORY.sequelize.query,
    ).toHaveBeenCalledTimes(1);
    expect(Fixture.FILTEREDURL_REPOSITORY.sequelize.query).toHaveBeenCalledWith(
      query,
      queryOptions,
    );
  });

  describe('Find all urls', () => {
    it('Should find all urls by orgUnitId and accountId', async () => {
      //when
      const orgUnitId = 'orgUnitId';
      const accountId = 'accountId';
      await service.findAllByOrgUnitId(orgUnitId, accountId);

      //then
      expect(Fixture.FILTEREDURL_REPOSITORY.findAll).toHaveBeenCalledTimes(1);
      expect(Fixture.FILTEREDURL_REPOSITORY.findAll).toHaveBeenCalledWith({
        where: { orgUnitId, accountId },
      });
    });
  });

  describe('Delete urls by org unit ids', () => {
    it('Should delete urls by org unit ids', async () => {
      //given
      const orgUnitId = ['1', '2', '3'];

      //when
      await service.deleteAll(orgUnitId);

      //then
      expect(Fixture.FILTEREDURL_REPOSITORY.destroy).toHaveBeenCalledTimes(1);
      expect(Fixture.FILTEREDURL_REPOSITORY.destroy).toHaveBeenCalledWith({
        where: { orgUnitId },
      });
    });
    it('Should throw exception if error occurs when deleting filtered url by org units', async () => {
      //given
      const orgUnitIds = ['1', '2', '3'];

      //mock dependencies
      Fixture.FILTEREDURL_REPOSITORY.destroy.mockImplementationOnce(
        async () => {
          throw new QueryException(QueryException.delete());
        },
      );

      //when
      service.deleteAll(orgUnitIds).catch((e) => {
        //then
        expect(Fixture.FILTEREDURL_REPOSITORY.destroy).toHaveBeenCalledTimes(1);
        expect(e).toBeInstanceOf(QueryException);
        expect(e.message).toBe(QueryException.delete());
        expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });

  describe('Delete url by id', () => {
    it('Should delete url by id', async () => {
      //given
      const id = '3';

      //when
      await service.delete(id);

      //then
      expect(Fixture.FILTEREDURL_REPOSITORY.destroy).toHaveBeenCalledTimes(1);
      expect(Fixture.FILTEREDURL_REPOSITORY.destroy).toHaveBeenCalledWith({
        where: { id },
      });
    });
    it('Should throw exception if error occurs when deleting filtered url', async () => {
      //given
      const id = '1';

      //mock dependencies
      Fixture.FILTEREDURL_REPOSITORY.destroy.mockImplementationOnce(
        async () => {
          throw new QueryException(QueryException.delete());
        },
      );

      //when
      service.delete(id).catch((e) => {
        //then
        expect(Fixture.FILTEREDURL_REPOSITORY.destroy).toHaveBeenCalledTimes(1);
        expect(e).toBeInstanceOf(QueryException);
        expect(e.message).toBe(QueryException.delete());
        expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });

  describe('Find all types urls by org unit id', () => {
    it('Should find all types urls by org unit id', async () => {
      //given
      const userId = 'userId';
      const accountId = 'accountId';
      const expectedUrls = [
        { url: 'a.com', enabled: false },
        { url: 'b.com', enabled: true },
      ];

      Fixture.FILTEREDURL_REPOSITORY.sequelize.query.mockResolvedValueOnce(
        expectedUrls,
      );

      //when
      await service.findAllTypeUrls(accountId, userId);

      //then
      expect(
        Fixture.FILTEREDURL_REPOSITORY.sequelize.query,
      ).toHaveBeenCalledTimes(1);

      const query =
        'select * from filtered_url' +
        ' INNER JOIN user u on u.org_unit_id = filtered_url.org_unit_id ' +
        ' where u.id = :userId and filtered_url.account_id = :accountId';
      const queryOptions = {
        replacements: { accountId: accountId, userId: userId },
        type: QueryTypes.SELECT,
        mapToModel: true,
        model: FilteredUrl,
      };
      expect(
        Fixture.FILTEREDURL_REPOSITORY.sequelize.query,
      ).toHaveBeenCalledWith(query, queryOptions);
    });
  });

  describe('Save filtered categories', () => {
    it('Should save filtered categories', async () => {
      //given
      const accountId = 'accountId';
      const filteredUrlsDto = {
        orgUnitIds: ['1', '2', '3'],
        urls: [
          {
            name: 'a.com',
            enabled: true,
          },
          {
            name: 'b.com',
            enabled: true,
          },
        ],
      };

      //when
      await service.saveFilteredUrls(filteredUrlsDto, accountId);

      //then
      expect(Fixture.FILTEREDURL_REPOSITORY.destroy).toHaveBeenCalledTimes(3);
      expect(Fixture.FILTEREDURL_REPOSITORY.destroy).toHaveBeenNthCalledWith(
        1,
        { where: { orgUnitId: '1' } },
      );
      expect(Fixture.FILTEREDURL_REPOSITORY.bulkCreate).toHaveBeenCalledTimes(
        3,
      );
    });
  });

  describe('Update urls for account', () => {
    it('Should update urls for account', async () => {
      //given
      const dto = {
        url: 'url',
        accountId: 'accountId',
        enabled: true,
      };
      Fixture.ORG_UNIT_REPOSITORY.findAll.mockResolvedValueOnce([]);

      //when
      await service.updateUrlForAccount(dto);

      //then
      expect(Fixture.FILTEREDURL_REPOSITORY.destroy).toHaveBeenCalledTimes(1);
      expect(Fixture.FILTEREDURL_REPOSITORY.destroy).toHaveBeenNthCalledWith(
        1,
        {
          where: {
            url: dto.url,
            accountId: dto.accountId,
          },
          force: true,
        },
      );
      expect(Fixture.ORG_UNIT_REPOSITORY.findAll).toHaveBeenCalledTimes(1);
      expect(Fixture.ORG_UNIT_REPOSITORY.findAll).toHaveBeenCalledWith({
        where: { accountId: dto.accountId },
      });
      expect(Fixture.FILTEREDURL_REPOSITORY.bulkCreate).toHaveBeenCalledTimes(
        1,
      );
    });
  });
});
