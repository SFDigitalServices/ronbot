const slackServices = require('../services/slack');
const {refreshNotetakers} = require('./schedule/notetakers');

const scheduleableThings = ['notetakers'];
const schedule = (payload, what) => {
  if(what) {
    switch(what) {
      case 'notetakers':
        refreshNotetakers(payload); // because refresh deletes and schedules
        break;
      default:
        break;
    }
  } else {
    slackServices.postMessage(payload, 'Schedule what? Try `' + scheduleableThings.toString() + '`');
  }
}

module.exports = { schedule }
