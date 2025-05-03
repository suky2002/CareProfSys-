import React, { useState } from "react";

export default function UploadCV() {
    const [file, setFile] = useState(null);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        setResponse(null);
        setError("");
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Selectează un fișier .docx");
            return;
        }

        const fakePath = "C:\\fakepath\\" + file.name;

        try {
            const res = await fetch("http://localhost:3001/start-trigger", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cvPath: fakePath })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || "Eroare de la server");
            setResponse(data);
        } catch (err) {
            console.error(err);
            setError(err.message || "Eroare necunoscută");
        }
    };

    return (
        <div>
            <h2>Încarcă CV (.docx)</h2>
            <input type="file" accept=".docx" onChange={handleFileChange} />
            <button onClick={handleUpload}>Trimite</button>
            {error && <div style={{ color: "red" }}>{error}</div>}
            {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
        </div>
    );
}