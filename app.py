from flask import Flask, jsonify
from flask_cors import CORS
import random
import time

app = Flask(__name__)
CORS(app)

data = {
    "supplier": 100,
    "warehouse": 50,
    "retailer": 20,
    "alerts": [],
    "history": [],
    "demand_history": []
}

REORDER_POINT = 10
REORDER_QUANTITY = 30
DEMAND_RANGE = (1, 5)

def log_event(message):
    data["history"].append({
        "time": time.strftime("%H:%M:%S"),
        "event": message
    })

def predict_demand():
    if len(data["demand_history"]) == 0:
        return 2
    return sum(data["demand_history"][-5:]) // len(data["demand_history"][-5:])

@app.route('/status', methods=['GET'])
def status():
    return jsonify(data)

@app.route('/simulate', methods=['POST'])
def simulate():
    demand = random.randint(*DEMAND_RANGE)
    data["demand_history"].append(demand)

    # SELL
    if data["retailer"] >= demand:
        data["retailer"] -= demand
        log_event(f"Sold {demand} units")
    else:
        log_event("Stockout! Lost sales")

    predicted = predict_demand()

    # RETAILER RESTOCK
    if data["retailer"] < predicted * 2:
        if data["warehouse"] >= REORDER_QUANTITY:
            data["warehouse"] -= REORDER_QUANTITY
            data["retailer"] += REORDER_QUANTITY
            data["alerts"].append("Retailer restocked")
            log_event("Retailer restocked from warehouse")
        else:
            data["alerts"].append("Warehouse low stock!")

    # WAREHOUSE RESTOCK
    if data["warehouse"] < predicted * 2:
        data["supplier"] += REORDER_QUANTITY
        data["warehouse"] += REORDER_QUANTITY
        data["alerts"].append("Warehouse restocked")
        log_event("Warehouse restocked from supplier")

    return jsonify({
        "message": "Simulation done",
        "demand": demand,
        "predicted_demand": predicted
    })

if __name__ == '__main__':
    app.run(debug=True)