const slackServices = require('../services/slack');

const text = '' + 
    '`@ronbot [command]`\n' + 
    '>`sfgov-content-sandbox` (re)create sf.gov content sandbox on pantheon based on production\n' +
    '>`what’s <acronym>` unfurls an acronym\n' + 
    '>`schedule notetakers` schedules reminders for notetakers\n' +
    '>`refresh <acronyms, notetakers>` refreshes a thing\n' +
    '>`quote` - be prepared to receive wisdom\n' + 
    '>`help` - this menu\n\n' + 
    '<https://docs.google.com/spreadsheets/d/13fcfWufGFEIVvca-1hP7mchVg9q6n7LOvdxYDBTdQiw|acronyms>\n' + 
    '<https://docs.google.com/spreadsheets/d/1InM7iZlUqNy3L_oiB6CfskISQAx1W24v05R0sLrfI1c|notetakers>\n';

const getHelp = (payload) => slackServices.postMessage(payload, text);

module.exports = { getHelp }
