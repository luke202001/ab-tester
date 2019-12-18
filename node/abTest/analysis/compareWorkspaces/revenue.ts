import { DefaultEvaluationResponse, EvaluationResponseRevenue } from '../../../utils/evaluation-response'
import { CalculateUValue, CalculatePValue, CalculateEffectSize, PickWinner } from '../../../utils/mathTools/forMannWhitney/statistics'

export async function EvaluateRevenue(abTestBeginning: string, workspaceAData: WorkspaceCompleteData, workspaceBData: WorkspaceCompleteData): Promise<TestResult> {
    if (workspaceAData.SinceBeginning.Sessions === 0 || workspaceBData.SinceBeginning.Sessions === 0) {
        return DefaultEvaluationResponse(abTestBeginning, workspaceAData.SinceBeginning.Workspace, workspaceBData.SinceBeginning.Workspace)
    }
    const ordersHistoryA = workspaceAData.SinceBeginning.OrdersValueHistory
    const ordersHistoryB = workspaceBData.SinceBeginning.OrdersValueHistory

    const uValue = CalculateUValue([ordersHistoryA, ordersHistoryB])
    const pValue = CalculatePValue(uValue, ordersHistoryA.length, ordersHistoryB.length)
    const winner = PickWinner(pValue, workspaceAData.SinceBeginning.Workspace, workspaceBData.SinceBeginning.Workspace)
    const effectSizeA = CalculateEffectSize(uValue, ordersHistoryA.length, ordersHistoryB.length)
    const effectSizeB = 1 - effectSizeA
    const medianA = CalculateMedian(workspaceAData.SinceBeginning.OrdersValueHistory)
    const medianB = CalculateMedian(workspaceBData.SinceBeginning.OrdersValueHistory)
    return EvaluationResponseRevenue(abTestBeginning, workspaceAData, workspaceBData, winner, pValue, uValue, effectSizeA, effectSizeB, medianA, medianB)
}



function CalculateMedian(v: number[]): number {
    if (v.length === 0) {
        return 0
    }
    const sortedV = v.sort()
    const half = Math.floor(sortedV.length/2)
    if (sortedV.length % 2 === 1) {
        return sortedV[half]
    }
    return ((sortedV[half - 1] + sortedV[half]) / 2)
}