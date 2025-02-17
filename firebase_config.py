import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate("C:\\Users\\mahmo\\ProfitLossAnalyzer\\planalyzer-ae7b6-firebase-adminsdk-fbsvc-4c2ee5bf97.json")
    firebase_admin.initialize_app(cred)

# Firestore database instance
db = firestore.client()
