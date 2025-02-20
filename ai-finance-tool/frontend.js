import { useState } from "react";

export default function Upload() {
    const [file, setFile] = useState<File | null>(null);
    const [report, setReport] = useState<any>(null);
    const [categorizedTransactions, setCategorizedTransactions] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file before uploading.");
            return;
        }
    
        setIsLoading(true);
        setError(null);
    
        try {
            const formData = new FormData();
            formData.append("file", file);
    
            // 🔹 Get Firebase ID token (Assuming you're using Firebase Auth in frontend)
            const user = firebase.auth().currentUser;
            if (!user) throw new Error("User not authenticated.");
            const idToken = await user.getIdToken(); // Get Firebase ID token
    
            // 🔹 Send request with the token
            const uploadResponse = await fetch("http://127.0.0.1:8000/upload", {
                method: "POST",
                headers: { "Authorization": `Bearer ${idToken}` }, // ✅ Pass token
                body: formData,
            });
    
            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.detail || "File upload failed.");
            }
    
            const uploadData = await uploadResponse.json();
            console.log("Uploaded Data:", uploadData);
    
        } catch (err: any) {
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    //         // Save the report and categorized transactions
    //         setReport(pnlData);
    //         setCategorizedTransactions(uploadData.categorized_transactions);
    //     } catch (err: any) {
    //         setError(err.message || "An error occurred. Please try again.");
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Upload CSV File</h2>
            <input
                type="file"
                className="border p-2 rounded w-full"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".csv"
            />
            <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                onClick={handleUpload}
                disabled={isLoading}
            >
                {isLoading ? "Uploading..." : "Upload"}
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
                                        {categorizedTransactions[category].map((transaction: any, index: number) => (
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