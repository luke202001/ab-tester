import { LoggerClient as Logger } from '../../clients/logger'
import { HoursSince } from '../../utils/hoursSince'
import { TestingWorkspaces } from '../../workspace/list'
import { GetAndUpdateWorkspacesData } from '../../workspace/modify'

const bucket = 'ABTest'
const fileName = 'currentABTest.json'
const SECONDS_TO_MILISECONDS = 1000

export async function UpdateStatus(ctx: ColossusContext): Promise<void> {
  const { vtex: { account }, resources: { vbase } } = ctx

  try {
    const data = await vbase.get(bucket, fileName)
    let beginning = data.dateOfBeginning
    if (beginning === undefined) {
      beginning = new Date()
    }

    const testingWorkspaces = await TestingWorkspaces(account, ctx)
    const beginningQuery = HoursSince(beginning)
    await GetAndUpdateWorkspacesData(account, beginningQuery, testingWorkspaces, ctx)
  } catch (err) {
    const logger = new Logger(ctx, {})
    logger.sendLog(err, { status: ctx.status, message: err.message })
    throw new Error(err)
  }
}

export const keep = async (ctx: ColossusContext) => {
  for (let i = 0; i < 1000; i++) {
    await UpdateStatus(ctx)
    await delay(10 * SECONDS_TO_MILISECONDS)
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
