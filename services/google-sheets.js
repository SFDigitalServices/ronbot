const {google} = require('googleapis');

const config = require('../config.js');

let auth, sheets
try {
  auth = new google.auth.GoogleAuth({
    keyFile: config.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  })
  sheets = google.sheets({ version: 'v4', auth })
} catch (error) {
  console.error('[google-sheets] unable to autenticate:', error.message)
}

async function getSheet (spreadsheetId, range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${range}'`
    })
    return response.data
  } catch (error) {
    console.error(
      '[google-sheets] unable to get sheet "%s" (range: "%s"):',
      spreadsheetId, range,
      error.message
    )
  }
}

module.exports = { getSheet }
