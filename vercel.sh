#!/bin/bash
set -ex

# 1. Clean entirely to remove old cached master-branch flutter
rm -rf flutter
rm -rf .pub-cache
rm -rf .dart_tool
rm -rf build

# 2. Clone strict stable Flutter branch
git clone -b stable https://github.com/flutter/flutter.git

# 3. Isolate the Pub Cache to this project folder to avoid Vercel global cache corruption
export PUB_CACHE=$PWD/.pub-cache
export PATH="$PWD/flutter/bin:$PATH"

# 4. Clean and fetch cleanly
flutter clean
flutter config --no-analytics
flutter pub get

# 4.5 Generate .env file from Vercel Environment Variables
# Flutter will crash instantly (unhandled exception in asset bundler) if .env is missing since it's declared in pubspec.yaml
echo "FIREBASE_API_KEY=$FIREBASE_API_KEY" > .env
echo "FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN" >> .env
echo "FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID" >> .env
echo "FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET" >> .env
echo "FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID" >> .env
echo "FIREBASE_APP_ID=$FIREBASE_APP_ID" >> .env
echo "FIREBASE_MEASUREMENT_ID=$FIREBASE_MEASUREMENT_ID" >> .env
echo "OPENROUTER_API_KEY=$OPENROUTER_API_KEY" >> .env
echo "RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID" >> .env
echo "RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET" >> .env
echo "OCMAP_API_KEY=$OCMAP_API_KEY" >> .env

# We do not append the Admin Backend keys (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) 
# as they belong purely to the node backend/functions, keeping the web client safe.

# 5. Build Web
flutter build web --release
