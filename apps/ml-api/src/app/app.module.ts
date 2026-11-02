import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {CacheModule} from '@nestjs/cache-manager';
import {SmsModule} from './sms/sms.module';
import {LoggingModule} from './logger/logging.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import * as path from 'path';
import {winstonOptions} from './config/winston';
import {LoggingService} from './logger/logging.service';
import {EmailModule} from './email/email.module';
import {PostmarkEmailService} from './email/postmark/postmark.email.service';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {DefaultDataModule} from './default-data/default-data.module';
import {PostmarkEmailTemplateService} from './email/postmark/postmark.email.template.service';
import {TwilioSmsService} from './sms/impl/twilio.sms.service';
import {RawBodyMiddleware} from './middlewares/raw.body.middleware';
import {JsonBodyMiddleware} from './middlewares/json.body.middleware';
import {DatabaseModule} from './core/database/database.module';
import {FilteredCategoryModule} from './filtered-category/filtered-category.module';
import {FilteredUrlModule} from './filtered-url/filtered-url.module';
import {ActivityModule} from './activity/activity.module';
import {SchoolClassModule} from './school-class/school-class.module';
import {EnrollmentModule} from './enrollment/enrollment.module';
import {OrgUnitModule} from './org-unit/org-unit.module';
import {UserModule} from './user/user.module';
import {AuthTokenModule} from './auth-token/auth-token.module';
import {AccountsModule} from './accounts/accounts.module';
import {StatusModule} from './status/status.module';
import {AccountTypeModule} from './account-type/account-type.module';
import {OnBoardingCategoryModule} from './category/on-boarding-category-module';
import {UrlModule} from './url/url.module';
import {InterceptionTimeModule} from './interception-time/interception-time.module';
import {CalendarModule} from './calendar/calendar.module';
import {ActivityTypeModule} from './activity-type/activity-type.module';
import {PrrTriggerModule} from './prr-trigger/prr-trigger.module';
import {PrrLevelModule} from './prr-level/prr-level.module';
import {DeviceTypeModule} from './device-type/device-type.module';
import {GoogleOauthModule} from './google-ouath/googleOauth.module';
import {DirectoryModule} from './directory-service/directory.module';
import {NonSchoolDaysConfigModule} from './non-school-days-config/non-school-days-config.module';
import {OnBoardingStepModule} from './onboarding-step/on-boarding-step.module';
import {UserDeviceLinkModule} from './user-device-link/user-device-link.module';
import {InsightModule} from './insight/insight.module';
import {ChromeModule} from './chrome/chrome.module';
import {RosterOrgModule} from './roster-org/roster-org.module';
import {FeedbackModule} from './feedback/feedback.module';
import {WebTimeModule} from './web-time/web-time.module';
import {OneRosterModule} from './roster/roster.module';
import {PrrNotificationModule} from './prr-notification/prr-notification.module';
import {RoleModule} from './role/role.module';
import {JobsModule} from './jobs/jobs.module';
import {LicenseModule} from './license/license.module';
import {AccountLicenseModule} from './account-license/account-license.module';
import {AuthModule} from './auth/auth.module';
import {NonSchoolDevicesConfigModule} from './non-school-devices-config/non-school-devices-config.module';
import {ConsumerAuthModule} from './consumer/auth/consumer-auth-module';
import {ConsumerUserModule} from './consumer/user/user.module';
import {UserCodeModule} from './consumer/user-code/user-code.module';
import {ParentConsentModule} from './consumer/parent-consent/parent-consent.module';
import {EmailFeedbackModule} from './email-feedback/email-feedback.module';
import {InternalApiKeyModule} from './internal-api-key/internal-api-key.module';
import {ApiKeyModule} from './api-key/api-key.module';
import {EmailEventModule} from './email-event/email-event.module';
import {UserOptInModule} from './user-opt-in/user-opt-in.module';
import {EmailEventTypeModule} from './email-event-type/email-event-type.module';
import {PrrActionModule} from './prr-action/prr-action.module';
import {DefaultDataService} from './default-data/default-data.service';
import {KidConfigModule} from './kid-config/kid-config.module';
import {ChromeConsumerModule} from './chrome-consumer/chrome.module';
import {KidRequestModule} from './kid-request/kid-request.module';
import {ParentEmailConfigModule} from './parent-email-config/parent-email-config.module';
import {EmailEventConfigModule} from './email-event-config/email-event-config.module';
import {InformPrrVisitsModule} from './inform-prr-visits/inform-prr-visits.module';
import {HealthModule} from './health/healthModule';
import {PlanModule} from './billing/plan/plan.module';
import {ActivityAiDataModule} from './activity-ai-data/activity-ai-data.module';
import {PrrManagerModule} from './prr-manager/prr-manager.module';
import {PaymentModule} from './billing/payment/payment.module';
import {SubscriptionModule} from './billing/subscription/subscription-module';
import {CustomerModule} from './billing/customer/customer-module';
import {FeatureModule} from './billing/feature/feature.module';
import {BillingWebhookModule} from './billing/billing-webhook/billing-webhook.module';
import {BillingModule} from './billing/billing-module';
import {PromoCodeModule} from './billing/promo-code/promo-code.module';
import {CouponModule} from './billing/coupon/coupon.module';
import {SubscriptionFeedbackModule} from './billing/subscription-feedback/subscription-feedback.module';
import {InvoiceModule} from './billing/invoice/invoice.module';
import throttleConfig from "./config/throttle";
import cacheConfig, {CacheConfig} from "./config/cache";
import modelConfig from "./config/model";
import queueConfig, {QueueConfig} from "./config/queue"
import redisConfig, {RedisConfig} from "./config/redis"
import categoryConfig from "./config/category"
import defaultCouponsConfig from "./config/default-coupons"
import defaultPlansConfig from "./config/default-plans"
import deviceProfileConfig from "./config/device-profile-config"
import aiConfig from "./config/ai-api"
import eventConfig from "./config/event"
import expressConfig from "./config/express"
import globalsConfig from "./config/globals"
import googleApisConfig from "./config/google.apis"
import jwtConfig from "./config/jwt"
import passwordRulesConfig from "./config/password.rules"
import passwordConfig from "./config/password"
import postmarkEmailConfig from "./config/postmark.email"
import rootUserConfig from "./config/root.user"
import sqlConfig from "./config/sql"
import twilioSmsConfig from "./config/twilio.sms"
import webappConfig from "./config/webapp"
import winstonConfig from "./config/winston"
import {MlModule} from "./ml/ml.module";
import {QueueModule} from "./queue/queue.module";
import {WebCategoryModule} from "./web-category/web-category.module";

const ENV = process.env.APP_ENV || 'development';

console.log('==========================================');
console.log('Reading the following environment:' + ENV);
console.log('==========================================');

@Module({
  imports: [
    // configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      cache: false,
      load: [
        redisConfig,
        cacheConfig,
        throttleConfig,
        modelConfig,
        queueConfig,
        categoryConfig,
        defaultCouponsConfig,
        defaultPlansConfig,
        deviceProfileConfig,
        eventConfig,
        expressConfig,
        globalsConfig,
        googleApisConfig,
        jwtConfig,
        passwordRulesConfig,
        passwordConfig,
        postmarkEmailConfig,
        rootUserConfig,
        sqlConfig,
        twilioSmsConfig,
        webappConfig,
        winstonConfig,
        aiConfig,
      ]
    }),

    //////////////////////////////////
    // throttle module
    //////////////////////////////////
    // ThrottlerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => config.get<ThrottlerModuleOptions>("throttleConfig"),
    // }),

    //////////////////////////////////
    // redis module
    //////////////////////////////////
    // CacheModule.registerAsync({
    //   isGlobal: true,
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //
    //   useFactory: async (configService: ConfigService) => {
    //     const redisConfig = configService.get<RedisConfig>("redisConfig");
    //     const cacheConfig = configService.get<CacheConfig>("cacheConfig");
    //
    //     return {
    //       store: redisStore,
    //       host: redisConfig.host,
    //       port: redisConfig.port,
    //       password: redisConfig.password,
    //       ttl: cacheConfig.ttl,
    //       max: cacheConfig.max
    //     }
    //   }
    // }),

    //////////////////////////////////
    // logging module
    //////////////////////////////////
    LoggingModule.forRootAsync({
      imports: [],
      useFactory: async (configService: ConfigService) => {
        return winstonOptions();
      },
      inject: [ConfigService],
    }),
    MlModule,
    // QueueModule,
    // EmailModule,
    // SmsModule,
    // EventEmitterModule.forRoot(),
    // DatabaseModule,
    // DefaultDataModule,
    // FilteredCategoryModule,
    // FilteredUrlModule,
    // ActivityModule,
    // SchoolClassModule,
    // EnrollmentModule,
    // OrgUnitModule,
    // AccountsModule,
    // UserModule,
    // AuthTokenModule,
    // StatusModule,
    // AccountTypeModule,
    // OnBoardingCategoryModule,
    // UrlModule,
    // InterceptionTimeModule,
    // ApiKeyModule,
    // CalendarModule,
    // InterceptionTimeModule,
    // ActivityTypeModule,
    // PrrTriggerModule,
    // PrrLevelModule,
    // UserDeviceLinkModule,
    // DeviceTypeModule,
    // GoogleOauthModule,
    // DirectoryModule,
    // NonSchoolDaysConfigModule,
    // NonSchoolDevicesConfigModule,
    // OnBoardingStepModule,
    // InsightModule,
    // ChromeModule,
    // ChromeConsumerModule,
    // RosterOrgModule,
    // FeedbackModule,
    // WebTimeModule,
    // OneRosterModule,
    // PrrNotificationModule,
    // RoleModule,
    // JobsModule,
    // LicenseModule,
    // AccountLicenseModule,
    // AuthModule,
    // ConsumerUserModule,
    // UserCodeModule,
    // ConsumerAuthModule,
    // ParentConsentModule,
    // EmailFeedbackModule,
    // InternalApiKeyModule,
    // EmailEventModule,
    // UserOptInModule,
    // EmailEventTypeModule,
    // KidConfigModule,
    // KidRequestModule,
    // ParentEmailConfigModule,
    // EmailEventConfigModule,
    // PrrActionModule,
    // InformPrrVisitsModule,
    // HealthModule,
    // PaymentModule,
    // PlanModule,
    // SubscriptionModule,
    // CustomerModule,
    // FeatureModule,
    // BillingWebhookModule,
    // BillingModule,
    // ActivityAiDataModule,
    // PrrManagerModule,
    // PromoCodeModule,
    // CouponModule,
    // SubscriptionFeedbackModule,
    // InvoiceModule,
    // WebCategoryModule
  ],
})
export class AppModule implements NestModule {
  // constructor(private defaultDataService: DefaultDataService) {
  // }

  // onModuleInit(): void {
  //   void this.defaultDataService.insertDefaultData();
  // }

  /**
   * get raw or json body for requests routes implementation.
   */
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({
        // Express 5 / path-to-regexp 8: wildcards must be named.
        path: '/payment/*splat/webhooks',
        method: RequestMethod.POST,
      })
      .apply(JsonBodyMiddleware)
      .forRoutes('{*splat}');
  }
}
