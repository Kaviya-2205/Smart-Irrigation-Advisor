from flask import Flask, request, jsonify, render_template
import requests

app = Flask(__name__)

def get_weather(city):
    api_key = "5c677b044b59485fb79123840250408"  # ← replace this with your real API key
    url = f"http://api.weatherapi.com/v1/current.json?key={api_key}&q={city}"
    response = requests.get(url)
    return response.json()

@app.route('/', methods=['GET', 'POST'])
def home():
    result = ""
    if request.method == 'POST':
        city = request.form['location']
        language = request.form['language']

        try:
            weather = get_weather(city)
            humidity = weather['current']['humidity']  # Real humidity
            rainfall = weather['current']['precip_mm']  # Real rain

            # Estimate soil moisture using a simple formula
            moisture = int((humidity * 0.6) + (rainfall * 4))
            if moisture > 100:
                moisture = 100

            # Decision logic
            if language == "Tamil":
                if moisture < 50 and rainfall < 5:
                    decision = "✅ நீரூற்றி இப்போது"
                else:
                    decision = "❌ நீரூட்ட தேவையில்லை"
                result = f"{city.title()} - நிலத்தின் ஈரப்பதம்: {moisture}%, மழை: {rainfall}mm → {decision}"

            else:
                if moisture < 50 and rainfall < 5:
                    decision = "✅ Irrigate Now"
                else:
                    decision = "❌ No Irrigation Needed"
                result = f"{city.title()} - Moisture: {moisture}%, Rainfall: {rainfall}mm → {decision}"

        except Exception as e:
            result = f"Error fetching weather for {city.title()}. Please check the city name or try again later."

    return render_template('index.html', result=result)

if __name__ == '__main__':
    app.run(debug=True)
