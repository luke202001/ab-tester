import { ChooseWinner, LossFunctionChoosingVariantOne, ProbabilityOfOneBeatsTwo } from '../../../utils/mathTools/decisionRule/forBetaDistribution'
import { BoundError, pValue as pValueConversion} from '../../../utils/mathTools/statistics/samplesRestrictions'
import { WorkspaceToBetaDistribution } from '../../../utils/workspace'
import { DefaultEvaluationResponseRevenue, EvaluationResponseRevenue } from '../../../utils/evaluation-response'
import { CalculateUValue, CalculatePValue as PValueRevenue, CalculateEffectSize, PickWinner, CalculateMedian } from '../../../utils/mathTools/decisionRule/forMannWhitney'

export async function EvaluateRevenue(abTestBeginning: string, workspaceAData: WorkspaceCompleteData, workspaceBData: WorkspaceCompleteData): Promise<TestResult> {
    if (workspaceAData.SinceBeginning.Sessions === 0 || workspaceBData.SinceBeginning.Sessions === 0) {
        return DefaultEvaluationResponseRevenue(abTestBeginning, workspaceAData.SinceBeginning.Workspace, workspaceBData.SinceBeginning.Workspace)
    }

    const ordersHistoryA = workspaceAData.SinceBeginning.OrdersValueHistory
    const ordersHistoryB = workspaceBData.SinceBeginning.OrdersValueHistory

    if (ordersHistoryA.length <= 10 || ordersHistoryB.length <= 10) {
        throw new Error('Not enough data to perform accurate analysis')
    }

    // For conversion evaluation
    const betaDistributionA = WorkspaceToBetaDistribution(workspaceAData.SinceBeginning)
    const betaDistributionB = WorkspaceToBetaDistribution(workspaceBData.SinceBeginning)
    const lossA = LossFunctionChoosingVariantOne(betaDistributionA, betaDistributionB)
    const lossB = LossFunctionChoosingVariantOne(betaDistributionB, betaDistributionA)
    const probabilityTwoBeatsOne = ProbabilityOfOneBeatsTwo(betaDistributionB.a, betaDistributionB.b, betaDistributionA.a, betaDistributionA.b)
    const PValueConversion = pValueConversion(betaDistributionA, betaDistributionB)
    const winner = ChooseWinner(workspaceAData.SinceBeginning, workspaceBData.SinceBeginning, BoundError) || 'Not yet decided'

    // For revenue evaluation
    const uValue = CalculateUValue([ordersHistoryA, ordersHistoryB], 0)
    const pValueRevenue = PValueRevenue(uValue, ordersHistoryA.length, ordersHistoryB.length)
    const winnerRevenue = PickWinner(pValueRevenue, workspaceAData.SinceBeginning.Workspace, workspaceBData.SinceBeginning.Workspace)
    const effectSizeA = CalculateEffectSize(uValue, ordersHistoryA.length, ordersHistoryB.length)
    const effectSizeB = 1 - effectSizeA
    const medianA = CalculateMedian(workspaceAData.SinceBeginning.OrdersValueHistory)
    const medianB = CalculateMedian(workspaceBData.SinceBeginning.OrdersValueHistory)

    return EvaluationResponseRevenue(abTestBeginning, workspaceAData, workspaceBData, winner, lossA, lossB, probabilityTwoBeatsOne, PValueConversion, 
        winnerRevenue, pValueRevenue, effectSizeA, effectSizeB, medianA, medianB)
}