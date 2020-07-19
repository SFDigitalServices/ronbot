const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config.js');
const slackServices = require('../services/slack');

const CIRCLECI_API_TOKEN = config.CIRCLECI_API_TOKEN;

router.post('/', (req, res) => {
  let payload = JSON.parse(req.body.payload);
  res.sendStatus(200);
  if(payload.actions[0].value === 'sfgov_content_sandbox_yes') {
    let userId = payload.user.id;
    let statusThreadTs = payload.message.ts;
    let statusChannel = payload.container.channel_id;
    // first check to see that the build is not running

    axios.post(payload.response_url, {
      replace_original: "true",
      parse: "none",
      text: 'SF.gov content sandbox building.\nThis will take a few minutes.  I\'ll let you know when the build is finished.'
    }).then((response) => {
      axios.post('https://circleci.com/api/v1.1/project/github/SFDigitalServices/ci-jobs/tree/sfgov?circle-token=' + CIRCLECI_API_TOKEN,
        {build_parameters: { CIRCLE_JOB: 'build_sfgov_content_multidev'} }, {
          headers: {
            'Content-Type': 'application/json',
          }
        }).then((response) => {
          let buildNum = response.data.build_num;
          let checkStatus = setInterval(() => {
            axios.get('https://circleci.com/api/v1.1/project/github/SFDigitalServices/ci-jobs/' + buildNum + '?circle-token=' + CIRCLECI_API_TOKEN)
              .then((response) => {
                let status = response.data.status;
                if(status === 'success' || status === 'fixed' || status === 'failed') {
                  let statusEmoji = status === 'failed' ? ':red_circle:' : ':white_check_mark:';
                  setTimeout(() => {
                    clearInterval(checkStatus);
                    slackServices.postMessage({
                      token: SLACKBOT_TOKEN,
                      channel: statusChannel,
                      text: '<@' + userId + '> <https://content-sfgov.pantheonsite.io|sf.gov content sandbox> build finished with status: ' + statusEmoji + ' `' + status + '`'
                    });
                  },500);
                }
              });
            }, 150000); // check every 2.5 minutes
      }).catch((err) => {
        slackServices.postMessage({
          channel: statusChannel,
          text: '<@' + userId + '> Something went wrong.  Tell someone about this:' + "\n" + '`' + err + '`' 
        })
      });
    });
  }
  if(payload.actions[0].value === 'sfgov_content_sandbox_no') {
    axios.post(payload.response_url, {
      replace_original: true,
      text: '...if given the choice between doing something and nothing, I\'d choose to do nothing.\nsf.gov content sandbox will not be built'
    });
  }
});

module.exports = router;