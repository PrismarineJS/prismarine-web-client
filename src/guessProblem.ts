export const guessProblem = (/** @type {string} */errorMessage) => {
  if (errorMessage.endsWith('Socket error: ECONNREFUSED')) {
    return 'Most probably the server is not running.'
  }
}
