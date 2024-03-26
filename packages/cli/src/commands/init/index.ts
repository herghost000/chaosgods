import process from 'node:process'
import log from '@/utils/log'

export default function init(projectName: string, options: any) {
  log.info('init command called', projectName, options, process.env.CLI_TARGETPATH)
}
