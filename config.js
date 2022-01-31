if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const {
  GOOGLE_CONFIG = '{}',
  ACRONYMS_SHEET = '{}',
  NOTETAKERS_SHEET = '{}',
  DATABASE_DEV_URL,
  DATABASE_URL = DATABASE_DEV_URL
} = process.env

module.exports = {
  ...process.env,
  GOOGLE_CONFIG: JSON.parse(GOOGLE_CONFIG),
  ACRONYMS_SHEET: JSON.parse(ACRONYMS_SHEET),
  NOTETAKERS_SHEET: JSON.parse(NOTETAKERS_SHEET),
  DATABASE_URL
}
