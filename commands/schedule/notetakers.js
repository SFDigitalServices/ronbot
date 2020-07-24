const path = require('path');
const config = require('../../config.js');
const slackServices = require('../../services/slack');
const scheduleService = require('../../services/schedule-service.js');

let scheduledNotetakerMessages = [];
let success = '[+]';
let fail = '[!]';

const scheduleNotetakers = async (payload) => {
  // delete previous scheduled messages to avoid duplicate messaging
  await scheduleService.deleteScheduledMessages(config.NOTETAKERS_SHEET.id);
  // scheduled messages will also contain messages that could not be scheduled
  scheduledNotetakerMessages = await scheduleService.scheduleItems(config.NOTETAKERS_SHEET.id, config.NOTETAKERS_SHEET.range);

  try {
    let outputMessage = '```';
    outputMessage += success + ' = success, ' + fail + ' = fail' + "\n";
    scheduledNotetakerMessages.forEach(item => {
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
  scheduleNotetakers 
}
