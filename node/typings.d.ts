import { Context as KoaContext } from 'koa'
import { IOContext } from '@vtex/api'
import { Resources } from './resources/index'
declare global {
  type LogLevel = 'info' | 'error' | 'warning' | 'debug'
  export interface ColossusContext extends KoaContext {
    vtex: IOContext
    resources: Resources
  }

  export interface StoreDashResponse {
    workspace: string
    'data.sessions': number
    'data.sessionsOrdered': number
  }
  export interface ABTestData {
    Id: string
    dateOfBeginning: string
    probability: number
  }
  export interface WorkspaceData {
    Workspace: string
    Sessions: number
    OrderSessions: number
    NoOrderSessions: number
  }
  export interface TestResult {
    ABTestBeginning: string
    WorkspaceA: string
    WorkspaceB: string
    Winner: string
    ExpectedLossChoosingA: number
    ConversionA: number
    ExpectedLossChoosingB: number
    ConversionB: number
    ProbabilityAlternativeBeatMaster: number
    KullbackLeibler: number
  }
  export interface ABTestParameters {
    a: number
    b: number
  }
  export interface ABWorkspaceMetadata {
    name: string
    weight: number
    abTestParameters: ABTestParameters
    production: boolean
  }
}