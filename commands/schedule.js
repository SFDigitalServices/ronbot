const slackServices = require('../services/slack');
const {scheduleNotetakers} = require('./schedule/notetakers');

const scheduleableThings = ['notetakers'];
const schedule = (payload, what) => {
  if(what) {
    switch(what) {
      case 'notetakers':
        scheduleNotetakers(payload);
        break;
      default:
        break;
    }
  } else {
    slackServices.postMessage(payload, 'Schedule what? Try `' + scheduleableThings.toString() + '`');
  }
}

module.exports = { schedule }
