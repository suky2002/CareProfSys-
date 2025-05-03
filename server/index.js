import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

app.post("/start-trigger", async (req, res) => {
    try {
        // 1. Obține token
        const tokenRes = await axios.post("https://cloud.uipath.com/identity_/connect/token",
            new URLSearchParams({
                grant_type: "client_credentials",
                client_id: process.env.UIPATH_CLIENT_ID,
                client_secret: process.env.UIPATH_CLIENT_SECRET,
                scope: process.env.UIPATH_SCOPE
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const token = tokenRes.data.access_token;

        // 2. Rulează trigger POST
        const response = await axios.post(process.env.UIPATH_TRIGGER_URL, {
            startInfo: {
                ReleaseKey: process.env.UIPATH_RELEASE_KEY,
                Strategy: "ModernJobsCount",
                JobsCount: 1,
                InputArguments: JSON.stringify({
                    cvPath: req.body.cvPath || "C:\\fakepath\\cv.docx"
                })
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-UIPATH-TenantName": process.env.UIPATH_TENANT_NAME,
                "X-UIPATH-OrganizationUnitId": process.env.UIPATH_FOLDER_ID,
                "Content-Type": "application/json"
            }
        });

        res.json({ success: true, result: response.data });
    } catch (err) {
        console.error("Trigger error:", err.response?.data || err.message);
        res.status(500).json({ success: false, error: err.response?.data || err.message });
    }
});

app.listen(process.env.PORT || 3001, () => {
    console.log(`Server started on http://localhost:${process.env.PORT}`);
});