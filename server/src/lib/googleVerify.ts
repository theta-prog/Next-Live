import { OAuth2Client } from 'google-auth-library';

const clientId = process.env.GOOGLE_CLIENT_ID;
let oauthClient: OAuth2Client | null = null;

if (clientId) {
  oauthClient = new OAuth2Client(clientId);
}

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  if (process.env.MOCK_GOOGLE === 'true') {
    return {
      sub: 'mock-google-sub',
      email: 'mock@example.com',
      name: 'Mock User'
    };
  }
  if (!oauthClient || !clientId) throw new Error('Google client not configured');
  const ticket = await oauthClient.verifyIdToken({ idToken, audience: clientId });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) throw new Error('Invalid Google token');
  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name || '',
    picture: payload.picture
  };
}
