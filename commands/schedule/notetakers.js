const config = require('../../config.js');
const slackServices = require('../../services/slack');
const scheduleService = require('../../services/schedule-service.js');
const fs = require('fs');
const path = require('path');

const appRoot = process.cwd();
const tmpDir = path.join(appRoot + '/tmp');

let scheduledNotetakerMessages = [];
let success = '[+]';
let fail = '[!]';

const scheduleNotetakers = async (payload) => {
  // scheduled messages will also contain messages that could not be scheduled
  scheduledNotetakerMessages = await scheduleService.scheduleItems(config.NOTETAKERS_SHEET.id, config.NOTETAKERS_SHEET.range);
  // dump out to file for why not
  if(!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }
  fs.writeFile(tmpDir + '/notetakers-' + config.NOTETAKERS_SHEET.id, JSON.stringify(scheduledNotetakerMessages), (err) => {});
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

const refreshNotetakers = async (payload) => {
  await scheduleService.deleteScheduledMessages(scheduledNotetakerMessages);
  scheduledNotetakerMessages = []; // wipe out all scheduled messages because old list contains failed
  scheduleNotetakers(payload);
}

module.exports = { 
  scheduleNotetakers, 
  refreshNotetakers 
}
