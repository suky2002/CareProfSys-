import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import os from "os";
import fs from "fs";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// ensure our temp folder exists
const UPLOAD_DIR = path.join(os.tmpdir(), "uipath-cvs");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

app.post("/trigger", async (req, res) => {
    try {
        // 1) pull the file from the multipart form
        const file = req.files?.cv;
        if (!file) return res.status(400).json({ success: false, error: "No file uploaded" });

        // 2) save it to a real folder on disk
        const tempPath = path.join(UPLOAD_DIR, file.name);
        await file.mv(tempPath);

        // 3) build our trigger URL with the real path
        const triggerUrl = `${process.env.UIPATH_TRIGGER_URL}?cvPath=${encodeURIComponent(tempPath)}`;

        // 4) fire the PAT‐based trigger
        const triggerRes = await axios.post(
            triggerUrl,
            {},
            {
                headers: {
                    Authorization: `Bearer ${process.env.UIPATH_PERSONAL_TOKEN}`,
                    "X-UIPATH-TenantName": process.env.UIPATH_TENANT_NAME,
                    "X-UIPATH-OrganizationUnitId": process.env.UIPATH_FOLDER_ID
                }
            }
        );

        res.json({ success: true, data: triggerRes.data });
    } catch (err) {
        console.error("Trigger error:", err.response?.data || err.message);
        res.status(500).json({ success: false, error: err.response?.data || err.message });
    }
});

app.listen(process.env.PORT, () =>
    console.log(`✅ Server running on http://localhost:${process.env.PORT}`)
);