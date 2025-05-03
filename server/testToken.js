import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function testToken() {
    try {
        const res = await axios.post("https://cloud.uipath.com/identity_/connect/token",
            new URLSearchParams({
                grant_type: "client_credentials",
                client_id: process.env.UIPATH_CLIENT_ID,
                client_secret: process.env.UIPATH_CLIENT_SECRET,
                scope: "OR.Execution OR.Machines OR.Robots OR.Folders"
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        console.log("✅ Token primit:", res.data.access_token);
    } catch (err) {
        console.error("❌ Eroare autentificare:", err.response?.data || err.message);
    }
}

testToken();