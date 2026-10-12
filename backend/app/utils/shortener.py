import secrets
import string

from app.models import URL

def generate_short_code(length=6):
    characters = string.ascii_letters + string.digits

    short_code = "".join(secrets.choice(characters)
                         for _ in range(length)
                        )
    return short_code

# Check if the generated short code is unique in the database
def create_unique_short_code(length=6):
    while True:
        short_code = generate_short_code(length)
        # Check if the short code already exists in the database
        if not URL.query.filter_by(short_code=short_code).first():
            return short_code
