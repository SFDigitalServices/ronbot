const slack = require('../services/slack');

function confirmDialog(title, text) {
  return {
    "title": {
        "type": "plain_text",
        "text": title
    },
    "text": {
        "type": "mrkdwn",
        "text": text
    },
    "confirm": {
        "type": "plain_text",
        "text": "Yes"
    },
    "deny": {
        "type": "plain_text",
        "text": "No"
    }
  }
}

const sfgovContentSandbox = (payload, directMessageToBot) => {
  if(!directMessageToBot) { // not a direct message, respond in thread and direct message user
    slack.postMessage(payload, '<@' + payload.event.user + '>, let\'s chat.  I\'ll send you a direct message.');
  }
  slack.postMessageAdvanced({
    "channel": payload.event.user, // direct message user
    "user": payload.event.user,
    "as_user": true,
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Hello <@" + payload.event.user +">.  You wanted to do something with the <https://content-sfgov.pantheonsite.io|sf.gov content sandbox> on pantheon.  What would you like to do?"
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*Sync database and files*:  Overwrite the `content` sandbox with the content from `live`.  All changes in the `content` sandbox will be gone."
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Sync db and files from live",
            "emoji": true
          },
          confirm: confirmDialog('Sync database and files', 'Syncing database and files overwrite all changes in `content`.\n\nAre sure you sure you want to sync database and files from `live` down to `content`?'),
          "value": "sfgov_content_sync_db_files"
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*Sync code*:  Sync code from `live` to `content`.  Changes in `content` will be preserved and will have the code updates from `live`."
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Sync code from live",
            "emoji": true
          },
          "value": "sfgov_content_sync_code",
          confirm: confirmDialog('Sync code', 'Syncing code will update the codebase in `content` to the latest from `live`.  Changes will be prerserved.\n\nAre you sure you want to do this?')
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*Sync everything*:  Sync database, files, and code from `live` to `content`.  All changes in `content` will be gone."
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Sync everything from live",
            "emoji": true
          },
          "value": "sfgov_content_sync_everything",
          confirm: confirmDialog('Sync everything', 'Syncing everything will overwrite all changes in `content`.\n\nAre sure you sure you want to sync database, files, and code from `live` down to `content`?'),
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Never mind, do nothing",
              "emoji": true
            },
            "style": "danger",
            "value": "sfgov_content_cancel",

          }
        ]
      }
    ]
  });
}

module.exports = { sfgovContentSandbox }