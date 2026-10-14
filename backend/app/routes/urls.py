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

    # scheme protocol and netloc (domain) are required for a valid URL
    if not parsed_url.scheme or not parsed_url.netloc:
        return jsonify({"error": "Invalid URL format"}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.is_active:
        return jsonify({"error": "User not found or inactive"}), 404

    existing_url = URL.query.filter_by(original_url=original_url, user_id=user.id).first()

    if existing_url:
        return jsonify({
            "message": "URL already exists",
            "url": {
                "id": existing_url.id,
                "original_url": existing_url.original_url,
                "short_code": existing_url.short_code,
                "created_at": existing_url.created_at.isoformat(),
                "user_id": existing_url.user_id
            }
        }), 400

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

@urls_bp.get("")
@jwt_required()
def get_user_urls():
    user_id = int(get_jwt_identity())

    urls = (
        URL.query.filter_by(user_id=user_id)
        .order_by(URL.created_at.desc())
        .all()
    )

    return jsonify({
        "urls": [
            {
                "id": url.id,
                "original_url": url.original_url,
                "short_code": url.short_code,
                "created_at": url.created_at.isoformat(),
                "user_id": url.user_id
            }
            for url in urls
        ]
    }), 200



@urls_bp.get("/<int:url_id>")
@jwt_required()
def get_url(url_id):
    user_id = int(get_jwt_identity())
    
    url = URL.query.filter_by(id=url_id, user_id=user_id).first() 

    if not url:
        return jsonify({"error": "URL not found"}), 404
    return jsonify({
        "url": {
            "id": url.id,
            "original_url": url.original_url,
            "short_code": url.short_code,
            "created_at": url.created_at.isoformat(),
            "user_id": url.user_id
        }
    }), 200
