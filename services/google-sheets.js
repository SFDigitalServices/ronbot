const {google} = require('googleapis');

const config = require('../config.js');

const auth = new google.auth.GoogleAuth({
  keyFile: config.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const getSheet = async (sheetId, range) => {
  const sheets = google.sheets({version: 'v4', auth});
  const request = {
    spreadsheetId: sheetId,
    range: '\'' + range + '\''
  };
  try {
    let response = (await sheets.spreadsheets.values.get(request)).data;
    return response;
  } catch(err) {
    console.log(err);
  }
}

module.exports = { getSheet }
