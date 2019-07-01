import { TSMap } from 'typescript-map'
import { LoggerClient as Logger } from '../../clients/logger'
import TestingParameters from '../../typings/testingParameters'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { firstOrDefault } from '../../utils/firstOrDefault'

export async function FinishAbTestForWorkspace(ctx: ColossusContext): Promise<void> {
  const { vtex: { account, route: { params: { finishingWorkspace } } }, resources: { router, vbase } } = ctx
  const workspaceName = firstOrDefault(finishingWorkspace)
  try {
    const workspaceMetadata = await router.getWorkspaces(account)
    const testingWorkspaces = new TestingWorkspaces(workspaceMetadata)
    testingWorkspaces.Remove(workspaceName)
    if (testingWorkspaces.Length() <= 1) {
      await router.deleteParameters(account)
      await router.deleteWorkspaces(account)
      await vbase.finishABtest(ctx.vtex)
      return
    }

    const testingParameters = new TestingParameters(testingWorkspaces.ToArray())
    await router.setWorkspaces(account, {
      Id: workspaceMetadata.Id,
      workspaces: testingWorkspaces.ToArray(),
    })
    const tsmap = new TSMap<string, Workspace>([...testingParameters.Get()])
    await router.setParameters(account, {
      Id: workspaceMetadata.Id,
      Workspaces: tsmap,
    })
  } catch (err) {
    if (err.status === 404) {
      err.message = 'Workspace not found'
    }
    const logger = new Logger(ctx.vtex, {})
    logger.sendLog(err, { status: ctx.status, message: err.message })
    throw new Error(err)
  }
}