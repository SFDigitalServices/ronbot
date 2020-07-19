if(process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV !== 'production') require('dotenv').config();
module.exports = {
  PORT: process.env.PORT,
  SLACKBOT_TOKEN: process.env.SLACKBOT_TOKEN,
  CIRCLECI_API_TOKEN: process.env.CIRCLECI_API_TOKEN,
  GOOGLE_CONFIG: process.env.GOOGLE_CONFIG,
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  ACRONYMS_SHEET_ID: process.env.ACRONYMS_SHEET_ID,
  NOTETAKERS_SHEET_ID: process.env.NOTETAKERS_SHEET_ID
};
