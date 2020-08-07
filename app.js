const config = require('./config.js');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const slack = require('./services/slack');

const port = config.PORT;

const slackEventsRouter = require('./routes/slack-events');
const slacKInteractiveRouter = require('./routes/slack-interactive');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', (req, res) => {
  res.send('hi');
});

app.get('/test', async (req, res) => {
  let channelList = (await slack.getRequest('https://slack.com/api/conversations.list')).channels;
  let generalChannelId = '';
  for(var i=0; i<channelList.length; i++) {
    if(channelList[i].name == 'general') {
      generalChannelId = channelList[i].id;
      break;
    }
  }
  let response = await slack.postRequest('https://slack.com/api/chat.scheduledMessages.list'); //, { channel: generalChannelId });
  
  const messages = response.scheduled_messages;
  console.log(messages);
  console.log(messages.length);

  // try {
  //   for(let i=0; i<messages.length; i++) {
  //     let message = messages[i];
  //     let deleteResponse = await slack.deleteScheduledMessage({
  //       scheduled_message_id: message.id,
  //       channel: message.channel_id
  //     });
  //     console.log(deleteResponse);
  //   }
  // } catch(e) {
  //   console.error(e);
  // }

  res.send('done');
})

app.use('/slack-events', slackEventsRouter);
app.use('/slack-interactive', slacKInteractiveRouter);

app.listen(port, () => console.log(`app listening on port ${port}!`));