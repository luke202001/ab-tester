import { LoggerClient as Logger } from '../../clients/logger'
import { DefaultEvaluationResponse } from '../../utils/evaluation-response'
import { TestWorkspaces } from '../test-workspaces'

const bucket = 'ABTest'
const fileName = 'currentABTest.json'

export async function ABTestStatus(ctx: ColossusContext): Promise<TestResult[]> {
  const { vtex: { account }, resources: { vbase } } = ctx

  try {
    const data = await vbase.get(bucket, fileName)
    if (!data) {
      return [DefaultEvaluationResponse('Test not initialized', 'none', 'none')]
    }
    let beginning = data.dateOfBeginning
    let probability = data.probability
    if(beginning === undefined) {
      beginning = new Date()
      probability = 0.999
    }

    return await TestWorkspaces(account, beginning, probability, ctx) || []
  } catch (err) {
    const logger = new Logger(ctx, {})
    logger.sendLog(err, { status: ctx.status, message: err.message })
    throw new Error(err)
  }
}

export async function getWithRetriesHelper(retries: number, ctx: ColossusContext) {
  let error = null
  while (retries--) {
    try {
      return await ABTestStatus(ctx)
    } catch (err) {
      err.response ?
        console.error(`Error ${err.response.status} on getting A/B Test status, ${retries} retries left`) :
        console.error(`Error on getting A/B Test status, ${retries} retries left`)
      error = err
    }
  }
  throw error
}