const config = require('../config.js');
const slackServices = require('../services/slack');
const googleSheets = require('../services/google-sheets');


let acronyms = {list: {}};

const loadAcronyms = async (acronyms) => {
  try {
    acronyms.list = {};
    let items = (await googleSheets.getSheet(config.ACRONYMS_SHEET_ID, 'Sheet1')).values;
    if(items.length > 0 ) {
      items.forEach(element => {
        if(element.length == 2) {
          acronyms.list[element[0]] = element[1];
        }
      });
    }
    return items;
  } catch (err) {
    console.log(err);
  }
};

const refreshAcronyms = async () => {
  const currentCount = Object.keys(acronyms.list).length;
  try {
    const items = await loadAcronyms(acronyms);
    diff = currentCount > items.length ? currentCount - items.length : items.length - currentCount;
    return { status: items.length > 0, diff: diff };
  } catch(err) {
    console.log(err);
  }
}

const getAcronym = (payload, acronym) => {
  let found = false;
  let threadTs = payload.event.ts ? payload.event.ts : null;

  if(Object.keys(acronyms.list).length > 0) {
    let definition = acronyms.list[acronym]
    if(definition) {
      found = true;
      slackServices.postMessage({
        channel: payload.event.channel,
        thread_ts: threadTs,
        text: '*' + acronym + '* is probably an acronym for _' + definition + '_'
      });
    }
  }

  if(!found) {
    slackServices.postMessage({
      channel: payload.event.channel,
      thread_ts: threadTs,
      text: "The acronym you requested (_" + acronym + "_) was not found.  Add it here: https://docs.google.com/spreadsheets/d/13fcfWufGFEIVvca-1hP7mchVg9q6n7LOvdxYDBTdQiw"
    });
  }  
};

loadAcronyms(acronyms);

module.exports = { getAcronym, refreshAcronyms }
