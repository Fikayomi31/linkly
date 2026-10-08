from app.extensions import db
from app.models import User
from app.models.click import Click
from app.models.url import URL
from tests.conftest import app



def  test_create_user(app):
    with app.app_context():
        user = User(
            username="testuser",
            email="testuser@example.com"
        )

        user.set_password("testpassword1234")
        db.session.add(user)
        db.session.commit()

        saved_user = User.query.filter_by(
            username="testuser"
        ).first()

        assert saved_user is not None
        assert saved_user.username == "testuser"
        assert saved_user.email == "testuser@example.com"


def test_password_hashing(app):
    with app.app_context():
        user = User(
            username="John",
            email="john@example.com"
        )

        user.set_password("password1234")

        assert user.password_hash != "password1234"
        assert user.check_password("password1234") is True
        assert user.check_password("wrongpassword") is False


def test_user_can_have_urls(app):
    with app.app_context():
        user = User(
            username="testuser",
            email="testuser@example.com"
        ) 
        user.set_password("testpassword1234")

        url = URL(
            original_url="https://www.example.com",
            short_code="abc123",
            user=user
        )

        db.session.add(user)
        db.session.add(url)
        db.session.commit()

        saved_url = URL.query.filter_by(short_code="abc123").first()

        assert saved_url is not None
        assert saved_url.original_url == "https://www.example.com"
        assert saved_url.short_code == "abc123"

def test_user_urls_relationship(app):
    with app.app_context():
        user = User(
            username="testuser",
            email="testuser@example.com"
        )
        user.set_password("testpassword1234")

        url1 = URL(
            original_url="https://www.example1.com",
            short_code="abc123",
            user=user
        )

        url2 = URL(
            original_url="https://www.example2.com",
            short_code="def456",
            user=user
        )

        db.session.add(user)
        db.session.add(url1, url2)
        db.session.commit()

        assert len(user.urls) == 2
        assert user.urls[0].short_code == "abc123"
        assert user.urls[1].short_code == "def456"

def test_url_can_have_clicks(app):
    with app.app_context():
        user = User(
            username="testuser",
            email="testuser@example.com"
        )
        user.set_password("testpassword1234")

        url = URL(
            original_url="https://www.example.com",
            short_code="abc123",
            user=user
        )
        click1 = Click(
            url=url,
            user_agent="Mozilla/5.0",
            referrer="https://www.google.com"
        )

        click2 = Click(
            url=url,
            user_agent="Chrome",
            referrer="https://www.bing.com"
        )

        db.session.add(user)
        db.session.add(url)
        db.session.add(click1, click2)
        db.session.commit()

        assert len(url.clicks) == 2
        assert url.clicks[0].user_agent == "Mozilla/5.0"
        assert url.clicks[1].user_agent == "Chrome"

