from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import random
import json
import os

app = Flask(__name__)
CORS(app)

def load_data():
    if os.path.exists('data.json'):
        with open('data.json', 'r') as f:
            return json.load(f)
    return {"users": [], "farms": [], "sensor_data": {}, "notifications": [], "weather_data": []}

def save_data(data):
    with open('data.json', 'w') as f:
        json.dump(data, f, indent=2)

def generate_weather_data():
    return {
        "temperature": random.randint(20, 35),
        "humidity": random.randint(40, 80),
        "rain_chance": random.randint(0, 80),
        "rain_prediction": [
            {"time": "09:00", "chance": random.randint(0, 30)},
            {"time": "12:00", "chance": random.randint(0, 50)},
            {"time": "15:00", "chance": random.randint(0, 70)},
            {"time": "18:00", "chance": random.randint(0, 40)}
        ],
        "condition": random.choice(["sunny", "cloudy", "partly_cloudy", "rainy"]),
        "wind_speed": random.randint(5, 20)
    }

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    db = load_data()
    
    if any(user['mobile'] == data['mobile'] for user in db['users']):
        return jsonify({"error": "User already exists"}), 400
    
    user = {
        "id": len(db['users']) + 1,
        "full_name": data['full_name'],
        "mobile": data['mobile'],
        "password": data['password'],
        "location": data['location'],
        "verified": False,
        "otp": str(random.randint(1000, 9999))
    }
    
    db['users'].append(user)
    save_data(db)
    
    print(f"OTP for {data['mobile']}: {user['otp']}")
    
    return jsonify({"message": "OTP sent to mobile", "user_id": user['id']})

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    db = load_data()
    
    user = next((u for u in db['users'] if u['id'] == data['user_id']), None)
    if not user or user['otp'] != data['otp']:
        return jsonify({"error": "Invalid OTP"}), 400
    
    user['verified'] = True
    user.pop('otp', None)
    save_data(db)
    
    return jsonify({"message": "Mobile number verified successfully"})

@app.route('/api/farm-setup', methods=['POST'])
def farm_setup():
    data = request.json
    db = load_data()
    
    user = next((u for u in db['users'] if u['id'] == data['user_id']), None)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    farm = {
        "user_id": data['user_id'],
        "farm_size": data['farm_size'],
        "crop_type": data['crop_type'],
        "irrigation_method": data['irrigation_method'],
        "location": data['location'],
        "moisture_threshold": 40 if data['crop_type'] == 'sugarcane' else 35,
        "created_at": datetime.now().isoformat()
    }
    
    db['farms'].append(farm)
    
    farm_id = len(db['farms'])
    db['sensor_data'][str(farm_id)] = {
        "moisture": random.uniform(30, 60),
        "temperature": random.uniform(20, 35),
        "humidity": random.uniform(40, 80),
        "last_updated": datetime.now().isoformat()
    }
    
    save_data(db)
    
    return jsonify({"message": "Farm setup completed", "farm_id": farm_id})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    db = load_data()
    
    user = next((u for u in db['users'] if u['mobile'] == data['username'] and u['password'] == data['password']), None)
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    
    if not user['verified']:
        return jsonify({"error": "Mobile not verified"}), 401
    
    farm = next((f for f in db['farms'] if f['user_id'] == user['id']), None)
    if not farm:
        return jsonify({"error": "Farm not setup"}), 400
    
    return jsonify({
        "user": {
            "id": user['id'],
            "full_name": user['full_name'],
            "mobile": user['mobile'],
            "location": user['location']
        },
        "farm": farm
    })

@app.route('/api/dashboard/<int:user_id>')
def dashboard(user_id):
    db = load_data()
    farm = next((f for f in db['farms'] if f['user_id'] == user_id), None)
    if not farm:
        return jsonify({"error": "Farm not found"}), 404
    
    sensor_data = db['sensor_data'].get(str(farm['user_id']), {})
    weather_data = generate_weather_data()
    
    moisture = sensor_data.get('moisture', 0)
    needs_irrigation = moisture < farm['moisture_threshold']
    
    response = {
        "farm": farm,
        "sensor_data": sensor_data,
        "weather": weather_data,
        "recommendation": {
            "needs_irrigation": needs_irrigation,
            "message": "Irrigation needed" if needs_irrigation else "No irrigation needed",
            "suggestion": "Consider watering in early morning to reduce evaporation" if needs_irrigation else "Moisture levels are optimal"
        }
    }
    
    return jsonify(response)

@app.route('/api/historical-data/<int:user_id>')
def historical_data(user_id):
    historical = []
    for i in range(10):
        date = (datetime.now() - timedelta(days=9-i)).strftime('%Y-%m-%d')
        historical.append({
            "date": date,
            "temperature": random.uniform(20, 35),
            "humidity": random.uniform(40, 80),
            "rainfall": random.uniform(0, 15),
            "moisture": random.uniform(30, 60)
        })
    
    return jsonify(historical)

@app.route('/api/notifications/<int:user_id>')
def get_notifications(user_id):
    db = load_data()
    farm = next((f for f in db['farms'] if f['user_id'] == user_id), None)
    if not farm:
        return jsonify({"error": "Farm not found"}), 404
    
    notifications = [
        {
            "id": 1,
            "type": "rain_alert",
            "message": "Rain expected tomorrow at your farm location",
            "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
            "read": False
        },
        {
            "id": 2,
            "type": "moisture_alert",
            "message": f"Soil moisture critically low in {farm['crop_type']} field",
            "timestamp": (datetime.now() - timedelta(days=1)).isoformat(),
            "read": True
        }
    ]
    
    return jsonify(notifications)

@app.route('/api/send-alert/<int:user_id>', methods=['POST'])
def send_alert(user_id):
    db = load_data()
    user = next((u for u in db['users'] if u['id'] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    print(f"SMS sent to {user['mobile']}: Alert! Your farm needs attention.")
    
    return jsonify({"message": "Alert sent successfully"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)