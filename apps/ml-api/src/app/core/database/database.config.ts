import { IDatabaseConfig } from './dbConfig.interface';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true }); // dotenv 17+ logs on load unless quiet

export const databaseConfig: IDatabaseConfig = {
    development: {
        logQueryParameters: true,
        logging: true,
        pool: {
            max: 50,
            min: 0,
            acquire: 20000,
            idle: 10000,
        },
    },
    test: {
        logQueryParameters: true,
        logging: true,
        pool: {
            max: 20,
            min: 0,
            acquire: 20000,
            idle: 10000,
        },
    },
    production: {
        logQueryParameters: true,
        logging: false,
        pool: {
            max: 20,
            min: 0,
            acquire: 20000,
            idle: 10000,
        },
    },
};
