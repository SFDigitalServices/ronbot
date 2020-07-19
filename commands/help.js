const slackServices = require('../services/slack');

const getHelp = (payload) => slackServices.postMessage({
  channel: payload.event.channel,
  thread_ts: payload.event.ts,
  text: 'Help has arrived.\n' +
    '>>>' + 
    '`@ronbot sfgov-content-sandbox` - (re)create sf.gov content sandbox on pantheon based on production\n' +
    '`@ronbot what’s abc` - if found, unfurls the acronym abc\n' + 
    '`@ronbot quote` - be prepared to receive wisdom\n' + 
    '`@ronbot help` - this menu\n'
});

module.exports = { getHelp }
