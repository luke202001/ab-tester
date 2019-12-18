import Storedash from '../clients/storedash'
import TestingWorkspaces from '../typings/testingWorkspace'
import { DefaultEvaluationResponse } from '../utils/evaluation-response'
import { FilteredWorkspacesData } from '../utils/workspace'
import { EvaluateConversion } from './analysis/compareWorkspaces/conversion'
import { EvaluateRevenue } from './analysis/compareWorkspaces/revenue'
import { BuildCompleteData } from './data/buildData'
import { TestType } from '../clients/vbase';

const MasterWorkspaceName = 'master'

export async function TestWorkspaces(account: string, abTestBeginning: string, workspacesMetadata: ABTestWorkspacesMetadata, ctx: Context): Promise<TestResult[]> {
    const { clients: { abTestRouter, storedash, storage } } = ctx
    const testingWorkspaces = new TestingWorkspaces(workspacesMetadata)
    const Results: TestResult[] = []

    if (testingWorkspaces.Length() > 0) {
        const testType = await storage.getTestType(ctx)
        const workspacesData = await FilterWorkspacesData(abTestBeginning, testingWorkspaces.WorkspacesNames(), storedash, testType)

        if (!HasWorkspacesData(workspacesData)) {
            for (const workspaceName of testingWorkspaces.WorkspacesNames()) {
                if (workspaceName !== 'master') {
                    Results.push(DefaultEvaluationResponse(abTestBeginning, MasterWorkspaceName, workspaceName))
                }
            }
            return Results
        }
        const workspacesCompleteData = await BuildCompleteData(account, abTestBeginning, workspacesData, storedash, abTestRouter)
        const masterWorkspace = workspacesCompleteData.get(MasterWorkspaceName)

        for (const workspaceData of workspacesCompleteData) {
            if (workspaceData[0] !== MasterWorkspaceName) {
                if (testType === TestType.conversion) {
                    Results.push(await EvaluateConversion(abTestBeginning, masterWorkspace!, workspaceData[1]))
                }
                if (testType === TestType.revenue) {
                    Results.push(await EvaluateRevenue(abTestBeginning, masterWorkspace!, workspaceData[1]))
                }
            }
        }
    }
    return Results
}

async function FilterWorkspacesData(aBTestBeginning: string, testingWorkspaces: string[], storedash: Storedash, testType: TestType): Promise<WorkspaceData[]> {
    const workspacesData = (testType === TestType.revenue) ? (await storedash.getWorkspacesGranularData(aBTestBeginning)).data : await storedash.getWorkspacesData(aBTestBeginning)
    return FilteredWorkspacesData(workspacesData, testingWorkspaces)
}

const HasWorkspacesData = (workspacesData: WorkspaceData[]): boolean => {
    return (workspacesData.length > 0)
}