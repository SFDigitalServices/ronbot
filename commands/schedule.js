const slackServices = require('../services/slack');
const {scheduleMessages} = require('./schedule/messages');

const schedule = (payload, sheetInfo) => {
  let isValid = false;
  let sheetInfoObj = {};
  if(sheetInfo) {
    let sheetInfoArr = sheetInfo.split('|');
    if(sheetInfoArr.length < 2) {
      isValid = false;
    } else {
      isValid = true;
      sheetInfoObj.id = sheetInfoArr[0];
      sheetInfoObj.range = sheetInfoArr[1];
    }
  }
  
  if(isValid) {
    try {
      slackServices.postMessage(payload, 'One moment while I schedule your things.', (response) => {
        scheduleMessages(payload, sheetInfoObj);
      }, (err) => {
        slackServices.postMessage(payload, 'Something went wrong.  Info: ```' + err + '```');
      });  
    } catch(e) {
      console.error(e);
      slackServices.postMessage(payload, 'Something went wrong.  Info: ```' + e + '```');
    }
  } else {
    slackServices.postMessage(payload, 'Schedule...? Please provide a valid google sheet id and range in the form `sheet_id|range` (that\'s a pipe `|` between the sheet id and the range)');
  }
}

module.exports = { schedule }
