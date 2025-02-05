const axios = require("axios");

// Load environment variables
const {
  AUTH0_MGMT_CLIENT_ID,
  AUTH0_MGMT_CLIENT_SECRET,
  AUTH0_DOMAIN,
  AUTH0_APP_ID, // The Auth0 Application ID for your Next.js app
  VERCEL_URL, // The current deployment URL from Vercel
} = process.env;

// Auth0 API endpoint for updating application settings
const AUTH0_API_URL = `https://${AUTH0_DOMAIN}/api/v2/clients/${AUTH0_APP_ID}`;

// Function to get an Auth0 Management API access token
async function getAuth0Token() {
  try {
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: AUTH0_MGMT_CLIENT_ID,
      client_secret: AUTH0_MGMT_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      grant_type: "client_credentials",
    });
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Error fetching Auth0 Management API token:", error.response?.data || error);
    process.exit(1);
  }
}

// Function to update Auth0 Allowed URLs
async function updateAuth0Urls() {
  const token = await getAuth0Token();
  const newUrl = `https://${VERCEL_URL}`;

  try {
    // Fetch current application settings
    const { data } = await axios.get(AUTH0_API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Extract existing URLs
    const allowedLogoutUrls = data.allowed_logout_urls || [];
    const allowedCallbackUrls = data.callbacks || [];
    const allowedWebOrigins = data.web_origins || [];

    // Add new URL if not already included
    if (!allowedLogoutUrls.includes(newUrl)) allowedLogoutUrls.push(newUrl);
    if (!allowedCallbackUrls.includes(`${newUrl}/auth/callback`))
      allowedCallbackUrls.push(`${newUrl}/auth/callback`);
    if (!allowedWebOrigins.includes(newUrl)) allowedWebOrigins.push(newUrl);

    // Update the application settings in Auth0
    await axios.patch(
      AUTH0_API_URL,
      {
        allowed_logout_urls: allowedLogoutUrls,
        callbacks: allowedCallbackUrls,
        web_origins: allowedWebOrigins,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(`✅ Successfully added ${newUrl} to Auth0 allowed URLs.`);
  } catch (error) {
    console.error("❌ Error updating Auth0 URLs:", error.response?.data || error);
    process.exit(1);
  }
}

// Run the script
updateAuth0Urls();
