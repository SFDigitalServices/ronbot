const config = require('../config.js');
const axios = require('axios');

const headers = {
  "Content-Type": "application/json",
  "Circle-Token": config.CIRCLECI_API_TOKEN
}

/*
* triggers a new pipeline on circleci org
* @param projectSlug - the project slug format expected by circleci <project_type>/<org_name>/<repo_name>
* @param branch - the branch of the repo on which to trigger the pipeline
* @param parameters - parameters to pass to the pipeline (currently these are conditional parameters use to determine job execution)
*/ 
async function triggerPipeline(projectSlug, branch, parameters) {
  let response = await axios.post('https://circleci.com/api/v2/project/' + projectSlug + '/pipeline', {
    branch: branch,
    parameters
  }, { headers });
  try {
    return response;
  } catch(err) {
    console.log(error);
    return false;
  }
}

async function getPipelineById(pipelineId) {
  let response = await axios.get('https://circleci.com/api/v2/pipeline/' + pipelineId + '/workflow', { headers });
  try {
    return response;
  } catch(err) {
    console.log(err);
    return false;
  }
}

async function pollForPipelineStatus(pipelineId) {
  return new Promise(function(resolve, reject) {
    setTimeout(async function() {
      let response = await getPipelineById(pipelineId);
      try {
        resolve(response.data);
      } catch(err) {
        reject(err);
        console.log(err);
      }
    }, 45000);
  })
}

async function checkPipelineStatus(pipelineId) {
  let status = { done: false, status: null };
  while(true) {
    let result = await pollForPipelineStatus(pipelineId);
    if(result.items.length > 0) {
      if(result.items[0].status !== 'running') {
        status.done = true;
        status.status = result.items[0].status;
        return status;
      }
    }
  }
}

module.exports = {
  triggerPipeline,
  checkPipelineStatus,
  pollForPipelineStatus
}