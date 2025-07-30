import os
import requests
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Production CORS configuration - update with your actual frontend domain
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://redzoner.netlify.app")
CORS(app, origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"])

# Environment variables with proper fallbacks
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

if not NEWS_API_KEY:
    logger.error("NEWS_API_KEY environment variable is not set!")
    NEWS_API_KEY = "pub_a48ee6eb1f014b57a406188f05877ea3"  # Fallback for development

@app.route('/api/geocode')
def geocode():
    """Proxy endpoint for geocoding to avoid CORS issues"""
    try:
        query = request.args.get('q')
        if not query:
            return jsonify({"error": "Query parameter 'q' is required"}), 400
        
        url = f'https://nominatim.openstreetmap.org/search?format=json&q={query}'
        
        response = requests.get(url, headers={
            'User-Agent': 'RouteRiskAnalyzer/1.0 (your-email@example.com)'
        }, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify(data)
        else:
            logger.error(f"Geocoding API error: {response.status_code}")
            return jsonify({"error": "Geocoding service unavailable"}), 503
            
    except Exception as e:
        logger.error(f"Geocoding error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/news')
def get_news():
    """Fetch news articles from the news API"""
    try:
        url = f'https://newsdata.io/api/1/latest?apikey={NEWS_API_KEY}&q=crime%20in%20pune'
        
        response = requests.get(url, timeout=10)  # Add timeout for production
        response.raise_for_status()  # Raise exception for bad status codes
        
        data = response.json()

        # Check if 'results' exists
        if "results" not in data:
            logger.warning("No results found in news API response")
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

        logger.info(f"Successfully fetched {len(articles)} news articles")
        return jsonify(articles)

    except requests.exceptions.Timeout:
        logger.error("News API request timed out")
        return jsonify({"error": "Request timeout"}), 504
    except requests.exceptions.RequestException as e:
        logger.error(f"News API request failed: {str(e)}")
        return jsonify({"error": "Failed to fetch news"}), 500
    except Exception as e:
        logger.error(f"Unexpected error in get_news: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({
        "status": "healthy",
        "message": "Backend is running",
        "environment": ENVIRONMENT,
        "version": "1.0.0"
    })

@app.route('/api/status')
def status():
    """Detailed status endpoint for monitoring"""
    return jsonify({
        "status": "operational",
        "environment": ENVIRONMENT,
        "api_key_configured": bool(NEWS_API_KEY),
        "frontend_url": FRONTEND_URL
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    
    logger.info(f"Starting Flask app in {ENVIRONMENT} mode on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
