const axios = require('axios');

const config = require('../config.js');
const SLACKBOT_TOKEN = config.SLACKBOT_TOKEN;

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Authorization': 'Bearer ' + SLACKBOT_TOKEN
};

const users = {list:[]};

// this method is used when post body needs more granular details
// for example, when the channel isn't simply the payload channel or attachments need to be sent
// see /commands/sfgov-content-sandbox and /routes/slack-interactive.js for examples
const postMessageAdvanced = async(postBody, successCallback, errorCallback) => {
  postBody.token = SLACKBOT_TOKEN;
  let response = await axios.post('https://slack.com/api/chat.postMessage', postBody, {
    headers
  });
  try {
    if(successCallback) successCallback(response);
  } catch(e) {
    if(errorCallback) errorCallback(e);
  }
}

const postMessage = async (payload, text, successCallback, errorCallback) => {
  let thread_ts = payload.event.thread_ts ? payload.event.thread_ts : payload.event.ts;
  let response = await axios.post('https://slack.com/api/chat.postMessage', {
    token: SLACKBOT_TOKEN,
    channel: payload.event.channel,
    thread_ts: thread_ts,
    text: text
  }, {
    headers
  });
  try {
    if(successCallback) successCallback(response);
  } catch(e) {
    if(errorCallback) errorCallback(e);
  }
}

const scheduleMessage = async (postBody, successCallback, errorCallback) => {
  postBody.token = SLACKBOT_TOKEN;
  let response = await axios.post('https://slack.com/api/chat.scheduleMessage', postBody, { headers });
  try {
    if(successCallback) successCallback(response);
    return response.data;
  } catch(err) {
    console.log(err);
    if(errorCallback) errorCallback(err);
  }
}

const deleteScheduledMessage  = async (postBody, successCallback, errorCallback) => {
  postBody.token = SLACKBOT_TOKEN;
  let response = await axios.post('https://slack.com/api/chat.deleteScheduledMessage', postBody, { headers });
  try {
    if(successCallback) successCallback(response);
    return response.data;
  } catch(err) {
    console.log(err);
    if(errorCallback) errorCallback(err);
  }
}

const getUsers = async (theUsers) => {
  let response = await axios.post('https://slack.com/api/users.list', { token: SLACKBOT_TOKEN } ,{ headers });
  try {
    if(response.data.ok) {
      theUsers.list = response.data.members;
      console.log('got users');
    }
  } catch(err) {
    console.log(err);
  }
}

const getUserByName = async (username) => {
  if(Object.keys(users.list).length == 0) await getUsers(users);
  try {
    for(let i = 0; i < users.list.length; i++) {
      let item = users.list[i];
      if(item.profile.display_name === username) {
        return item;
      }
    }
  } catch(e) {
    console.log(e);
    return false;
  }
}

if(Object.keys(users.list).length == 0) getUsers(users); // populate user list if empty

module.exports = {
  postMessage, 
  postMessageAdvanced,
  scheduleMessage, 
  deleteScheduledMessage,
  getUserByName,
  getUsers: async () => { await getUsers(users) }
}