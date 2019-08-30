import { RandomBeta } from './betaSampling'

const runRound = (betaDistribuitions: ABTestParameters[]): number => {
    let idx = 0
    let maxi = RandomBeta(betaDistribuitions[0])
    for (var i = 1; i < betaDistribuitions.length; i++) {
        let curr = RandomBeta(betaDistribuitions[i])
        if (curr > maxi) {
            idx = i
            maxi = curr
        }
    }
    return idx
}

export const MonteCarloDistribuition = (betaDistribuitions: ABTestParameters[]): number[] => {
    let numRounds = 1000
    
    let wins = []
    for (var i = 0; i < betaDistribuitions.length; i++) {
        wins.push(0)
    }

    for (let i = 0; i < numRounds; i++) {
        wins[runRound(betaDistribuitions)]++
    }

    let ret = []
    for (const el of wins) {
        ret.push({a: el, b: 1})
    }
    return ret
}