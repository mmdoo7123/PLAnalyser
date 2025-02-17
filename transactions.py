from firebase_config import db
from firebase_admin import db

def add_transaction(user_id, transaction_data):
    transactions_ref = db.collection("users").document(user_id).collection("transactions")
    transactions_ref.add(transaction_data)
    return {"message": "Transaction added successfully"}
