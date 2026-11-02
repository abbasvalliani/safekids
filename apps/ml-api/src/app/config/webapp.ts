import * as dotenv from 'dotenv';

dotenv.config({ quiet: true }); // dotenv 17+ logs on load unless quiet

export interface WebAppConfig {
  url: string,
  url_be: string,
}
export default () => ({
  webAppConfig : {
    url: process.env.WEB_APPLICATION_URL,
    url_be: process.env.BE_APPLICATION_URL,
  } as WebAppConfig
});
