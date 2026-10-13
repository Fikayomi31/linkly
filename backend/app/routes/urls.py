from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from urllib.parse import urlparse

from app.extensions import db
from app.models import URL, User
from app.utils.shortener import create_unique_short_code

urls_bp = Blueprint("urls", __name__, url_prefix="/api/urls")

@urls_bp.post("")
@jwt_required()
def create_url():
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid input data format"}), 400

    original_url = data.get("original_url")

    parsed_url = urlparse(original_url)

    if not parsed_url.scheme or not parsed_url.netloc:
        return jsonify({"error": "Invalid URL format"}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.is_active:
        return jsonify({"error": "User not found or inactive"}), 404

    short_code = create_unique_short_code()

    new_url = URL(original_url=original_url, short_code=short_code, user_id=user.id)

    try:
        db.session.add(new_url)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Failed to create URL"}), 500


    return jsonify({
        "message": "URL created successfully",
        "url": {
            "id": new_url.id,
            "original_url": new_url.original_url,
            "short_code": new_url.short_code,
            "created_at": new_url.created_at.isoformat(),
            "user_id": new_url.user_id
        }
    }), 201


