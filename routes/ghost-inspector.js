const express = require('express');
const router = express.Router();
const airtable = require('../services/airtable');

router.get('/suite-results/:suiteResultId', (req, res) => {
  const suiteResultId = req.params.suiteResultId;
  airtable.getRecords('ghost_inspector', {
    filterByFormula: '({suite_result}="' + suiteResultId + '")',
    sort: [{field: 'test_name', direction: 'asc'}]
  }).then((result) => {
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

module.exports = router;
