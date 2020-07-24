const slackServices = require('../services/slack');
const {refreshAcronyms} = require('./acronym');
const {scheduleNotetakers} = require('./schedule/notetakers');
const slack = require('../services/slack');

const refreshableThings = ['acronyms', 'notetakers'];
const refresh = (payload, what) => {
  if(what) {
    switch(what) {
      case 'acronyms':
        refreshAcronyms().then((result) => {
          if(result) {
            if(result.status) {
              slackServices.postMessage(payload, '`refresh complete.  diff: ' + result.diff + '`');
            }
          }
        }).catch((err) => {
          console.log(err);
        });
        break;
      case 'notetakers':
        scheduleNotetakers(payload);
        break;
      default:
        break;
    }
  } else {
    slackServices.postMessage(payload, 'Refresh what? Try `' + refreshableThings.toString() + '`');
  }

}

module.exports = { refresh };
