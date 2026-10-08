from flask import Flask

from config import Config
from app.extensions import db, migrate, jwt, CORS


def create_app(config_class=Config):
    app = Flask(__name__)

    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    from app import models

    @app.get("/")
    def index():
        return {"message": "Welcome to Linkly API!"}

    return app