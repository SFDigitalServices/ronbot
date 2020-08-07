const axios = require('axios');

const config = require('../config.js');
const SLACKBOT_TOKEN = config.SLACKBOT_TOKEN;

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Authorization': 'Bearer ' + SLACKBOT_TOKEN
};

const users = {list:[]};

const postRequest = async (url, postBody, success, error) => {
  try {
    let response = await axios.post(url, postBody, { headers });
    return response.data;
  } catch(e) {
    console.log(e);
  }
}

const getRequest = async (url) => {
  try {
    let response = await axios.get(url, { headers });
    return response.data;
  } catch(e) {
    console.log(e);
  }
}

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
  let response = await axios.post('https://slack.com/api/users.list', { token: SLACKBOT_TOKEN } , { headers });
  try {
    if(response.data.ok) {
      let memberList = response.data.members;
      for(let i=0; i<memberList.length; i++) {
        theUsers.list[memberList[i].id] = memberList[i];
      }
    }
  } catch(err) {
    console.log(err);
  }
}

const getUserInfo = async (userId) => {
  if(Object.keys(users.list).length == 0) await getUsers(users);
  try {
    return users.list[userId];
  } catch(err) {
    console.log(err);
  }
}

const getUserByName = async (username) => {
  if(Object.keys(users.list).length == 0) await getUsers(users);
  try {
    for(let key in users.list) {
      username = username.trim();
      let realNameNormalized = users.list[key].profile.real_name_normalized;
      let displayNameNormalized = users.list[key].profile.display_name_normalized;
      if(username === realNameNormalized || username === displayNameNormalized) {
        return users.list[key];
      }
    }
  } catch(e) {
    console.log(e);
    return false;
  }
}

if(Object.keys(users.list).length == 0) getUsers(users); // populate user list if empty

module.exports = {
  getRequest,
  postRequest,
  postMessage, 
  postMessageAdvanced,
  scheduleMessage, 
  deleteScheduledMessage,
  getUserByName,
  getUserInfo,
  getUsers: async () => { await getUsers(users) }
}