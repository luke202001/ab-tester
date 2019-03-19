import { initializeABtest as initialize, ABTestStatus } from '../../TestCase'

export const saveBeginningAbTest = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  await initialize(ctx).then(success => console.log(success))
    .catch(err => console.log(err))

  ctx.status = 200
  ctx.body = 'A/B Test beginning saved successfully'
}

export const abTestStatus = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  const ResultAB = await ABTestStatus(ctx)

  ctx.status = 200
  ctx.body = ResultAB
}