from datetime import datetime, timezone

from app.extensions import db

class URL(db.Model):
    __tablename__ = "urls"

    id = db.Column(db.Integer, primary_key=True)
    original_url = db.Column(db.Text, nullable=False)
    short_code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    user = db.relationship("User", back_populates="urls")
    clicks = db.relationship("Click", back_populates="urls", cascade="all, delete-orphan")


    def __repr__(self):
        return f"<URL {self.short_code}>"


    