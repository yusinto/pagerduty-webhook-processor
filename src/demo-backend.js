const util = require('util')
const express = require('express')
const LaunchDarkly = require('launchdarkly-node-server-sdk')
const Logger = require('./logger')

const PORT = 3000
const app = express()
const logger = new Logger('Backend')

const LD_SDK_KEY = 'sdk-fb40a655-6fa3-4c77-828d-e6ebef92e993'
const LOG_LEVEL_FLAG_KEY = 'backend-log-level'
const ldClient = LaunchDarkly.init(LD_SDK_KEY)
const asyncGetFlag = util.promisify(ldClient.variation)

const subscribeToChanges = () => {
  ldClient.on(`update:${LOG_LEVEL_FLAG_KEY}`, (_, newValue) => {
    const {
      fallthrough: { variation },
      variations,
    } = newValue
    const newLogLevel = variations[variation]
    console.log(`${LOG_LEVEL_FLAG_KEY} updated: ${newLogLevel}`)
    Logger.setLogLevel(newLogLevel)
  })
}

ldClient.once('ready', async () => {
  const user = { key: 'aa0ceb', anonymous: true }
  const initialLogLevel = await asyncGetFlag(LOG_LEVEL_FLAG_KEY, user, 'debug')
  Logger.setLogLevel(initialLogLevel)

  subscribeToChanges()

  app.get('/', (req, res) => {
    logger.debug('noisy debug message')
    logger.log('log message')
    logger.warn('Warning warning')
    logger.error('ERROR!')
    res.sendStatus(200)
  })

  app.listen(PORT, () => {
    logger.log(`Server listening on port ${PORT}`)
  })
})
