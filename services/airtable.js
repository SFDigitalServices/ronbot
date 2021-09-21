const config = require('../config.js');
const Airtable = require('airtable');

const base = new Airtable({apiKey: config.AIRTABLE_TOKEN}).base(config.AIRTABLE_BASE);

const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + config.AIRTABLE_TOKEN
};

async function getRecords(sheet, params) {
  try {
    const records = await base(sheet).select(params).all();
    return records;
  } catch(err) {
    console.error(err);
    return;
  }
};

async function createRecords(sheet, records) {
  try {
    let response = await base(sheet).create(records);
    return response;
  } catch(err) {
    console.error(err);
    return;
  }
}

async function updateRecords(sheet, records) {
  try {
    let response = await base(sheet).update(records);
    return response;
  } catch(err) {
    console.error(err);
    return;
  }
}

async function upsert(sheet, params, fields) {
  try {
    params.maxRecords = 10;
    let upsertedRecords = [];
    let recordsToUpsert = [];
    let records = await getRecords(sheet, params);
    if(records.length > 0) { // records exist
      // get the id for the record
      for(let i=0; i<records.length; i++) {
        let record = records[i];
        recordsToUpsert.push({id: record.getId(), fields});
      }
      upsertedRecords = await updateRecords(sheet, recordsToUpsert);
    } else {
      let createdRecord = await createRecords(sheet, fields);
      upsertedRecords.push(createdRecord);
    }
    return upsertedRecords;
  } catch(err) {
    console.error(err);
    return;
  }
}

module.exports = {
  getRecords,
  createRecords,
  updateRecords,
  upsert
};
