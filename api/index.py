import sys
import os
from pathlib import Path

# Add the project root to Python's path so Django can be found
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vehiclecareproject.settings')

import django
django.setup()

# Run migrations automatically on every cold start.
# Django's migrate is idempotent — it's a no-op when already applied,
# so this is safe and typically completes in < 1 second.
from django.core.management import call_command
try:
    call_command('migrate', verbosity=0, interactive=False)
    print("✅ Migrations applied successfully.")
except Exception as e:
    print(f"⚠️ Migration error: {e}")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

# Vercel expects the WSGI callable to be named 'app'
app = application
