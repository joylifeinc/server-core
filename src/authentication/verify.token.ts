import jwt from 'jsonwebtoken';

export interface TokenConfig {
  auth0: Record<string, {
    options: {
      audience: string;
      issuer: string
    },
    secret: {
      data: string;
      encoding: string;
    }
  }>
}


interface Auth0Token {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  azp: string;
}


export const decodeUnverifiedToken = (token: string): Auth0Token | null => {
  try {
    return jwt.decode(token, {
      complete: false, // payload only
    }) as Auth0Token;
  }
  catch (err) {
    return null; // seems to be what #decode does on its own
  }
}

/**
 * Iterates through all of the signatures in the config and returns a decoded token if possible or
 * the most applicable error (not "invalid signature")
 *
 * @param config
 * @param token a JWT token
 * @returns Auth0Token | Error
 */
export const verifyAll = (tokenConfig: TokenConfig, token: string): Auth0Token | Error => {
  return Object.keys(tokenConfig.auth0).map(key => {
    try {
      const secretObj = tokenConfig.auth0[key].secret;
      const buffer = Buffer.from(secretObj.data, secretObj.encoding as any);
      return jwt.verify(token, buffer, tokenConfig.auth0[key].options) as Auth0Token;
    } catch (err) {
      return err as Error;
    }
  }).reduce((acc, curr) => {
    if (curr instanceof Error) {
      if (acc instanceof Error && curr.message !== 'invalid signature') {
        return curr;
      } else {
        return acc;
      }
    } else {
      return curr;
    }
  }, new Error('no matching provider in tokenConfig'));
};
