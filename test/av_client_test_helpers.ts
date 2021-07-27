// Make sjcl random number generator deterministic when running tests
export function deterministicRandomWords(nwords, _paranoia) {
  const lowestValidNumber = -2147483648;
  const highestValidNumber = 2147483647;

  let nextRandomInt = lowestValidNumber ;
  let output = []
  for (let i = 0; i < nwords; i++) {
    output.push(nextRandomInt++)
    if (nextRandomInt > highestValidNumber) {
      nextRandomInt = lowestValidNumber
    }
  }
  return output
}

// Make Math.random deterministic when running tests
export function deterministicMathRandom() {
  return 0.42
}
