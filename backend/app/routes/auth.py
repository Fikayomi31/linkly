import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api")

@auth_bp.post("/register")
def register():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid input data format"}), 400

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    username = username.strip() if username else username
    email = email.strip() if email else email

    if not username or not email:
        return jsonify({"error": "Username and email are required"}), 400

    # validate email format
    email_pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    if not re.fullmatch(email_pattern, email):
        return jsonify({"error": "Invalid email format"}), 400

    # validate password strength
    if not isinstance(password, str) or len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long"}), 400

    # Check if the username or email already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    # Create a new user
    user = User(username=username, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at.isoformat(),
            "is_active": user.is_active
            }
        }), 201

@auth_bp.post("/login")
def login():
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid input data format"}), 400

    # Validate login input data
    email = data.get("email")
    password = data.get("password")

    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({"error": "Email and password are required"}), 400

    email = email.strip().lower()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    
    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 400

    if not user.email:
        return jsonify({"error": "Invalid email"}), 400

    if not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 400


    access_token = create_access_token(
        identity=str(user.id)
    )


    return jsonify({
        "message": "User logged in successfully",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "created_at": user.created_at.isoformat(),
            "is_active": user.is_active
        }
    }), 200