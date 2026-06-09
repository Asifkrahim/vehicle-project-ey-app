import sys
import os
from pathlib import Path

# Add the project root to Python's path so Django can be found
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vehiclecareproject.settings')

import django
django.setup()

# ── 1. Run migrations ────────────────────────────────────────────────────────
from django.core.management import call_command
try:
    call_command('migrate', verbosity=0, interactive=False)
    print("✅ Migrations applied successfully.")
except Exception as e:
    print(f"⚠️ Migration error: {e}")

# ── 2. Auto-create superuser from env vars (only if none exists) ─────────────
from django.contrib.auth import get_user_model
User = get_user_model()

SUPERUSER_EMAIL    = os.environ.get('DJANGO_SUPERUSER_EMAIL')
SUPERUSER_PASSWORD = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
SUPERUSER_USERNAME = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')

try:
    if SUPERUSER_EMAIL and SUPERUSER_PASSWORD:
        if not User.objects.filter(is_superuser=True).exists():
            User.objects.create_superuser(
                username=SUPERUSER_USERNAME,
                email=SUPERUSER_EMAIL,
                password=SUPERUSER_PASSWORD,
            )
            print(f"✅ Superuser '{SUPERUSER_USERNAME}' created.")
        else:
            print("ℹ️  Superuser already exists — skipping creation.")
    else:
        print("⚠️  DJANGO_SUPERUSER_EMAIL / DJANGO_SUPERUSER_PASSWORD not set — skipping superuser creation.")
except Exception as e:
    print(f"⚠️ Superuser creation error: {e}")

# ── 3. Start WSGI application ─────────────────────────────────────────────────
from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

# Vercel expects the WSGI callable to be named 'app'
app = application
