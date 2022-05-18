import {
  ContestConfigMap,
  CastVoteRecord,
  ContestMap,
} from './types';

import { flattenOptions } from './flatten_options'

export function cvrToCodes(contestConfigs: ContestConfigMap, cvr: CastVoteRecord){
  const cvrCodes = {}
  Object.keys(cvr).forEach(contestId => {
    const flatOptions = flattenOptions(contestConfigs[contestId].options)
    const referenceToCode = Object.fromEntries(flatOptions.map(option => [option.reference, option.code]))
    const code = referenceToCode[cvr[contestId]]
    cvrCodes[contestId] = code
  })
  return cvrCodes
}

export function codesToCvr(contestConfigs: ContestConfigMap, cvrCodes: ContestMap<number>){
  const cvr = {}
  Object.keys(cvrCodes).forEach(contestId => {
    const flatOptions = flattenOptions(contestConfigs[contestId].options)
    const codeToReference = Object.fromEntries(flatOptions.map(option => [option.code, option.reference]))
    const reference = codeToReference[cvrCodes[contestId]]
    cvr[contestId] = reference
  })
  return cvr
}
