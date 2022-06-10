const fs = require('fs')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const { GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_CONFIG } = process.env
if (GOOGLE_APPLICATION_CREDENTIALS && GOOGLE_CONFIG) {
  fs.writeFileSync(GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_CONFIG)
}
