export const DefaultEvaluationResponse = (abTestBeginning: string, workspaceAName: string, workspaceBName: string): TestResult => ({
    ABTestBeginning: abTestBeginning,
    ConversionA: 0,
    ConversionALast24Hours: 0,
    ConversionB: 0,
    ConversionBLast24Hours: 0,
    ExpectedLossChoosingA: 0,
    ExpectedLossChoosingB: 0,
    KullbackLeibler: 0,
    ProbabilityAlternativeBeatMaster: 0,
    Winner: 'Not yet decided',
    WorkspaceA: workspaceAName,
    WorkspaceASessions: 0,
    WorkspaceASessionsLast24Hours: 0,
    WorkspaceB: workspaceBName,
    WorkspaceBSessions: 0,
    WorkspaceBSessionsLast24Hours: 0,
})

export const EvaluationResponse = (abTestBeginning: string, workspaceAData: WorkspaceCompleteData, workspaceBData: WorkspaceCompleteData, winner: string, lossA: number, lossB: number, probabilityOneBeatTwo: number, KullbackLeibler: number): TestResult => ({
    ABTestBeginning: abTestBeginning,
    ConversionA: workspaceAData.SinceBeginning.Conversion,
    ConversionALast24Hours: workspaceAData.Last24Hours.Conversion,
    ConversionB: workspaceBData.SinceBeginning.Conversion,
    ConversionBLast24Hours: workspaceBData.Last24Hours.Conversion,
    ExpectedLossChoosingA: lossA,
    ExpectedLossChoosingB: lossB,
    KullbackLeibler: (KullbackLeibler),
    ProbabilityAlternativeBeatMaster: probabilityOneBeatTwo,
    Winner: winner,
    WorkspaceA: workspaceAData.SinceBeginning.Workspace,
    WorkspaceASessions: workspaceAData.SinceBeginning.Sessions,
    WorkspaceASessionsLast24Hours: workspaceAData.Last24Hours.Sessions,
    WorkspaceB: workspaceBData.SinceBeginning.Workspace,
    WorkspaceBSessions: workspaceBData.SinceBeginning.Sessions,
    WorkspaceBSessionsLast24Hours: workspaceBData.Last24Hours.Sessions,
})