const config = require('../config.js');
const express = require('express');
const router = express.Router();
const axios = require('axios')
const airtable = require('../services/airtable');

router.get('/suite-results/:suiteResultId', (req, res) => {
  const suiteResultId = req.params.suiteResultId
  // get the suite tests (for proper ordering)
  axios.get('https://api.ghostinspector.com/v1/suites/60abebb3ef68371384feb6d2/tests/?apiKey=' + config.GHOST_INSPECTOR_API_KEY).then((suiteTestsResult) => {
    const suiteTests = suiteTestsResult.data.data
    const suiteTestsCount = suiteTests.length
    const results = { meta: {}, data: {} }
    const testList = { passing: {}, failing: {} }
    for(let i=0; i<suiteTestsCount; i++) {
      let suiteTest = suiteTests[i]
      // store the test info with id as key for quicker property appending later
      if(!suiteTest.importOnly) {
        results.data[suiteTest._id] = {
          "_id": suiteTest._id,
          "name": suiteTest.name
        }
        testList.passing[suiteTest._id] = {
          "_id": suiteTest._id,
          "name": suiteTest.name
        }
        testList.failing[suiteTest._id] = {
          "_id": suiteTest._id,
          "name": suiteTest.name
        }
      }
    }

    results.meta.suiteResultId = suiteResultId

    // there is a max limit of test results in a suite run of 50, figure out the offset to get all the test results
    const numCalls = Math.ceil(suiteTestsCount/50)
    let count = 50
    // let params = '&count=' + count + '&offset=' + offset
    // let giUrl = 'https://api.ghostinspector.com/v1/suite-results/' + suiteResultId + '/results?apiKey=' + config.GHOST_INSPECTOR_API_KEY + params
    let promises = []
    const suiteTestResults = []
    for(let i=0; i<numCalls; i++) {
      let params = '&count=' + count + '&offset=' + (count * i)
      let giUrl = 'https://api.ghostinspector.com/v1/suite-results/' + suiteResultId + '/results?apiKey=' + config.GHOST_INSPECTOR_API_KEY + params
      
      promises.push(
        axios.get(giUrl).then(response => {
          for(let j=0; j<response.data.data.length; j++) {
            suiteTestResults.push(response.data.data[j])
          }
        })
      )
    }

    Promise.all(promises).then(() => {
      for(let i=0; i<suiteTestResults.length; i++) {
        let suiteResult = suiteTestResults[i]
        let testId = suiteResult.test._id
        if(i==0) { // get some meta info
          results.meta.startUrl = suiteResult.startUrl
        }
        if(testId in results.data) {
          results.data[testId].passing = suiteResult.passing
          results.data[testId].screenshotCompareDifference = suiteResult.screenshotCompareDifference
          results.data[testId].screenshotComparePassing = suiteResult.screenshotComparePassing
          results.data[testId].screenshot = {
            original: suiteResult.screenshot.original,
            small: suiteResult.screenshot.small
          }
          results.data[testId].isMobile = suiteResult.viewportSize.width == 375

          // sort the passing/failing tests for navigation
          if(suiteResult.screenshotComparePassing == true) {
            delete testList.failing[testId]
          }
          
          // capture screenshot comparison
          if(suiteResult.screenshotComparePassing == false) {
            results.data[testId].screenshotCompare = {
              compareOriginal: suiteResult.screenshotCompare.compareOriginal,
              compareSmall: suiteResult.screenshotCompare.compareSmall
            }
            // and also sort
            delete testList.passing[testId]
          }
        }
      }

      console.log(testList)

      res.render('suite-results', {
        data: {
          suiteResultId: suiteResultId,
          testList: testList,
          results: results
        }
      })
    })
  })
})

module.exports = router;
