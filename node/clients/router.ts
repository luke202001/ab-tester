import { InfraClient, InstanceOptions, IOContext } from '@vtex/api'
import { TSMap } from 'typescript-map'
import TestingWorkspaces from '../typings/testingWorkspace'

const routes = {
    Parameters: (account: string) => `/${account}/_abtest/parameters`,
    Workspaces: (account: string) => `/${account}/_abtest/workspaces`,
}

export default class Router extends InfraClient {
    constructor(ctx: IOContext, options?: InstanceOptions) {
        super('router', ctx, options, true)
    }

    public getWorkspaces = async (account: string): Promise<TestingWorkspaces> => {
        try {
            const workspaceMetadata = await this.http.get<ABTestWorkspacesMetadata>(routes.Workspaces(account), { metric: 'abtest-get' })
            return new TestingWorkspaces(workspaceMetadata)
        } catch (err) {
            throw err
        }
    }

    public setWorkspaces = (account: string, metadata: Partial<ABTestWorkspacesMetadata>) => {
        return this.http.put(routes.Workspaces(account), metadata, { metric: 'abtest-set-workspaces' })
    }
    public setParameters = (account: string, metadata: Partial<ABTestMetadata>) => {
        return this.http.put(routes.Parameters(account), metadata, { metric: 'abtest-set-parameters' })
    }

    public deleteWorkspaces = (account: string) => {
        return this.http.delete(routes.Workspaces(account), { metric: 'abtest-delete-workspaces' })
    }
    public deleteParameters = (account: string) => {
        return this.http.delete(routes.Parameters(account), { metric: 'abtest-delete-parameters' })
    }
}

interface ABTestMetadata {
    Id: string
    parameterPerWorkspace: TSMap<string, ABTestParameters>
}