const express = require('express');
const router = express.Router();
const axios = require('axios');
const circleci = require('../services/circleci');
const slack = require('../services/slack');

function pipeLineStatus(pipelineId, userId, statusChannel, message) {
  circleci.checkPipelineStatus(pipelineId).then((response) => {
    let statusEmoji = response.status === 'success' ? ':white_check_mark:' : ':red_circle:';
    if(response.done) {
      slack.postMessageAdvanced({
        channel: statusChannel,
        unfurl_links: false,
        text: '<@' + userId + '> ' + message + '.  Finished with status: ' + statusEmoji + ' `' + response.status + '`'
      });
    }
  }).catch((err) => {
    console.log(err);
  });
}

router.post('/', (req, res) => {
  let payload = JSON.parse(req.body.payload);
  res.sendStatus(200);
  let userId = payload.user.id;
  let statusChannel = payload.container.channel_id;
  let interactiveResponse = payload.actions[0].value;

  if(interactiveResponse.indexOf('sfgov_content_') >= 0) {
    switch (interactiveResponse) {
      case 'sfgov_content_sync_db_files':
        circleci.triggerSfgovDatabaseFiles().then((response) => {
          let pipelineId = response.data.id;
          if(response.status === 201) { // created
            axios.post(payload.response_url, {
              replace_original: true,
              text: 'Syncing database and files from live down to the content sandbox.  This will take a few minutes.  I\'ll let you know when this task is complete.'
            });
            pipeLineStatus(pipelineId, userId, statusChannel, 'database and file sync from live down to <https://content-sfgov.pantheonsite.io|sf.gov content sandbox> complete');
          }
        })
        break;
      case 'sfgov_content_sync_code':
        console.log('sync code');
        break;
      case 'sfgov_content_sync_everything':
        console.log('sync everything');
        break;
      case 'sfgov_content_cancel':
      default:
        axios.post(payload.response_url, {
          replace_original: true,
          text: '...if given the choice between doing something and nothing, I\'d choose to do nothing.\nNo actions taken on sf.gov content sandbox.'
        });
        break;
    }
  }
});

module.exports = router;