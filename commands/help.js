const { ACRONYMS_SHEET } = require('../config')
const slackServices = require('../services/slack')

module.exports = {
  getHelp
}

function getHelp (payload) {
  return slackServices.postMessage(payload, dedent`
    \`@ronbot [command]\`
    > \`sfgov-content-sandbox\` sync options for sf.gov content sandbox on pantheon
    > \`what's <acronym>\` unfurls an acronym
    > \`schedule <sheet_id|sheet_range>\` schedules messages based on info in google sheet
    > \`refresh <acronyms>\` refreshes a thing
    > \`quote\` - be prepared to receive wisdom
    > \`help\` - this menu

    <https://docs.google.com/spreadsheets/d/${ACRONYMS_SHEET.id}|acronyms>
    <https://docs.google.com/spreadsheets/d/1InM7iZlUqNy3L_oiB6CfskISQAx1W24v05R0sLrfI1c/edit#gid=979594215|schedule messages example>
  `)
}

