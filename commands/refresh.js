const slackServices = require('../services/slack');
const {refreshAcronyms} = require('./acronym');

const refresh = (payload, source) => {
  switch(source) {
    case 'acronyms':
      slackServices.postMessage({
        channel: payload.event.channel,
        thread_ts: payload.event.ts,
        text: 'refreshing...'
      }, () => {
        refreshAcronyms().then((result) => {
          if(result) {
            if(result.status) {
              slackServices.postMessage({
                channel: payload.event.channel,
                thread_ts: payload.event.ts,
                text: 'refresh complete.  diff: ' + result.diff
              });
            }
          }
        }).catch((err) => {
          console.log(err);
        });
      });
      break;
    default:
      break;
  }
}

module.exports = { refresh };
