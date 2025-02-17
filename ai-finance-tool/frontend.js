import { useState } from "react";

export default function Upload() {
    const [file, setFile] = useState(null);
    const [report, setReport] = useState(null);
    const [categorizedTransactions, setCategorizedTransactions] = useState(null); // Fix: Define state for categorized transactions
    const [error, setError] = useState(null);

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file before uploading.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", file);

            // First API Call: Upload CSV file
            let response = await fetch("http://127.0.0.1:8000/upload", {
                method: "POST",
                body: formData,
            });

            let data = await response.json();
            if (!response.ok) throw new Error(data.detail || "File upload failed.");

            // Second API Call: Generate Profit & Loss report
            response = await fetch("http://127.0.0.1:8000/pnl", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactions: data.transactions }),
            });

            let pnlData = await response.json();
            if (!response.ok) throw new Error(pnlData.detail || "Profit & Loss report generation failed.");

            // Save the report and categorized transactions
            setReport(pnlData);
            setCategorizedTransactions(data.categorized_transactions); // Fix: Store categorized transactions
            setError(null); // Clear errors if successful
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Upload CSV File</h2>
            <input 
                type="file" 
                className="border p-2 rounded w-full" 
                onChange={(e) => setFile(e.target.files[0])} 
            />
            <button 
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" 
                onClick={handleUpload}
            >
                Upload
            </button>

            {error && <p className="text-red-500 mt-4">{error}</p>}

            {report && (
                <div className="mt-6 p-4 border rounded bg-gray-100">
                    <h2 className="text-lg font-semibold">Profit & Loss Summary</h2>
                    <p>Revenue: ${report.Revenue}</p>
                    <p>Expenses: ${report.Expenses}</p>

                    {categorizedTransactions && (
                        <div>
                            <h3 className="text-lg font-semibold mt-4">Categorized Transactions</h3>
                            {Object.keys(categorizedTransactions).map((category) => (
                                <div key={category} className="mt-2 p-2 border rounded bg-white">
                                    <h4 className="font-bold">{category}</h4>
                                    <ul className="list-disc pl-4">
                                        {categorizedTransactions[category].map((transaction, index) => (
                                            <li key={index}>
                                                {transaction.Description} - ${transaction.Amount}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
