const config = require('../config.js');
const slackServices = require('./slack');
const googleSheets = require('./google-sheets');

const loadItems = async (sheetId, range) => {
  try {
    let items = (await googleSheets.getSheet(sheetId, range)).values;
    return items;
  } catch(err) {
    console.log(err);
  }
};

const scheduleItems = async (sheetId, range) => {

  let items = await loadItems(sheetId, range);
  let scheduledMessages = [];
  try {
    for(let i=0; i<items.length; i++) {
      let item = items[i];
      if(i > 0) { // assumes first row is header row
        // also assumes this structure for schedule sheet
        let date = item[0];
        let time = item[1];
        let slackHandle = item[4];
        let slackChannel = item[5];
        let message = item[6];
        let datetime = new Date(date + ' ' + time);
        let scheduledTime = (Math.round(datetime.getTime() / 1000));
        if(!isNaN(scheduledTime)) {
          let slackUser = await slackServices.getUserByName(slackHandle);
          try {
            let scheduleMessageResponse = await slackServices.scheduleMessage({
              channel: slackChannel,
              post_at: scheduledTime,
              text: '<@' + slackUser.id + '> ' + message
            });
            try {
              scheduleMessageResponse.recipient = slackHandle;
              scheduleMessageResponse.datetime = date + ' at ' + time;
              scheduledMessages.push(scheduleMessageResponse);
            } catch(err) {
              console.log(err);
            }
          } catch(e) {
            console.log(e);
          }
        }
      }
    }
    return scheduledMessages;
  } catch(e) {
    console.log('could not schedule items');
    console.log(e);
  }
};

const deleteScheduledMessages = async (scheduledMessages) => {
  let promises = [];
  for(let i=0; i<scheduledMessages.length; i++) {
    let message = scheduledMessages[i];
    if(message.ok) {
      promises.push(slackServices.deleteScheduledMessage({
        scheduled_message_id: message.scheduled_message_id,
        channel: message.channel
      }));
    }
  };
  let result = await Promise.all(promises);
  try {
    return result;
  } catch(e) {
    console.log(e);
  }
}

module.exports = {
  scheduleItems,
  deleteScheduledMessages
};
