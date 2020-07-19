const axios = require('axios');

const slackServices = require('../services/slack');

const getQuote =  (payload) => {
  axios.get('http://ron-swanson-quotes.herokuapp.com/v2/quotes').then((response) => {
    let quote = response.data[0];
    slackServices.postMessage({
      channel: payload.event.channel,
      text: '> ' + quote
    });
  });
}

module.exports = { getQuote }
