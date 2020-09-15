const express = require('express');
const router = express.Router();
const axios = require('axios');
const slack = require('../services/slack');
const airtable = require('../services/airtable');
const config = require('../config');

router.post('/ghost-inspector', (req, res, next) => {
  let payload = req.body;
  res.sendStatus(200);

  const resultId = payload.data._id;
  const suiteId = payload.data.suite._id;
  const suiteName = payload.data.suite.name;
  const testId = payload.data.test._id;
  const testName = payload.data.name;
  const testResult = payload.data.passing;
  const environment = payload.data.startUrl;
  const suiteResult = payload.data.suiteResult; // this is an id
  const videoUrl = payload.data.video.url;
  const screenshotComparePassing = payload.data.screenshotComparePassing;
  const screenshotCompareDifference = payload.data.screenshotCompareDifference;
  const screenshot = payload.data.screenshot.original.defaultUrl;
  const screenshotCompareBaselineResult = payload.data.screenshotCompareBaselineResult.screenshot ? payload.data.screenshotCompareBaselineResult.screenshot.original.defaultUrl : null;
  const screenshotCompare = payload.data.screenshotCompare ? payload.data.screenshotCompare.compareOriginal.defaultUrl : null;

  let text = ':ghost:' + "\n";
  text += '*suite*: ' + suiteName + "\n";
  text += '*test*: ' + testName + "\n";
  text += '*environment*:' + environment + "\n";
  text += '*video*: ' + videoUrl + "\n";
  text += '*passing*: `' + testResult + "`\n";
  text += '*screenshot passing*: `' + screenshotComparePassing + "`\n";
  text += '*screenshot diff*: ' + (screenshotCompareDifference*100) + "%\n";
  text += 'Screenshot comparison: <https://0f450d3d2a84.ngrok.io/ghost-inspector/test-results/' + resultId + '/>';

  airtable.createRecords('ghost_inspector', [{
      fields: {
        "result_id": resultId,
        "suite_id": suiteId,
        "test_id": testId,
        "test_name": testName,
        "suite_result": suiteResult,
        "environment": environment,
        "screenshot": screenshot,
        "screenshot_compare_baseline": screenshotCompareBaselineResult,
        "screenshot_compare": screenshotCompare,
        "test_result": testResult.toString(),
        "screenshot_result": screenshotComparePassing.toString(),
        "screenshot_diff": screenshotCompareDifference
      }
    }
  ]);
});

router.post('/pantheon-status', (req, res, next) => {
  let payload = req.body;
  res.sendStatus(200);
  slack.postMessageAdvanced({
    channel: '#ant-test',
    text: 'pantheon status change: ' + JSON.stringify(payload)
  });
});

router.get('/', (req, res, next) => {
  res.send('webhooks hi');
})

module.exports = router;