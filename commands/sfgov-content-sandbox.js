const slackServices = require('../services/slack');

const sfgovContentSandbox = (payload, directMessageToBot) => {
  if(!directMessageToBot) { // not a direct message, respond in thread and direct message user
    slackServices.postMessage({
      channel: payload.event.channel,
      thread_ts: payload.event.event_ts,
      text: 'Let\'s chat.  I\'ll send you a direct message.'
    })
  }
  slackServices.postMessage({
    "channel": payload.event.user, // direct message user
    "user": payload.event.user,
    "as_user": true,
    "attachments": [
      {
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Hello <@" + payload.event.user +">.  You asked me to manually (re)create the <https://content-sfgov.pantheonsite.io|sf.gov content sandbox> on pantheon.  This will wipe out the existing sandbox and create a new one by cloning everything in the current production environment.\n\nAre you sure you want to do this?"
            }
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "emoji": true,
                  "text": "Yes"
                },
                "style": "primary",
                "value": "sfgov_content_sandbox_yes"
              },
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "emoji": true,
                  "text": "No"
                },
                "style": "danger",
                "value": "sfgov_content_sandbox_no"
              }
            ]
          }
        ]
      }
    ]
  });
}

module.exports = { sfgovContentSandbox }