const slackServices = require('../../services/slack');
const scheduleService = require('../../services/schedule-service.js');

const scheduleMessages = async (payload, sheetInfo) => {
  let scheduledMessages = [];
  let success = '[+]';
  let fail = '[!]';
  // delete previous scheduled messages to avoid duplicate messaging
  await scheduleService.deleteScheduledMessages(sheetInfo.id);
  // scheduled messages will also contain messages that could not be scheduled
  scheduledMessages = await scheduleService.scheduleItems(sheetInfo.id, sheetInfo.range);

  try {
    let outputMessage = '```';
    outputMessage += success + ' = success, ' + fail + ' = fail' + "\n";
    scheduledMessages.forEach(item => {
      if(item.ok) {
        outputMessage += success;
      } else{
        outputMessage += fail;
      }
      outputMessage += ' ' + item.recipient + ' for ' + item.datetime + "\n";
    });
    outputMessage += '```';
    slackServices.postMessage(payload, outputMessage);
  } catch(e) {
    console.log(e);
  }
};

module.exports = { 
  scheduleMessages 
}
