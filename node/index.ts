import { initializeAbTest, abTestStatus } from './abtest-manager';

export default {
  events: {
    onAppsLinked: async (ctx) => {
      console.log(`onAppsLinked body: ${ctx.body}`)
    }
  },
  routes: {
    initializeAbTest,
    abTestStatus
  }
}