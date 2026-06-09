import sys
import os
from pathlib import Path

# Add the project root to Python's path so Django can be found
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vehiclecareproject.settings')

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

# Vercel expects the WSGI callable to be named 'app'
app = application
