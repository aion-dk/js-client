import { extractContestSelections } from '../lib/util/nist_json_converter';
import * as fs from 'fs'
import { expect } from 'chai';

describe('Util#extractContestSelections', () => {
  const readFile = (fileName) => {
    return fs.readFileSync(require.resolve(fileName), 'utf8');
  }

  it('converts 1500-103 json to an array of contest selections', async () => {
    const jsonString = readFile('./cvrs/markit-cvr-writeins.json')
    const json = JSON.parse(jsonString)

    const result = extractContestSelections(json)

    expect(result).to.deep.equal([
      {
        "reference": "recIj8OmzqzzvnDbM",
        "optionSelections": [
          {
            "reference": "recqq21kO6HWgpJZV",
            "text": "a dfjyghjfshgksgh. z"
          }
        ]
      },
      {
        "reference": "recXNb4zPrvC1m6Fr",
        "optionSelections": [
          {
            "reference": "rec9Eev970VhohqKi",
            "text": "a dkfhg z"
          },
          {
            "reference": "recFiGYjGCIyk5LBe",
            "text": "a kdjfhglj dljfghlkjd flkhj l z"
          }
        ]
      },
      {
        "reference": "recqPa7AeyufIfd6k",
        "optionSelections": [
          {
            "reference": "recysACFx8cgwomBE"
          }
        ]
      }
    ])
  })
})
