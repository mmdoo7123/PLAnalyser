from firebase_config import db
import datetime

def generate_financial_report(user_id):
    transactions_ref = firestore.client().collection("users").document(user_id).collection("transactions")
    transactions = transactions_ref.stream()

    total_income = 0
    total_expenses = 0
    breakdown = {}

    for transaction in transactions:
        data = transaction.to_dict()
        amount = data["amount"]
        category = data.get("category", "Other")

        if amount > 0:
            total_income += amount
        else:
            total_expenses += amount

        breakdown[category] = breakdown.get(category, 0) + amount

    report_data = {
        "month": datetime.datetime.now().strftime("%B"),
        "year": datetime.datetime.now().year,
        "totalIncome": total_income,
        "totalExpenses": total_expenses,
        "breakdown": breakdown,
        "createdAt": firestore.SERVER_TIMESTAMP
    }

    # Store report in Firestore
    reports_ref = firestore.client().collection("users").document(user_id).collection("reports")
    reports_ref.add(report_data)

    return {"message": "Report generated successfully", "data": report_data}
