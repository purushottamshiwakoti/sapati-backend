const { JWT } = require("google-auth-library");

const serviceAccount = require("./service-account.json");

const SCOPES = ["https://www.googleapis.com/auth/cloud-platform"];

const client = new JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: SCOPES,
});

async function getAccessToken() {
  const tokens = await client.authorize();
  console.log(tokens.access_token);
  return tokens.access_token;
}

module.exports = { getAccessToken };
