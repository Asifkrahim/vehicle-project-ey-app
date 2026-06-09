#!/usr/bin/env bash
# ==============================================================================
# Vercel Build Script for VehicleCare+
# Runs during 'vercel deploy' build phase
# ==============================================================================

set -e  # Exit immediately if any command fails

echo "📦 Installing Python dependencies..."
pip install -r requirements-vercel.txt

echo "📂 Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "✅ Build complete!"
