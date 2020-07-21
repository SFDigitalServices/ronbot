const config = require('../config.js');
const slackServices = require('../services/slack');
const googleSheets = require('../services/google-sheets');

let acronyms = {list: {}};

const loadAcronyms = async (acronyms) => {
  try {
    acronyms.list = {};
    let items = (await googleSheets.getSheet(config.ACRONYMS_SHEET.id, config.ACRONYMS_SHEET.range)).values;
    if(items.length > 0 ) {
      items.forEach((element, index) => {
        if(index > 0) {
          if(element.length == 2) {
            acronyms.list[element[0]] = element[1];
          }
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
    const itemsLength = items.length - 1; // exclude header row
    diff = currentCount > itemsLength ? currentCount - itemsLength : itemsLength - currentCount;
    return { status: itemsLength > 0, diff: diff };
  } catch(err) {
    console.log(err);
  }
}

const getAcronym = (payload, acronym) => {
  if(acronym) {
    let found = false;

    if(Object.keys(acronyms.list).length > 0) {
      let definition = acronyms.list[acronym]
      if(definition) {
        found = true;
        let text = '*' + acronym + '* is probably an acronym for _' + definition + '_';
        slackServices.postMessage(payload, text);
      }
    }
  
    if(!found) {
      let text = "The acronym you requested (*" + acronym + "*) was not found.  Add it here: https://docs.google.com/spreadsheets/d/13fcfWufGFEIVvca-1hP7mchVg9q6n7LOvdxYDBTdQiw";
      slackServices.postMessage(payload, text);
    } 
  } else {
    slackServices.postMessage(payload, "`No acronym requested`")
  }
};

loadAcronyms(acronyms);

module.exports = { getAcronym, refreshAcronyms }
