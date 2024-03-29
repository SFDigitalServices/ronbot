const express = require('express');
const router = express.Router();
const axios = require('axios');
const slack = require('../services/slack');
const airtable = require('../services/airtable');
const accessibility = require('./webhooks/accessibility');
const config = require('../config');

const statusColors = {
  red: "#c13737",
  green: "#229922",
  yellow: "#ffc40d",
  blue: "#097ab6"
}

router.post('/accessibility', accessibility);

router.post('/ghost-inspector', (req, res, next) => {
  let payload = req.body;
  res.sendStatus(200);

  const resultId = payload.data._id;
  const suiteId = payload.data.suite._id;
  const suiteName = payload.data.suite.name;
  const testId = payload.data.test._id;
  const testName = payload.data.name;
  const url = payload.data.urls[payload.data.urls.length-1];
  const testResult = payload.data.passing;
  const environment = payload.data.startUrl;
  const suiteResult = payload.data.suiteResult; // this is an id
  const videoUrl = payload.data.video.url;
  const screenshotComparePassing = payload.data.screenshotComparePassing;
  const screenshotCompareDifference = payload.data.screenshotCompareDifference;
  const screenshot = payload.data.screenshot.original?.defaultUrl;
  const screenshotCompareBaselineResult = payload.data.screenshotCompareBaselineResult.screenshot ? payload.data.screenshotCompareBaselineResult.screenshot.original?.defaultUrl : null;
  const screenshotCompare = payload.data.screenshotCompare ? payload.data.screenshotCompare.compareOriginal?.defaultUrl : null;

  airtable.createRecords('ghost_inspector', [{
      fields: {
        "result_id": resultId,
        "suite_id": suiteId,
        "test_id": testId,
        "test_name": testName,
        "url": url,
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
  processStatusPage(payload, '#ops-general', ':pantheon2:');
});

router.post('/circleci-status', (req, res, next) => {
  let payload = req.body;
  res.sendStatus(200);
  processStatusPage(payload, '#ops-general', ':circleci:');
});

router.post('/github-status', (req, res, next) => {
  let payload = req.body;
  res.sendStatus(200);
  slack.postMessageAdvanced({
    channel: '#ant-test',
    text: 'github status change: \n' + '```' + JSON.stringify(payload) + '```'
  });
});

router.post('/sendgrid-status', (req, res, next) => {
  let payload = req.body;
  res.sendStatus(200);
  processStatusPage(payload, '#ops-general', ':sendgrid:');
});

router.post('/', (req, res, next) => {
  try {
    let payload = req.body;
    res.status(200).send('Webhook hit with payload:\n' + JSON.stringify(payload) + '\n');
    airtable.createRecords('webhooks', [{
        fields: {
          "payload": JSON.stringify(payload),
          "user_agent": req.headers['user-agent']
        }
      }
    ]);
  } catch(e) {
    res.status(500).send('Error');
  }
});

router.get('/', (req, res, next) => {
  res.send('webhooks.  hi.');
});

function processStatusPage(payload, channel, emoji) {
  let status_indicator = payload.page.status_indicator;
  let status_description = payload.page.status_description;
  let component = payload.component;
  let incident = payload.incident;
  let color = statusColors.green;
  let statusEmoji = '';
  let url = payload.meta.unsubscribe.substring(0, payload.meta.unsubscribe.indexOf('?'));

  switch(status_indicator) {
    case "maintenance":
      color = statusColors.blue;
      break;
    case "minor":
      color = statusColors.yellow;
      break;
    case "major":
      color = statusColors.red;
      statusEmoji = ':ahhhhhhhhh:';
      break;
    case "none":
      color = statusColors.green;
    default:
      break;
  }

  let message = emoji + ' ' + status_description + '\n';

  if(component) {
    message += '*component*: ' + component.name + '\n';
    message += '*status*: `' + component.status + '` ' + statusEmoji + '\n';
    message += '*description*: ' + component.description + '\n';
  }

  if(incident) {
    message += '*incident*: ' + incident.name + '\n';
    message += '*status*: `' + incident.status + '` ' + statusEmoji + '\n';
    message += '*description*: ' + incident.incident_updates[0].body + '\n';
  }

  message += url + '\n';

  if(process.env.NODE_ENV === 'production') {
    slack.postMessageAdvanced({
      channel: channel,
      attachments: [
        {
          fallback: emoji + ' status change \n' + status_indicator + '\n' + status_description,
          color: color,
          text: message
        }
      ]
    });
  }

  slack.postMessageAdvanced({
    channel: '#ant-test',
    attachments: [
      {
        fallback: emoji + ' status change \n' + status_indicator + '\n' + status_description,
        color: color,
        text: message + '```' + JSON.stringify(payload) + '```'
      }
    ]
  });
}

module.exports = router;
