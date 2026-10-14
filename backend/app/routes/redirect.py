from flask import Blueprint, request, jsonify, redirect

from app.extensions import db
from app.models import URL, Click

redirect_bp = Blueprint("redirect", __name__)

@redirect_bp.get("/<string:short_code>")
def redirect_to_original(short_code):
    url = URL.query.filter_by(short_code=short_code, is_active=True).first()

    if not url:
        return jsonify({"error": "Short URL not found or inactive"}), 404

    click = Click(
        url_id=url.id,
        user_agent=request.headers.get("User-Agent"),
        referrer=request.referrer,
    )
    db.session.add(click)
    db.session.commit()


    return redirect(url.original_url, code=302)
