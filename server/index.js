import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import fs from "fs";
import os from "os";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const UPLOAD_DIR = path.resolve('./uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Directorul unde robotul UiPath va scrie fișierul de rezultate
const RESULTS_DIR = path.resolve('./robot_results'); // Un nou director pentru rezultate
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR);

// Variabilă globală pentru ultimul rezultat 
let lastResultJson = {
    skills: [],
    score: 0,
    out_FinalJson: "" // Adaugat pentru a stoca tot raportul
};

// TRIGGER API
app.post("/trigger", async (req, res) => {
    try {
        const file = req.files?.cv;
        if (!file) return res.status(400).json({ success: false, error: "No file uploaded" });

        const savedPath = path.join(UPLOAD_DIR, file.name);
        await file.mv(savedPath);

        const fullPath = path.resolve(UPLOAD_DIR, file.name);

        const resultFileName = `results_${Date.now()}.json`;
        const resultFilePathForRobot = path.join(RESULTS_DIR, resultFileName);

        const triggerUrl = `${process.env.UIPATH_TRIGGER_URL}?cvPath=${encodeURIComponent(fullPath)}&outputPath=${encodeURIComponent(resultFilePathForRobot)}`;

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


        res.json({
            success: true,
            message: "Automation triggered. Waiting for results...",
            expectedResultFile: resultFileName
        });

    } catch (err) {
        console.error("Trigger error:", err.response?.data || err.message);
        res.status(500).json({ success: false, error: err.response?.data || err.message });
    }
});

// FRONTEND UI FETCH (Acest endpoint va fi apelat de React pentru a prelua rezultatele)
app.get("/result/:fileName", async (req, res) => {
    const { fileName } = req.params;
    const filePath = path.join(RESULTS_DIR, fileName);

    try {
        if (!fs.existsSync(filePath)) {
            // Fila nu există încă, job-ul probabil încă rulează sau nu a scris
            return res.status(202).json({ status: "processing", message: "Results not yet available." });
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const parsedResults = JSON.parse(fileContent);


        lastResultJson = {
            skills: parsedResults.out_Skills || [], // Presupunem că robotul scrie `out_Skills` în fișier
            score: parsedResults.out_Score || 0,   // Presupunem că robotul scrie `out_Score` în fișier
            out_FinalJson: parsedResults.out_FinalJson || "" // Presupunem că robotul scrie `out_FinalJson`
        };

        // rezultatele complete
        res.json({
            status: "completed",
            results: lastResultJson
        });

    } catch (err) {
        console.error("Result fetch error:", err.message);
        res.status(500).json({ status: "error", error: err.message });
    }
});

app.listen(process.env.PORT || 3001, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${process.env.PORT || 3001}`);
});