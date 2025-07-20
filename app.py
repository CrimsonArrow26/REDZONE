from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
from models import db, EmergencyContact, User
from werkzeug.security import generate_password_hash, check_password_hash


load_dotenv()


app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your_secret_key')

# Set the correct SQLAlchemy database URI for Supabase
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Utkarsh@123@db.shqfvfjsxtdeknqncjfa.supabase.co:5432/postgres'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)



@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    phone = data['phone']
    email = data['email']
    password = data['password']

    hashed_password = generate_password_hash(password)
    user = User(username=username, phone=phone , email=email,  password_hash=hashed_password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully", "user_id": user.id})


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        return jsonify({"message": "Login successful", "user_id": user.id})
    return jsonify({"error": "Invalid credentials"}), 401



@app.route('/api/emergency-contacts', methods=['POST'])
def add_contact():
    data = request.get_json()
    new_contact = EmergencyContact(
        user_id=data['user_id'],
        name=data['name'],
        phone=data['phone'],
        relationship=data['relationship']
    )
    db.session.add(new_contact)
    db.session.commit()
    return jsonify({"message": "Contact added", "contact": new_contact.to_dict()}), 201


@app.route('/api/emergency-contacts/<int:user_id>', methods=['GET'])
def get_contacts(user_id):
    contacts = EmergencyContact.query.filter_by(user_id=user_id).all()
    return jsonify([contact.to_dict() for contact in contacts])


@app.route('/api/emergency-contacts/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    contact = EmergencyContact.query.get(contact_id)
    if contact:
        db.session.delete(contact)
        db.session.commit()
        return jsonify({'message': 'Deleted'})
    return jsonify({'error': 'Not found'}), 404


@app.route('/api/news', methods=['GET'])
def get_news():
    return jsonify([
        {"title": "Fire Alert in Sector 7", "content": "Avoid the area near Park View."},
        {"title": "Blood Donation Camp", "content": "Join at Red Cross Center on Sunday."}
    ])

@app.route('/api/events', methods=['GET'])
def get_events():
    return jsonify([
        {"title": "First Aid Workshop", "date": "2025-08-01"},
        {"title": "Disaster Awareness Drive", "date": "2025-08-15"}
    ])

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    return jsonify([
        {"type": "Flood", "area": "Riverside", "severity": "High"},
        {"type": "Power Cut", "area": "Sector 9", "severity": "Medium"}
    ])

@app.route('/api/community', methods=['GET'])
def get_community_posts():
    return jsonify([
        {"user": "Priya", "message": "Lost dog near sector 5! Help needed."},
        {"user": "Amit", "message": "Need volunteers for tree plantation."}
    ])
@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "phone": user.phone
        })
    return jsonify({"error": "User not found"}), 404




@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists("static/" + path):
        return send_from_directory('static', path)
    else:
        return send_from_directory('static', 'index.html')




if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
