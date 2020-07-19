const axios = require('axios');

const config = require('../config.js');
const SLACKBOT_TOKEN = config.SLACKBOT_TOKEN;

const postMessage = function(postBody, successCallback, errorCallback) {
  postBody.token = SLACKBOT_TOKEN;
  axios.post('https://slack.com/api/chat.postMessage', postBody, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + SLACKBOT_TOKEN
    }
  }).then((response) => {
    if(successCallback) {
      successCallback(response);
    }
  }).catch((err) => {
    if(errorCallback) {
      errorCallback();
    }
  })
}

module.exports = {
  postMessage
}