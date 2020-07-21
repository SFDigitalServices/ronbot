const axios = require('axios');

const slackServices = require('../services/slack');

const getQuote =  (payload) => {
  axios.get('http://ron-swanson-quotes.herokuapp.com/v2/quotes').then((response) => {
    let quote = response.data[0];
    let thread_ts = payload.event.thread_ts ? payload.event.thread_ts : payload.event.ts;
    slackServices.postMessageAdvanced({
      channel: payload.event.channel,
      thread_ts: thread_ts,
      reply_broadcast: true,
      text: '> ' + quote
    });
  });
}

module.exports = { getQuote }
