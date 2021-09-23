const axios = require('axios');

async function pollUrl(url, interval) {
  return new Promise(function(resolve, reject) {
    setTimeout(async function() {
      let response = await axios.get(url);
      try {
        resolve(response.data);
      } catch(err) {
        reject(err);
        console.log(err);
      }
    }, interval);
  })
}

module.exports = { pollUrl }
