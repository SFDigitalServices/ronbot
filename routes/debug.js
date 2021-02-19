const express = require('express');
const router = express.Router();
const slack = require('../services/slack');

router.get('/', (req, res) => {
  res.send('ok debug');
});

router.get('/scheduled-messages', async (req, res) => {
  let channelList = (await slack.getRequest('https://slack.com/api/conversations.list')).channels;
  let channels = {};
  for(var i=0; i<channelList.length; i++) {
    channels[channelList[i].id] = { name: channelList[i].name, scheduled_messages_count: 0, scheduled_messages: [] };
  }

  let response = await slack.postRequest('https://slack.com/api/chat.scheduledMessages.list'); //, { channel: generalChannelId });
  const messages = response.scheduled_messages;

  try {
    for(let i=0; i<messages.length; i++) {
      let message = messages[i];
      let userId = message.text.match(/\<@(\w+)\>/)[1];
      let username = (await slack.getUserInfo(userId)).name;
      message.recipient = { id: userId, name: username };
      if(channels[message.channel_id]) {
        channels[message.channel_id].scheduled_messages.push(message);
      }
    }
    for (const key in channels) {
      if (channels.hasOwnProperty(key)) {
        if(channels[key]) {
          channels[key].scheduled_messages_count = channels[key].scheduled_messages.length;
        }
      }
    }
    let debug = JSON.stringify(channels, null, 4);

    res.header("Content-Type",'application/json');
    res.send(debug);
  } catch(e) {
    res.send('broke');
    console.error(e);
  }
});

router.get('/scheduled-messages/delete/:channelId', async (req, res) => {
  const channelId = req.params.channelId ? req.params.channelId : null;
  let response = await slack.postRequest('https://slack.com/api/chat.scheduledMessages.list', { channel: channelId });
  const messages = response.scheduled_messages;
  let deleteCount = 0;
  let responseMessage = 'done\n';
  try {
    if(response.ok) {
      for(let i=0; i<messages.length; i++) {
        let message = messages[i];
        let deleteResponse = await slack.deleteScheduledMessage({
          scheduled_message_id: message.id,
          channel: message.channel_id
        });
        if(deleteResponse.ok) {
          deleteCount++;
          responseMessage = 'deleted: ' + deleteCount;
        }
      }
    } else {
      responseMessage = 'broke: ' + response.error;
    }
    res.header("Content-Type",'application/json');
    res.send(responseMessage);
  } catch(e) {
    res.send('broke: ' + e);
    console.error(e);
  }
});

module.exports = router;
