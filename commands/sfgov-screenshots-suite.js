const config = require('../config.js');
const axios = require('axios');
const slackServices = require('../services/slack');
const { pollUrl } = require('../utils/utils');

async function suiteResult(resultId) {
  const suiteResultUrl = 'https://api.ghostinspector.com/v1/suite-results/' + resultId + '/?apiKey=' + config.GHOST_INSPECTOR_API_KEY + '&immediate=1';
  while(true) {
    let result = await pollUrl(suiteResultUrl, 30000);
    try {
      if(result.data.passing !== null) {
        return result.data.passing;
      }
    } catch(err) {
      console.log(err);
    }
  }
}

const sfgovScreenshotsSuite = (payload) => {
  slackServices.postMessage(payload, "<@" + payload.event.user + "> I'll run <https://app.ghostinspector.com/suites/" + config.GHOST_INSPECTOR_SCREENSHOTS_SUITE + "|the screenshots suite> and let you know when it's done")
  
  // execuite suite
  // https://api.ghostinspector.com/v1/suites/<suite-id>/execute/?apiKey=<api-key>
  axios.get('https://api.ghostinspector.com/v1/suites/' + config.GHOST_INSPECTOR_SCREENSHOTS_SUITE + '/execute/?apiKey=' + config.GHOST_INSPECTOR_API_KEY + '&immediate=1').then((executeData) => {
    const resultId = executeData.data.data._id;
    suiteResult(resultId).then((response) => {
      if(response === true) {
        slackServices.postMessage(payload, "<@" + payload.event.user + "> suite complete, <https://ronswanbot.herokuapp.com/ghost-inspector/suite-results/" + resultId + "|click this link for results>")
      }
    })
  })
}

module.exports = { sfgovScreenshotsSuite }