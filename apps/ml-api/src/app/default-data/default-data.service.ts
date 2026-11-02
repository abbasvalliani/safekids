import {DEFAULT_EMAIL_TEMPLATES} from '../data/default.emails';
import {EmailTemplateDTO} from '../email/dto/email.template.dto';
import {LoggingService} from '../logger/logging.service';
import {Injectable, InternalServerErrorException} from '@nestjs/common';
import * as fs from 'fs';
import {ConfigService} from '@nestjs/config';
import {EmailTemplateService} from '../email/email.template.service';
import {EmailTemplateInterface} from '../email/email.interfaces';
import _ from 'lodash';
import {config} from 'dotenv';
import {DefaultDataErrors} from './default.data.errors';
import {DefaultCategoryService} from '../category/default-category.service';
import {UrlService} from '../url/url.service';
import {StatusService} from '../status/status.service';
import {PrrLevelService} from '../prr-level/prr-level.service';
import {AccountTypeService} from '../account-type/account-type.service';
import {DeviceTypeService} from '../device-type/device-type.service';
import {PrrTriggerService} from '../prr-trigger/prr-trigger.service';
import {OnBoardingStepService} from '../onboarding-step/on-boarding-step.service';
import {ActivityTypeService} from '../activity-type/activity-type.service';
import {CalendarService} from '../calendar/calendar.service';
import {RoleService} from '../role/role.service';
import {LicenseService} from '../license/license.service';
import {EmailEventTypeService} from '../email-event-type/email-event-type.service';
import {PrrActionService} from '../prr-action/prr-action.service';
import {PlanService} from '../billing/plan/plan.service';
import {CouponService} from '../billing/coupon/coupon.service';
import {AuthService} from '../consumer/auth/auth.service';
import {ExpressConfig} from "../config/express";

config({ quiet: true }); // dotenv 17+ logs on load unless quiet

@Injectable()
export class DefaultDataService {
  private readonly isDevelopment: boolean

  constructor(
    private readonly log: LoggingService,
    private readonly config: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly onBoardingCategoryService: DefaultCategoryService,
    private readonly statusService: StatusService,
    private readonly onBoardingStepService: OnBoardingStepService,
    private readonly urlService: UrlService,
    private readonly prrLevelService: PrrLevelService,
    private readonly prrTriggerService: PrrTriggerService,
    private readonly calendarService: CalendarService,
    private readonly accountTypeService: AccountTypeService,
    private readonly deviceTypeService: DeviceTypeService,
    private readonly activeTypeService: ActivityTypeService,
    private readonly roleService: RoleService,
    private readonly licenseService: LicenseService,
    private readonly prrActionService: PrrActionService,
    private readonly emailEventTypeService: EmailEventTypeService,
    private readonly planService: PlanService,
    private readonly couponService: CouponService,
    private readonly authService: AuthService
  ) {
    if (!this.config) {
      throw new Error("Config service not configured")
    }
    if (!this.log) {
      throw new Error("Logger not configured")
    }
    this.isDevelopment = config.get<ExpressConfig>("expressConfig").isDevelopment()

    this.log.className(DefaultDataService.name);
  }

  async insertDefaultData(): Promise<void> {
    try {
      this.log.info('Seeding the database with application default configurations');
      //mysql seeding
      await this.insertDefaultLicenses();
      await this.insertDefaultStatuses();
      await this.insertDefaultCategories();
      await this.insertDefaultUrls();
      await this.insertDefaultOnBoardingSteps();
      await this.insertDefaultRoles();
      //PRR Default Lookup Data
      await this.insertDefaultActivityTypes();
      await this.insertDefaultHolidays();

      await this.insertDefaultPRRContents();
      await this.insertDefaultPRRLevels();
      await this.insertDefaultPRRActions();
      await this.insertDefaultPRRTriggers();

      await this.insertDefaultDeviceTypes();
      await this.insertDefaultAccountTypes();
      await this.planService.seedDefaultPlans();
      await this.couponService.seedDefaultCoupons();
      await this.authService.migrateConsumers();
      await this.authService.migrateFreePlans();
      await this.insertEmailEventTypes();
      await this.insertDefaultEmailTemplates();
    } catch (err) {
      this.log.error(DefaultDataErrors.appLoad(), err);
      throw new InternalServerErrorException(DefaultDataErrors.appLoad());
    }
  }

  getHtmlsForEmailTemplates(templates): Array<Omit<EmailTemplateDTO, '_id'>> {
    const templatesCopy = JSON.parse(JSON.stringify(templates));
    return templatesCopy.map((template) => {
      template.content.Body = template.content.Body = fs.readFileSync(template.content.Body, 'utf8');
      return template;
    });
  }

  async insertDefaultEmailTemplates(): Promise<void> {
    const emailTemplates = this.getHtmlsForEmailTemplates(DEFAULT_EMAIL_TEMPLATES);

    //update email templates
    //await this.emailTemplateService.deleteAll()
    const serverTemplates: EmailTemplateInterface[] = await this.emailTemplateService.list();

    //insert or update templates on the service
    emailTemplates.map(async (template) => {
      const serverTemplate = _.find(serverTemplates, {name: template.name});
      if (!serverTemplate) {
        await this.emailTemplateService.create({
          name: template.name,
          content: {
            html: template.content.Body,
            subject: template.content.Subject,
            text: template.content.Text,
          },
          createdOn: new Date(),
        } as EmailTemplateInterface);
      } else {
        await this.emailTemplateService.update({
          id: serverTemplate.id,
          name: serverTemplate.name,
          content: {
            html: template.content.Body,
            subject: template.content.Subject,
            text: template.content.Text,
          },
          createdOn: new Date(),
        } as EmailTemplateInterface);
      }
    });
  }

  async insertDefaultCategories(): Promise<void> {
    this.log.debug('defaultDataService -> seeding default categories');
    try {
      await this.onBoardingCategoryService.seedDefaultCategories();
    } catch (err) {
      this.log.error(`An error occurred while seeding default categories`, err);
    }
  }

  async insertDefaultUrls(): Promise<void> {
    this.log.debug('defaultDataService -> seeding default urls');
    try {
      await this.urlService.seedDefaultUrls();
    } catch (err) {
      this.log.error(`An error occurred while seeding default urls`, err);
    }
  }

  private async insertDefaultActivityTypes() {
    this.log.debug('defaultDataService -> seeding default statuses');
    try {
      await this.activeTypeService.seedDefaultData();
    } catch (err) {
      this.log.error(`An error occurred while seeding default categories`, err);
    }
  }

  private async insertDefaultPRRContents() {
    this.log.debug('defaultDataService -> seeding default statuses');
    /*try {
  await this.prrContentService.seedDefaultData();
} catch (err) {
  this.log.error(`An error occurred while seeding default categories`, err);
}*/
  }

  private async insertDefaultPRRLevels() {
    this.log.debug('defaultDataService -> seeding default statuses');
    try {
      await this.prrLevelService.seedDefaultData();
    } catch (err) {
      this.log.error(`An error occurred while seeding default categories`, err);
    }
  }

  private async insertDefaultPRRTriggers() {
    this.log.debug('defaultDataService -> seeding default statuses');
    try {
      await this.prrTriggerService.seedDefaultData();
    } catch (err) {
      this.log.error(`An error occurred while seeding default categories`, err);
    }
  }

  private async insertDefaultDeviceTypes() {
    this.log.debug('defaultDataService -> seeding default device types');
    try {
      await this.deviceTypeService.seedDefaultData();
    } catch (err) {
      this.log.error(`An error occurred while seeding default device types`, err);
    }
  }

  private async insertDefaultAccountTypes() {
    this.log.debug('defaultDataService -> seeding default Account Types');
    try {
      await this.accountTypeService.seedDefaultData();
    } catch (err) {
      this.log.error(`An error occurred while seeding default Account Types`, err);
    }
  }

  private async insertDefaultStatuses() {
    this.log.debug('defaultDataService -> seeding default statuses');
    try {
      await this.statusService.seedDefaultStatuses();
    } catch (err) {
      this.log.error(`An error occurred while seeding default statuses`, err);
    }
  }

  private async insertDefaultOnBoardingSteps() {
    this.log.debug('defaultDataService -> seeding default onBoarding steps');
    try {
      await this.onBoardingStepService.seedDefaultData();
    } catch (err) {
      this.log.error(`An error occurred while seeding default onBoarding steps`, err);
    }
  }

  private async insertDefaultHolidays() {
    this.log.debug('defaultDataService -> seeding default holidays');
    try {
      await this.calendarService.insertSeedData();
    } catch (err) {
      this.log.error(`An error occurred while seeding default holidays`, err);
    }
  }

  async insertDefaultRoles(): Promise<void> {
    this.log.debug('defaultDataService -> seeding default roles');
    try {
      await this.roleService.seedDefaultData();
    } catch (err) {
      this.log.error(`An error occurred while seeding default roles`, err);
    }
  }

  private async insertDefaultLicenses() {
    this.log.debug('defaultDataService -> seeding default license');
    try {
      await this.licenseService.seedDefaultData();
    } catch (err) {
      this.log.error(`An error occurred while seeding default license`, err);
    }
  }

  private async insertEmailEventTypes() {
    this.log.debug('defaultDataService -> seeding default Email Event Types');
    try {
      await this.emailEventTypeService.seedDefaultData();
    } catch (err) {
      this.log.error(`An error occurred while seeding default Email Event Types`, err);
    }
  }

  private async insertDefaultPRRActions() {
    this.log.debug('defaultDataService -> seeding default prr actions');
    try {
      await this.prrActionService.seedDefaultData();
    } catch (err) {
      this.log.error(`An error occurred while seeding default prr actions`, err);
    }
  }
}
