import validate, {
  RequiredEnvironment,
  RequiredEnvironmentTypes,
} from '@boxpositron/vre';

import { config } from 'dotenv';

config();

const runtimeEnvironment: RequiredEnvironment[] = [
  {
    name: 'PORT',
    type: RequiredEnvironmentTypes.Number,
  },
  {
    name: 'ALLOWED_DOMAINS',
    type: RequiredEnvironmentTypes.String,
  },
];

validate(runtimeEnvironment);

export const allowedDomains: string[] | undefined =
  process.env.ALLOWED_DOMAINS ? process.env.ALLOWED_DOMAINS.split(',') : undefined;
export const isProduction: boolean = process.env.NODE_ENV === 'production';
export const port: number = parseInt(process.env.PORT ?? '5000');

export const isProdEnvironment = process.env.ENVIRONMENT === 'production';

export const frontendDevOrigin = [/^http:\/\/localhost:\d+$/];

