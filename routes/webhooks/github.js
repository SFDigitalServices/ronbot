const bodyParser = require('body-parser')
const Amplitude = require('@amplitude/node')
const { AMPLITUDE_API_KEY } = require('../../config')
const amp = AMPLITUDE_API_KEY
  ? Amplitude.init(AMPLITUDE_API_KEY)
  : null
 
module.exports = amp
  ? [bodyParser.json(), githubEventWebhook]
  : (req, res, next) => res.status(202).send('AMPLITUDE_API_KEY is not set')

const FILTER_EVENT_TYPES = [
  'pull_request',
  'release',
  'deployment_status'
]

/**
 * These functions
 */
const requestFilters = [
  // pre-payload filter: do we care about this event type?
  req => FILTER_EVENT_TYPES.includes(req.get('X-GitHub-Event'))
]

const eventFilters = [
  // only act on sfgov events for now
  payload => payload.repository?.name === 'sfgov'
]

function githubEventWebhook (req, res) {
  const payload = req.body
  console.log('[github] payload:', payload)

  if (!requestFilters.some(filter => filter(req))) {
    return res.status(201).send(`Request not processed: ${JSON.stringify(payload)}`)
  }

  let event, result
  if (!eventFilters.some(filter => filter(payload, req))) {
    return res.status(201).send(`Event not processed: ${JSON.stringify(payload)}`)
  }

  try {
    const {
      eventName = req.get('X-GitHub-Event'),
      action = payload.deployment_status?.state,
      sender,
      repository
    } = payload
    
    const eventType = [
      `github.${eventName}`,
      action
    ].filter(Boolean).join('.')
    
    const login = sender?.login || 'unknown'
    const userProperties = sender ? {
      user_id: `github:${login}`,
      github: {
        user: login,
        href: sender?.login ? `https://github.com/${login}` : null,
      }
    } : {}
    
    event = {
      event_type: eventType,
      ...userProperties,
      event_properties: {
          name: eventName,
        action,
        repo: repository?.full_name,
        ...payload
      }
    }

    result = amp.logEvent(event)
    amp.flush()

  } catch (error) {
    return res.status(501).send(`There was an error: ${error.toString()}`)
  }
  res.status(200).send(`Event sent: ${JSON.stringify(event)}\n\nresult: ${JSON.stringify(result)}`)
}