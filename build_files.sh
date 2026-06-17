#!/usr/bin/env bash
# ==============================================================================
# Vercel Build Script for VehicleCare+
# ==============================================================================

set -e

echo "📦 Installing Python dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo "📂 Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "✅ Build complete!"
