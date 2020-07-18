const config = require('../config.js');
const axios = require('axios');
const SLACKBOT_TOKEN = config.SLACKBOT_TOKEN;

const postMessage = function(url, postBody, successCallback, errorCallback) {
  postBody.token = SLACKBOT_TOKEN;
  axios.post(url, postBody, {
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
  postMessage: postMessage
}