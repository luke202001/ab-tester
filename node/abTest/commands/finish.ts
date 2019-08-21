import { TSMap } from 'typescript-map'
import TestingParameters from '../../typings/testingParameters'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { firstOrDefault } from '../../utils/firstOrDefault'

export async function FinishAbTestForWorkspace(ctx: ColossusContext): Promise<void> {
  const { vtex: { account, route: { params: { finishingWorkspace } } }, resources: { logger, router, vbase } } = ctx
  const workspaceName = firstOrDefault(finishingWorkspace)
  try {
    const workspaceMetadata = await router.getWorkspaces(account)
    const testingWorkspaces = new TestingWorkspaces(workspaceMetadata)
    testingWorkspaces.Remove(workspaceName)
    if (testingWorkspaces.Length() <= 1) {
      await router.deleteParameters(account)
      await router.deleteWorkspaces(account)
      await vbase.finishABtest(ctx.vtex)
      logger.info(`A/B Test finished in ${account} for workspace ${workspaceName}`, { account: `${account}`, workspace: `${workspaceName}`, method: 'TestFinished' })
      return
    }

    const testingParameters = new TestingParameters(testingWorkspaces.ToArray())
    await router.setWorkspaces(account, {
      id: workspaceMetadata.id,
      workspaces: testingWorkspaces.ToArray(),
    })
    
    let tsmap = new TSMap<string, ABTestParameters>()
    for (let entry of testingParameters.Get()) {
        tsmap.set(entry[0], entry[1].abTestParameters)
    }

    await router.setParameters(account, {
      Id: workspaceMetadata.id,
      parameterPerWorkspace: tsmap,
    })
    logger.info(`A/B Test finished in ${account} for workspace ${workspaceName}`, { account: `${account}`, workspace: `${workspaceName}`, method: 'TestFinished' })
  } catch (err) {
    if (err.status === 404) {
      err.message = 'Workspace not found'
    }
    logger.error({ status: ctx.status, message: err.message })
    throw new Error(err)
  }
}