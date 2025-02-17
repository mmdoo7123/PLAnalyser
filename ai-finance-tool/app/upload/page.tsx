"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";  

export default function UploadPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); 

  useEffect(() => {
    // ✅ Listen for auth changes & redirect if not authenticated
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (!authUser) {
        router.push("/login"); // ✅ Redirect to login if user is not authenticated
      } else {
        setUser(authUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [categorizedTransactions, setCategorizedTransactions] = useState<any>({});

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }

    try {
      // ✅ Get Firebase Authentication Token
      const idToken = await user?.getIdToken();

      const formData = new FormData();
      formData.append("file", file);

      let response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}` // ✅ Send ID token for authentication
        },
        body: formData,
      });

      let data = await response.json();
      console.log("Uploaded Data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      setReport({
        Revenue: data.Revenue,
        Expenses: data.Expenses,
        Breakdown: data.Breakdown,
      });

      setCategorizedTransactions(data.categorized_transactions);
      setUploadMessage("File uploaded successfully!");
    } catch (error) {
      setUploadMessage("Error uploading file. Try again.");
      console.error("Upload Error:", error);
    }
  };

  if (loading) return <p>Loading...</p>; // ✅ Prevent flickering while checking authentication

  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="text-2xl font-bold mb-4">AI-Powered Financial Analyzer</h1>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-2" />

      <button onClick={handleUpload} className="bg-blue-500 text-white p-2 rounded">
        Upload & Analyze
      </button>

      {uploadMessage && <p className="text-red-500 mt-2">{uploadMessage}</p>}

      {report && (
        <div className="mt-6 p-4 border rounded bg-gray-100">
          <h2 className="text-lg font-semibold">Profit & Loss Summary</h2>
          <p>Revenue: ${report.Revenue}</p>
          <p>Expenses: ${report.Expenses}</p>

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
  );
}
