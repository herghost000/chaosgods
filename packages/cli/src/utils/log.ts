import process from 'node:process'
import log from 'npmlog'

log.level = process.env.CLI_LOG_LEVEL ? process.env.CLI_LOG_LEVEL : 'info'

// log.heading = 'CHAOS'
// log.headingStyle = { fg: 'white', bg: 'blue', bold: true, underline: true }
log.addLevel('success', 2000, { fg: 'green', bold: true })

export default log
