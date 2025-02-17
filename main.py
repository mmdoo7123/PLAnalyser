from fastapi import FastAPI, UploadFile, File
from transactions import add_transaction
from reports import generate_financial_report
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import pandas as pd
import io
from firebase_config import db
from firebase_admin import auth

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/signup")
def signup(email: str, password: str, display_name: str):
    """
    Creates a new user in Firebase Authentication and Firestore.
    """
    try:
        # Create user in Firebase Authentication
        user = auth.create_user(email=email, password=password, display_name=display_name)

        # Store user in Firestore
        user_data = {
            "email": email,
            "name": display_name,
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        db.collection("users").document(user.uid).set(user_data)

        return {"message": "User created successfully!", "userId": user.uid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/login")
def login(id_token: str):
    """
    Verifies Firebase ID token and returns user data.
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        user_id = decoded_token["uid"]

        # Fetch user data from Firestore
        user_doc = db.collection("users").document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found in database")

        return {"message": "Login successful", "userId": user_id, "userData": user_doc.to_dict()}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

# Load Hugging Face zero-shot classification model
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# Define possible transaction categories
CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Salary", "Health", "Other"]

@app.post("/transactions/{user_id}")
def create_transaction(user_id: str, transaction: dict):
    return add_transaction(user_id, transaction)

@app.post("/generate-report/{user_id}")
def create_report(user_id: str):
    return generate_financial_report(user_id)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-Powered Financial Tool API!"}

def categorize_transaction(description):
    """
    Uses Hugging Face AI to categorize a transaction description.
    """
    result = classifier(description, candidate_labels=CATEGORIES)
    return result["labels"][0]  # Returns the most likely category

def generate_pnl_report(df):
    """
    Generates a Profit & Loss report summarizing transactions.
    """
    revenue = df[df["Amount"] > 0]["Amount"].sum()
    expenses = df[df["Amount"] < 0]["Amount"].sum()
    summary = df.groupby("Category")["Amount"].sum().to_dict()
    return {"Revenue": revenue, "Expenses": expenses, "Breakdown": summary}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), id_token: str = ""):
    """
    Processes a CSV file only for authenticated users.
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        user_id = decoded_token["uid"]
    except:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

    # Apply AI categorization to each transaction
    df["Category"] = df["Description"].apply(categorize_transaction)

    # Calculate Profit & Loss
    revenue = df[df["Amount"] > 0]["Amount"].sum()
    expenses = df[df["Amount"] < 0]["Amount"].sum()
    summary = df.groupby("Category")["Amount"].sum().to_dict()

    # Group transactions by category
    categorized_transactions = df.groupby("Category").apply(lambda x: x.to_dict(orient="records")).to_dict()

    return {
        "message": "File processed",
        "Revenue": revenue,
        "Expenses": expenses,
        "Breakdown": summary,
        "categorized_transactions": categorized_transactions
    }

def categorize_transactions_batch(descriptions):
    """Uses Hugging Face AI to categorize a batch of transactions."""
    categorized = []
    for desc in descriptions:
        categorized.append(categorize_transaction(desc))  # Calls your existing function
    return categorized

@app.post("/pnl")
async def pnl_report(data: dict):
    """
    Endpoint to generate a Profit & Loss summary from transactions.
    """
    df = pd.DataFrame(data["transactions"])
    df["Category"] = df["Description"].apply(categorize_transaction)
    report = generate_pnl_report(df)
    return report
