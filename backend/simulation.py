import random
from datetime import datetime, timedelta
from typing import Dict, List

class SensorSimulator:
    def __init__(self):
        self.fields = [
            {"id": 1, "name": "North Field", "crop_type": "Corn", "size_acres": 10, "location": "North Section"},
            {"id": 2, "name": "South Field", "crop_type": "Wheat", "size_acres": 8, "location": "South Section"},
            {"id": 3, "name": "East Field", "crop_type": "Soybean", "size_acres": 12, "location": "East Section"},
            {"id": 4, "name": "West Field", "crop_type": "Cotton", "size_acres": 15, "location": "West Section"}
        ]
        
        # Initialize sensor data for each field
        self.sensor_data = {}
        for field in self.fields:
            self.sensor_data[field["id"]] = {
                "moisture": random.uniform(20, 60),
                "temperature": random.uniform(15, 35),
                "humidity": random.uniform(30, 80),
                "last_updated": datetime.now()
            }
    
    def get_fields(self):
        return self.fields
    
    def get_field(self, field_id: int):
        for field in self.fields:
            if field["id"] == field_id:
                return field
        return None
    
    def get_sensor_readings(self, field_id: int = None):
        if field_id:
            if field_id in self.sensor_data:
                # Simulate small changes in readings
                self.sensor_data[field_id]["moisture"] += random.uniform(-2, 2)
                self.sensor_data[field_id]["temperature"] += random.uniform(-0.5, 0.5)
                self.sensor_data[field_id]["humidity"] += random.uniform(-1, 1)
                
                # Ensure values stay within reasonable bounds
                self.sensor_data[field_id]["moisture"] = max(10, min(80, self.sensor_data[field_id]["moisture"]))
                self.sensor_data[field_id]["temperature"] = max(10, min(40, self.sensor_data[field_id]["temperature"]))
                self.sensor_data[field_id]["humidity"] = max(20, min(90, self.sensor_data[field_id]["humidity"]))
                
                self.sensor_data[field_id]["last_updated"] = datetime.now()
                return {field_id: self.sensor_data[field_id]}
            return {}
        else:
            # Update all fields
            for fid in self.sensor_data:
                self.sensor_data[fid]["moisture"] += random.uniform(-2, 2)
                self.sensor_data[fid]["temperature"] += random.uniform(-0.5, 0.5)
                self.sensor_data[fid]["humidity"] += random.uniform(-1, 1)
                
                # Ensure values stay within reasonable bounds
                self.sensor_data[fid]["moisture"] = max(10, min(80, self.sensor_data[fid]["moisture"]))
                self.sensor_data[fid]["temperature"] = max(10, min(40, self.sensor_data[fid]["temperature"]))
                self.sensor_data[fid]["humidity"] = max(20, min(90, self.sensor_data[fid]["humidity"]))
                
                self.sensor_data[fid]["last_updated"] = datetime.now()
            
            return self.sensor_data
    
    def get_recommendation(self, field_id: int):
        if field_id not in self.sensor_data:
            return {"error": "Field not found"}
        
        data = self.sensor_data[field_id]
        moisture = data["moisture"]
        
        if moisture < 25:
            return {
                "field_id": field_id,
                "recommendation": "CRITICAL: Irrigation needed immediately",
                "duration_minutes": 60,
                "water_volume": 5000,
                "urgency": "high"
            }
        elif moisture < 40:
            return {
                "field_id": field_id,
                "recommendation": "Irrigation recommended",
                "duration_minutes": 30,
                "water_volume": 3000,
                "urgency": "medium"
            }
        else:
            return {
                "field_id": field_id,
                "recommendation": "No irrigation needed",
                "duration_minutes": 0,
                "water_volume": 0,
                "urgency": "low"
            }
    
    def get_schedules(self):
        schedules = []
        for field in self.fields:
            rec = self.get_recommendation(field["id"])
            schedules.append({
                "field_id": field["id"],
                "field_name": field["name"],
                "schedule": f"Every {random.randint(2, 5)} days",
                "next_irrigation": (datetime.now() + timedelta(days=random.randint(0, 3))).strftime("%Y-%m-%d %H:%M"),
                "status": random.choice(["active", "pending", "completed"]),
                "recommendation": rec["recommendation"]
            })
        return schedules
    
    def simulate_alert(self):
        # Randomly select a field that might need attention
        field = random.choice(self.fields)
        issues = [
            f"Low moisture level detected in {field['name']}",
            f"Temperature anomaly in {field['name']}",
            f"Irrigation system needs maintenance in {field['name']}",
            f"Water pressure drop in {field['name']}"
        ]
        
        return {
            "message": random.choice(issues),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "field_id": field["id"],
            "field_name": field["name"],
            "severity": random.choice(["low", "medium", "high"])
        }

# Create a global instance
simulator = SensorSimulator()