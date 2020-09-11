const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mergeImages = require('merge-images');
const { Canvas, Image, createCanvas, loadImage } = require('canvas');
const slack = require('../services/slack');
const airtable = require('../services/airtable');
const config = require('../config');

router.post('/webhook', (req, res, next) => {
  let payload = req.body;
  console.log(payload);
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
  
  slack.postMessageAdvanced({
    channel: 'ant-test',
    // blocks: blocksArray
    text: text,
    unfurl_links: true
  });

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

router.get('/suite-results/:suiteResultId', (req, res) => {
  const suiteResultId = req.params.suiteResultId;
  airtable.getRecords('ghost_inspector', {
    filterByFormula: '({suite_result}="' + suiteResultId + '")',
    sort: [{field: 'test_name', direction: 'asc'}]
  }).then((result) => {
    console.log(result);
    if(result && result.length > 0) {
      res.render('suite-results', { 
        data: {
          environment: result[0].fields.environment,
          records: result
        }
      });
    } else {
      res.send('no records');
    }
  }).catch((error) => {
    console.error(error);
    res.send(error);
  });
});

router.get('/test-results/:resultId', (req, res) => {
  const resultId = req.params.resultId;
  const url = 'https://api.ghostinspector.com/v1/results/' + resultId + '/?apiKey=' + config.GHOST_INSPECTOR_API_KEY;
  axios.get(url).then((result) => {
    const data = result.data.data;
    console.log(result.data);
    const screenshot = data.screenshot.original;
    const screenshotCompareBaselineResult = data.screenshotCompareBaselineResult.screenshot ? data.screenshotCompareBaselineResult.screenshot.original : null;
    const screenshotCompare = data.screenshotCompare ? data.screenshotCompare.compareOriginal : null;
  
    let screenshots = [
      screenshot
    ];

    if(screenshotCompareBaselineResult) {
      screenshots.push(screenshotCompareBaselineResult);
    }
  
    if(screenshotCompare) {
      screenshots.push(screenshotCompare);
    }
    console.log(screenshots);
    res.render('test-results', { screenshots: screenshots });
  });

});

module.exports = router;
