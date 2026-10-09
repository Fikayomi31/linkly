from flask import Flask

from config import Config
from app.extensions import db, migrate, jwt, CORS

from app.routes.auth import auth_bp



def create_app(config_class=Config):
    app = Flask(__name__)

    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    app.register_blueprint(auth_bp)


    from app import models

    
    # Create database tables
    with app.app_context():
        db.create_all()

    @app.get("/")
    def index():
        return {"message": "Welcome to Linkly API!"}

    return app