import { TestWorkspaces } from './node/abTest/evaluate'
import { FindWorkspace, TestingWorkspaces } from './node/workspace/list'
import { InitializeABTestMaster, InitializeABTestParams } from './node/workspace/modify'
import { firstOrDefault } from './node/utils/firstOrDefault'

const bucket = 'ABTest'
const fileName = 'currentABTest.json'

// TODO: `Id` should be determined in a general way based on account and workspaces
const testId = '0001'

export async function initializeABtest(ctx: ColossusContext): Promise<void> {
    const { resources: { vbase } } = ctx
    const beginning = new Date().toISOString().substr(0, 10)

    return vbase.save(bucket, fileName, {
        Id: testId,
        timeStart: beginning
    } as ABTestData)
}

export async function initializeAbTestForWorkspace(ctx: ColossusContext) {
    const { vtex: { account, route: { params: { workspace } } } } = ctx

    const testingWorkspaces = await TestingWorkspaces(account, ctx)
    if (!testingWorkspaces) {
        await InitializeABTestMaster(account, ctx)
    }

    const workspaceName = firstOrDefault(workspace)
    if (!FindWorkspace(account, workspaceName, ctx)) {
        ctx.body = `workspace "${workspace}" doesn't exists.`,
            ctx.status = 401
    }

    await InitializeABTestParams(account, workspaceName, ctx)

    await initializeABtest(ctx)
}

export async function ABTestStatus(ctx: ColossusContext): Promise<TestResult[]> {
    const { vtex: { account }, resources: { vbase } } = ctx

    const data = await vbase.get(bucket, fileName)
    if (!data) {
        return [{
            Winner: 'Test not initialized',
            ExpectedLossChoosingA: 0,
            ExpectedLossChoosingB: 0,
            KullbackLeibler: 0
        }]
    }
    const beginning = data.timeStart
    const tResult = await TestWorkspaces(account, beginning, ctx)
    return tResult

}