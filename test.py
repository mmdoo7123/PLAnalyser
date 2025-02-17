from firebase_admin import firestore, credentials
import firebase_admin

# Use your correct JSON key path
cred = credentials.Certificate("C:/Users/mahmo/ProfitLossAnalyzer/planalyzer-ae7b6-firebase-adminsdk-fbsvc-4c2ee5bf97.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Test Firestore connection
doc_ref = db.collection("test").document("sample")
doc_ref.set({"message": "Hello Firestore"})

print("Data written successfully!")
from firebase_admin import firestore

db = firestore.client()

users = db.collection("users").stream()
for user in users:
    print(user.id, user.to_dict())

print("Firestore check completed!")
