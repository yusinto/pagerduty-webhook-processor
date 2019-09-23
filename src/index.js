const express = require('express')
const fetch = require('node-fetch')

const PORT = 3000
const app = express()

const setDebugLogLevel = async () => {
  const projKey = 'pager-duty-summit'
  const flagKey = 'backend-log-level'
  const endpoint = `https://app.launchdarkly.com/api/v2/flags/${projKey}/${flagKey}`
  const apiKey = 'YOUR API KEY'

  console.log(`Set log level to debug at ${endpoint}`)

  try {
    await fetch(endpoint, {
      method: 'patch',
      body: JSON.stringify([
        {
          op: 'replace',
          path: '/environments/production/fallthrough/variation',
          value: 0,
        },
      ]),
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
    })
    return true
  } catch (error) {
    return false
  }
}
app.use(express.json())
app.post('/', async (req, res) => {
  // NOTE: There could be a delay when the webhook is triggered
  // and the message is sent and received by your server
  const success = await setDebugLogLevel()

  if (success) {
    res.sendStatus(200)
  } else {
    console.log('Cannot turn on logging')
    res.sendStatus(500)
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
