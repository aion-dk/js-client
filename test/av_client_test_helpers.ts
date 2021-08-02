export function deterministicRandomWords(nwords, _paranoia) {
  const lowestValidNumber = -2147483648;
  const highestValidNumber = 2147483647;

  if (typeof global.deterministicOffset == 'undefined') {
    resetDeterministicOffset();
  }

  let nextRandomInt = global.deterministicOffset;
  let output = []
  for (let i = 0; i < nwords; i++) {
    if (nextRandomInt > highestValidNumber) {
      nextRandomInt = lowestValidNumber
    }
    output.push(nextRandomInt++)
  }
  global.deterministicOffset++;

  return output
}

export function resetDeterministicOffset() {
  global.deterministicOffset = 0;
}

// Make Math.random deterministic when running tests
export function deterministicMathRandom() {
  return 0.42
}
