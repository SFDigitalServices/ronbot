const express = require('express');
const router = express.Router();
const axios = require('axios');
const yaml = require('js-yaml')
const fs = require('fs');

const slackServices = require('../services/slack');

// commands
const { getQuote } = require('../commands/quote');
const { getHelp } = require('../commands/help');
const { getAcronym } = require('../commands/acronym');
const { sfgovContentSandbox } = require('../commands/sfgov-content-sandbox');
const { schedule } = require('../commands/schedule');
const { refresh } = require('../commands/refresh');

router.post('/', (req, res, next) => {
  if(req.body.challenge) {
    res.send(req.body.challenge); // use this for verifying request url for slack event subscriptions
  } else {
    let payload = req.body;
    res.sendStatus(200);
    let directMessageToBot = (payload.event.type === 'message' && payload.event.channel_type === 'im' && !payload.event.bot_id) ? true : false;
    if(payload.event.type === 'app_mention' || directMessageToBot) {
      if(payload.event.text) {
        let userMessage = payload.event.text.trim().toLowerCase();
        let commandString = userMessage.trim().split(' ').filter(item => item.length > 0);
        let command = directMessageToBot ? commandString[0] : commandString[1];
        let args = directMessageToBot ? commandString.filter((item, index) => index > 0) : commandString.filter((item, index) => index > 1);
        switch(command) {
          case 'quote':
            getQuote(payload);
            break;
          case 'sfgov-content-sandbox':
            sfgovContentSandbox(payload, directMessageToBot);
            break;
          case 'acronym':
          case 'whatis':
          case "what’s":
            getAcronym(payload, args[0]);
            break;
          case 'schedule':
            schedule(payload, args[0]);
            break;
          case 'refresh':
            refresh(payload, args[0]);
            break;
          case 'help':
            getHelp(payload);
            break;
          default:
            slackServices.postMessage(payload, '`' + command + '` ? Try `@ronbot help`');
            break;
        }
      }
    }
  }
});

module.exports = router;
