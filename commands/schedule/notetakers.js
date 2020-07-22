const config = require('../../config.js');
const slackServices = require('../../services/slack');
const scheduleService = require('../../services/schedule-service.js');
const fs = require('fs');
const path = require('path');

const appRoot = process.cwd();
const tmpDir = path.join(appRoot + '/tmp');
const tmpFile = '/notetakers-' + config.NOTETAKERS_SHEET.id;

let scheduledNotetakerMessages = [];
let success = '[+]';
let fail = '[!]';

const scheduleNotetakers = async (payload) => {
  // scheduled messages will also contain messages that could not be scheduled
  scheduledNotetakerMessages = await scheduleService.scheduleItems(config.NOTETAKERS_SHEET.id, config.NOTETAKERS_SHEET.range);
  let scheduledMessagesString = JSON.stringify(scheduledNotetakerMessages);

  // dump out to file to keep record of scheduled messages that may need to be deleted later
  if(!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }
  fs.writeFile(tmpDir + tmpFile, scheduledMessagesString ? scheduledMessagesString : '[]', (err) => { 
    if(err) throw err;
    console.log('tmp file written: ' + tmpDir + '/' + tmpFile);
  });

  // also send ant a copy (to delete scheduled messages if app crashes)
  slackServices.getUserInfo(payload.event.user).then((response) => {
    slackServices.postMessageAdvanced({
      "channel": "U6RS0HESK",
      "user": "U6RS0HESK",
      "text": '`attempted notetaker scheduling by ' + response.real_name + ' (' + response.profile.display_name + ')`' + '\n' + '```' + scheduledMessagesString + '```'
    });
  })

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
