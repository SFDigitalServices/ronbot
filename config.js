if(process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV !== 'production') require('dotenv').config();
module.exports = {
  PORT: process.env.PORT,
  SLACKBOT_TOKEN: process.env.SLACKBOT_TOKEN,
  CIRCLECI_API_TOKEN: process.env.CIRCLECI_API_TOKEN,
  GOOGLE_CONFIG: process.env.GOOGLE_CONFIG,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  ACRONYMS_SHEET: JSON.parse(process.env.ACRONYMS_SHEET),
  NOTETAKERS_SHEET: JSON.parse(process.env.NOTETAKERS_SHEET),
  DATABASE_URL: process.env.DATABASE_URL ? process.env.DATABASE_URL : process.env.DATABASE_DEV_URL
};
