import os
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

NEWS_API_KEY = os.getenv("NEWS_API_KEY")

@app.route('/api/news')
def get_news():
    api_key = 'pub_a48ee6eb1f014b57a406188f05877ea3'  
    url = f'https://newsdata.io/api/1/latest?apikey=pub_a48ee6eb1f014b57a406188f05877ea3&q=crime%20in%20pune'

    try:
        response = requests.get(url)
        data = response.json()

        # Check if 'results' exists
        if "results" not in data:
            return jsonify([])

        articles = []
        for article in data["results"]:
            articles.append({
                "title": article.get("title", "No Title"),
                "summary": article.get("description", ""),
                "content": article.get("content", ""),
                "date": article.get("pubDate", ""),
                "location": article.get("source_id", "Unknown"),
                "category": "safety",
                "priority": "medium",
                "imageUrl": article.get("image_url"),
                "url": article.get("link")
            })

        return jsonify(articles)

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
