export default function validateAuthorizationToken(token) {
  return token.token == 'authorized';
}
