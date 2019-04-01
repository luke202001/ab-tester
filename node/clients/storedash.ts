import axios from 'axios'
import { LoggerClient as Logger } from './logger'

const baseURL = 'http://api.vtex.com/api/storedash/'
const metricStoredashPath = '/metrics/storedash/navigationcube'

export async function getDataFromStoreDash(endPoint: string, ctx: ColossusContext): Promise<JSON[]> {
    return new Promise<JSON[]>((resolve, _reject) => {
        axios.get(endPoint,
            {
                headers: {
                    'Proxy-Authorization': ctx.vtex.authToken,
                    'VtexIdclientAutCookie': ctx.vtex.authToken
                }
            })
            .then(response => {
                resolve(response.data);
            })
            .catch(err => {
                const logger = new Logger(ctx, {})
                logger.sendLog(err, { status: ctx.status, message: err.message })
            })
    })
}

export async function GetWorkspacesData(endPoint: string, ctx: ColossusContext): Promise<WorkspaceData[]> {
    const metrics = await getDataFromStoreDash(endPoint, ctx)
    var workspacesData: WorkspaceData[] = []
    for (var metric of metrics) {
        workspacesData.push(WorkspaceData(metric["workspace"], metric["data.sessions"], metric["data.sessionsOrdered"]))
    }
    return workspacesData
}

export const WorkspaceData = (Workspace: string, TotalSessions: number, OrderSessions: number): WorkspaceData => ({
    Workspace: Workspace,
    Sessions: TotalSessions,
    OrderSessions: OrderSessions,
    NoOrderSessions: (TotalSessions - OrderSessions)
})

export const AggregationQuery = (from: string): string => (
    '?from=' + from + '&to=now&operation=sum&fields=data.sessions,data.sessionsOrdered&aggregateBy=workspace')

export const StoreDashRequestURL = (account: string, ABTestBeginning: string): string => (
    baseURL + account + metricStoredashPath + AggregationQuery(ABTestBeginning))