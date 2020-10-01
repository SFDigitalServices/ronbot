const moment = require('moment-timezone');
const slackServices = require('./slack');
const googleSheets = require('./google-sheets');
const airtable = require('./airtable');
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
  let airtableSheetIdRange = sheetId + '|' + range;
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
          if(slackUser) {
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
          } else {
            scheduledMessages.push({
              ok: false,
              error: 'internal:could not find user', 
              recipient: slackHandle, 
              datetime: date + ' ' + time
            });
          }
        } catch(e) {
          scheduledMessages.push({
            ok: false,
            error: 'something',
            recipient: slackHandle,
            datetime: date + ' ' + time
          });
          console.error(e);
        }
      }
    }
    // insert the scheduled messages list into the db, update if it already exists
    // db.query("INSERT INTO scheduled_items (sheet_id, messages_json) VALUES ($1, $2)" + 
    //   "ON CONFLICT (sheet_id) DO UPDATE SET messages_json = $2", [sheetId, JSON.stringify(scheduledMessages)]);
    airtable.upsert('scheduled_items', {
      filterByFormula: 'AND(NOT({sheet_id} = ""), {sheet_id}="' + airtableSheetIdRange + '")',
      sort: [{field: 'date_modified', direction: 'desc'}]
    }, {sheet_id: airtableSheetIdRange, messages_json: JSON.stringify(scheduledMessages) });
    return scheduledMessages;
  } catch(e) {
    console.log('could not schedule items');
    console.log(e);
  }
};

const deleteScheduledMessages = async (sheetId, range) => {
  // const result = await db.query("SELECT messages_json FROM scheduled_items WHERE sheet_id=$1", [sheetId]);
  // const scheduledMessages = result.rows.length > 0 ? result.rows[0].messages_json : [];
  let airtableSheetIdRange = sheetId + '|' + range;
  try {
    const result = await airtable.getRecords('scheduled_items', {
      filterByFormula: 'AND(NOT({sheet_id} = ""), {sheet_id}="' + airtableSheetIdRange + '")',
      sort: [{field: 'date_modified', direction: 'desc'}]
    });
    const scheduledMessages = result.length > 0 ? JSON.parse(result[0].get('messages_json')) : [];
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
