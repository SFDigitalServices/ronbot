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

async function triggerSfgovPipeline(parameters) {
  let response = await circleci.triggerPipeline('github/SFDigitalServices/ci-jobs', 'sfgov', parameters);
  try {
    return response;
  } catch(err) {
    console.log(error);
    return false;
  }
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
        triggerSfgovPipeline({ 'content_sandbox_db_files_update': true }).then((response) => {
          if(response.status === 201) { // created
            axios.post(payload.response_url, {
              replace_original: true,
              text: '*Syncing database and files* from `live` down to the `content` sandbox.  This will take a few minutes.  I\'ll let you know when this task is complete.'
            });
            pipeLineStatus(response.data.id, userId, statusChannel, '*database and file sync* from `live` down to <https://content-sfgov.pantheonsite.io|sf.gov content sandbox> complete');
          }
        }).catch((err) => {
          console.log(err);
        });
        break;
      case 'sfgov_content_sync_code':
        triggerSfgovPipeline({ 'content_sandbox_code_update': true }).then((response) => {
          if(response.status === 201) { // created
            axios.post(payload.response_url, {
              replace_original: true,
              text: '*Syncing code* from `live` down to the `content` sandbox.  This will take a few minutes.  I\'ll let you know when this task is complete.'
            });
            pipeLineStatus(response.data.id, userId, statusChannel, '*code sync* from `live` down to <https://content-sfgov.pantheonsite.io|sf.gov content sandbox> complete');
          }
        }).catch((err) => {
          console.log(err);
        });
        break;
      case 'sfgov_content_sync_everything':
        triggerSfgovPipeline({ 'content_sandbox_db_files_code_update': true }).then((response) => {
          if(response.status === 201) { // created
            axios.post(payload.response_url, {
              replace_original: true,
              text: '*Syncing database, files, and code* from `live` down to the `content` sandbox.  This will take a few minutes.  I\'ll let you know when this task is complete.'
            });
            pipeLineStatus(response.data.id, userId, statusChannel, '*database, files, and code sync* from `live` down to <https://content-sfgov.pantheonsite.io|sf.gov content sandbox> complete');
          }
        }).catch((err) => {
          console.log(err);
        });
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