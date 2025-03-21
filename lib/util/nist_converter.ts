import * as convert from 'xml-js'

import type { ContestMap } from '../av_client/types';
import type { CastVoteRecordReport, CVRContest, CVR, CVRSnapshot } from './nist_types';

type NistDocument = {
  CastVoteRecordReport: CastVoteRecordReport
}

function nistCvrToAvCvr(xml: string): ContestMap<string> {
  let castVoteRecordReport: CastVoteRecordReport;

  try {
    const content = xmlToJson(xml);
    castVoteRecordReport = (content as NistDocument).CastVoteRecordReport;
  } catch(_error) {
    throw new Error('Failure converting malformed NIST CVR');
  }

  if(castVoteRecordReport === undefined)
    throw new Error('Failure converting empty NIST CVR');

  const snapshot = getCurrentSnapshot(castVoteRecordReport.CVR);
  const contests = getContests(snapshot);

  const result = contests.reduce(combineSelectionsToMap, {});
  return result;
}

// Helpers
function xmlToJson(xml: string): unknown {
  const parseOptions = {
    compact: true,
    spaces: 4,
    textKey: 'text'
  };

  return JSON.parse(convert.xml2json(xml, parseOptions));
}

function getCurrentSnapshot(cvr: CVR): CVRSnapshot {
  if(Array.isArray(cvr.CVRSnapshot)) {
    const current = cvr.CVRSnapshot
      .find(s => s._attributes.ObjectId === cvr.CurrentSnapshotId.text);

    if(current === undefined)
      throw new Error('No CVRSnapshot found');

    return current;
  }

  return cvr.CVRSnapshot;
}

function getContests(snapshot: CVRSnapshot): CVRContest[] {
  if(Array.isArray(snapshot.CVRContest)) {
    return snapshot.CVRContest;
  }

  if(snapshot.CVRContest === undefined) {
    throw new Error('No CVRContest found');
  }

  return [snapshot.CVRContest];
}

function combineSelectionsToMap(acc: ContestMap<string>, current: CVRContest): ContestMap<string> {
  if(Array.isArray(current.CVRContestSelection)) {
    throw new Error('No support for multiple selections for a single contest (multiple or ranked)');
  }

  if(current.CVRContestSelection === undefined) {
    throw new Error('No CVRContestSelection found');
  }

  return {
    ...acc,
    [current.ContestId.text]: current.CVRContestSelection.ContestSelectionId.text
  };
}

export default {
  nistCvrToAvCvr
}
