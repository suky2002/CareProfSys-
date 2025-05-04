import React, { useState } from "react";

export default function UploadCV() {
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState("");

    const handleUpload = async () => {
        if (!file) {
            setMsg("Selectează un fișier .docx");
            return;
        }
        const form = new FormData();
        form.append("cv", file);

        try {
            const res = await fetch("http://localhost:3001/trigger", {
                method: "POST",
                body: form
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data.error));
            setMsg("✅ Automatizarea a pornit cu succes!");
        } catch (e) {
            console.error(e);
            setMsg("❌ " + (e.message || "Eroare necunoscută"));
        }
    };

    return (
        <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
            <h2>Încarcă CV (.docx)</h2>
            <input type="file" accept=".docx" onChange={(e) => e.target.files.length && setFile(e.target.files[0])} />
            <br />
            <button onClick={handleUpload} style={{ marginTop: 10 }}>
                Trimite
            </button>
            {msg && <p>{msg}</p>}
        </div>
    );
}