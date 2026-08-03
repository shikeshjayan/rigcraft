import { OAuth2Client } from "google-auth-library";

let client = null;

export const getGoogleClient = () => {
  if (!client) {
    client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
  }
  return client;
};

export default getGoogleClient;
