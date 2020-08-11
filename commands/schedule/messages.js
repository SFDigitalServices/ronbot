const slackServices = require('../../services/slack');
const scheduleService = require('../../services/schedule-service.js');

const scheduleMessages = async (payload, sheetInfo) => {
  let scheduledMessages = [];
  let success = '[+]';
  let fail = '[!]';
  let successCount = 0;
  let failCount = 0;

  // delete previous scheduled messages to avoid duplicate messaging
  await scheduleService.deleteScheduledMessages(sheetInfo.id);

  // scheduled messages will also contain messages that could not be scheduled
  scheduledMessages = await scheduleService.scheduleItems(sheetInfo.id, sheetInfo.range);

  try {
    let outputMessage = '```';
    outputMessage += success + ' = success, ' + fail + ' = fail' + "\n";
    scheduledMessages.forEach(item => {
      if(item.ok) {
        successCount++;
        outputMessage += success;
      } else{
        failCount++;
        outputMessage += fail;
      }
      outputMessage += ' ' + item.recipient + ' for ' + item.datetime + "\n";
    });
    outputMessage += '```' + "\n";
    outputMessage += '```';
    outputMessage += 'success: ' + successCount + "\n";
    outputMessage += 'fail: ' + failCount;
    outputMessage += '```' + "\n";
    outputMessage += "Failures usually happen because the date and/or time is in the past or too far in the future.";

    slackServices.postMessage(payload, outputMessage);
  } catch(e) {
    console.log(e);
  }
};

module.exports = { 
  scheduleMessages 
}
