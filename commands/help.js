const slackServices = require('../services/slack');

const text = '' + 
    '`@ronbot [command]`\n' + 
    '>`sfgov-content-sandbox` sync options for sf.gov content sandbox on pantheon\n' +
    '>`what’s <acronym>` unfurls an acronym\n' + 
    '>`schedule <sheet_id|sheet_range>` schedules messages based on info in google sheet\n' +
    '>`refresh <acronyms>` refreshes a thing\n' +
    '>`quote` - be prepared to receive wisdom\n' + 
    '>`help` - this menu\n\n' + 
    '<https://docs.google.com/spreadsheets/d/13fcfWufGFEIVvca-1hP7mchVg9q6n7LOvdxYDBTdQiw|acronyms>\n' + 
    '<https://docs.google.com/spreadsheets/d/1InM7iZlUqNy3L_oiB6CfskISQAx1W24v05R0sLrfI1c|schedule messages example>\n';

const getHelp = (payload) => slackServices.postMessage(payload, text);

module.exports = { getHelp }
