if(process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV !== 'production') require('dotenv').config();
module.exports = {
  PORT: process.env.PORT,
  SLACKBOT_TOKEN: process.env.SLACKBOT_TOKEN,
  CIRCLECI_API_TOKEN: process.env.CIRCLECI_API_TOKEN,
};
