const moment = require('moment-timezone');
const slackServices = require('./slack');
const googleSheets = require('./google-sheets');
const db = require('./db.js');

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
  let itemsJson = [];
  let scheduledMessages = [];
  let headerRow = [];

  // in the event that columns get shifted around
  for(let i=0; i<items.length; i++) {
    let message = {};
    if(i==0) {
      headerRow = items[i];
    } else {
      for(let j=0; j<headerRow.length; j++) {
        message[headerRow[j]] = items[i][j];
      }
      itemsJson.push(message);
    }
  }
  
  try {
    for(let i=0; i<itemsJson.length; i++) {
      let item = itemsJson[i];
      let date = item.Date;
      let time = item.Time;
      let slackHandle = item.Handle;
      let slackChannel = item.Channel;
      let message = item.Message;
      let momentTzDate = moment(new Date(date + ' ' + time).toISOString()).tz("America/Los_Angeles", true); // keep time, but set timezone
      let scheduledTime = momentTzDate.unix(); // slack wants a unix timestamp

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
            scheduleMessageResponse.datetime = date + ' ' + time;
            scheduledMessages.push(scheduleMessageResponse);
          } catch(err) {
            console.log(err);
          }
        } catch(e) {
          console.log(e);
        }
      }
    }
    // insert the scheduled messages list into the db, update if it already exists
    db.query("INSERT INTO scheduled_items (sheet_id, messages_json) VALUES ($1, $2)" + 
      "ON CONFLICT (sheet_id) DO UPDATE SET messages_json = $2", [sheetId, JSON.stringify(scheduledMessages)]);
    return scheduledMessages;
  } catch(e) {
    console.log('could not schedule items');
    console.log(e);
  }
};

const deleteScheduledMessages = async (sheetId) => {
  const result = await db.query("SELECT messages_json FROM scheduled_items WHERE sheet_id=$1", [sheetId]);
  try {
    const scheduledMessages = result.rows.length > 0 ? result.rows[0].messages_json : [];
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
    let promiseResult = await Promise.all(promises);
    try {
      return promiseResult;
    } catch(e) {
      console.log(e);
    }
  } catch(e) {
    console.log(e);
  }
}

module.exports = {
  scheduleItems,
  deleteScheduledMessages
};
