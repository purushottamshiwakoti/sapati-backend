const { JWT } = require("google-auth-library");
const serviceAccount = require("./service-account.json");

const SCOPES = ["https://www.googleapis.com/auth/cloud-platform"];

const client = new JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: SCOPES,
});

async function getAccessToken() {
  try {
    const tokens = await client.authorize();
    console.log("Access Token:", tokens.access_token); // Debugging purpose
    return tokens.access_token;
  } catch (error) {
    console.error("Error obtaining access token:", error);
  }
}

module.exports = { getAccessToken };
