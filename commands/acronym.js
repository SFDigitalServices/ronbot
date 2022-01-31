const { ACRONYMS_SHEET } = require('../config')
const slackServices = require('../services/slack')
const googleSheets = require('../services/google-sheets')

let acronyms = { list: {} }

async function loadAcronyms (acronyms) {
  try {
    acronyms.list = {}
    const items = (
      await googleSheets.getSheet(ACRONYMS_SHEET.id, ACRONYMS_SHEET.range)
        .catch(error => ({ values: [] }))
    )?.values || []
    items.forEach((element, index) => {
      if (index > 0) {
        if (element.length === 2) {
          acronyms.list[element[0]] = element[1];
        }
      }
    })
    return items
  } catch (error) {
    console.error('[loadAcronyms] error:', error.message)
    return []
  }
};

async function refreshAcronyms () {
  const currentCount = Object.keys(acronyms.list).length;
  try {
    const items = await loadAcronyms(acronyms)
    const itemsLength = items.length - 1 // exclude header row
    const diff = currentCount > itemsLength
      ? currentCount - itemsLength
      : itemsLength - currentCount
    return {
      status: itemsLength > 0,
      diff
    }
  } catch (err) {
    console.log(err)
  }
}

function getAcronym (payload, acronym) {
  if (acronym) {
    const definition = acronyms.list[acronym]
    if (definition) {
      slackServices.postMessage(payload, `*${acronym}* is probably an acronym for _${definition}_`)
    } else {
      slackServices.postMessage(payload, "The acronym you requested (*" + acronym + "*) was not found.  Add it to the <https://docs.google.com/spreadsheets/d/13fcfWufGFEIVvca-1hP7mchVg9q6n7LOvdxYDBTdQiw|acronyms sheet> and then issue the `refresh acronyms` command")
    } 
  } else {
    slackServices.postMessage(payload, "`No acronym requested`")
  }
}

loadAcronyms(acronyms)

module.exports = { getAcronym, refreshAcronyms }
