from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, firestore, credentials, initialize_app
from transformers import pipeline
from pydantic import BaseModel
from typing import List
import pandas as pd
import io
import os

# Initialize Firebase Admin SDK
cred = credentials.Certificate("C:\\Users\\mahmo\\firebase PLanaylzer secrets\\firebase_credentials.json")
initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (adjust for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Hugging Face zero-shot classification model
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# Define possible transaction categories
CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Salary", "Health", "Other"]

auth_scheme = HTTPBearer()

# Pydantic models for request validation
class SignupRequest(BaseModel):
    id_token: str  # Change this
    display_name: str

class LoginRequest(BaseModel):
    id_token: str

class Transaction(BaseModel):
    Description: str
    Amount: float

class PnLRequest(BaseModel):
    transactions: List[Transaction]

# Dependency for Firebase authentication
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    try:
        id_token = credentials.credentials  # Extract token
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
@app.post("/signup")
async def signup(request: SignupRequest):
    """
    Saves user data to Firestore (NOT create a user).
    """
    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(request.id_token)
        user_id = decoded_token["uid"]
        email = decoded_token["email"]

        # Store user in Firestore
        user_data = {
            "email": email,
            "display_name": request.display_name,
            "created_at": firestore.SERVER_TIMESTAMP,
        }
        db.collection("users").document(user_id).set(user_data)

        return {"message": "User data saved successfully!", "userId": user_id}
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid ID token.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/login")
async def login(request: LoginRequest):
    """
    Verifies Firebase ID token and returns user data.
    """
    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(request.id_token)
        user_id = decoded_token["uid"]

        # Fetch user data from Firestore
        user_doc = db.collection("users").document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found in database")

        return {
            "message": "Login successful",
            "userId": user_id,
            "userData": user_doc.to_dict(),
        }
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid ID token.")
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Expired ID token.")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

def categorize_transaction(description: str) -> str:
    """
    Uses Hugging Face AI to categorize a transaction description.
    """
    result = classifier(description, candidate_labels=CATEGORIES)
    return result["labels"][0]  # Returns the most likely category

def categorize_transactions_batch(descriptions: List[str]) -> List[str]:
    """
    Uses Hugging Face AI to categorize a batch of transactions.
    """
    return [categorize_transaction(desc) for desc in descriptions]

def generate_pnl_report(df: pd.DataFrame) -> dict:
    """
    Generates a Profit & Loss report summarizing transactions.
    """
    revenue = df[df["Amount"] > 0]["Amount"].sum()
    expenses = df[df["Amount"] < 0]["Amount"].sum()
    summary = df.groupby("Category")["Amount"].sum().to_dict()
    return {"Revenue": revenue, "Expenses": expenses, "Breakdown": summary}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), id_token: str = Depends(get_current_user)):
    """
    Processes a CSV file only for authenticated users.
    """
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

        # Apply AI categorization to each transaction
        df["Category"] = categorize_transactions_batch(df["Description"].tolist())

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
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/pnl")
async def pnl_report(data: PnLRequest):
    """
    Endpoint to generate a Profit & Loss summary from transactions.
    """
    try:
        df = pd.DataFrame([t.dict() for t in data.transactions])
        df["Category"] = categorize_transactions_batch(df["Description"].tolist())
        report = generate_pnl_report(df)
        return report
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-Powered Financial Tool API!"}