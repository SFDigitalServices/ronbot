const airtable = require('../../services/airtable');

module.exports = async (req, res, next) => {
  const payload = req.body;
  const suiteResultId = payload.result_id;
  const testId = payload.test_id;
  const url = payload.url;
  const scanResults = payload.scan_results;

  // get record with testId and suiteResultId first
  try {
    const recs = await airtable.getRecords('ghost_inspector', {
      filterByFormula: 'AND(({suite_result}="' + suiteResultId + '"),({test_id}="' + testId + '"))'
    });
    
    airtable.updateRecords('ghost_inspector', [{"id": recs[0].id, "fields": { "a11y_scan_result": JSON.stringify(scanResults) }}]);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};
