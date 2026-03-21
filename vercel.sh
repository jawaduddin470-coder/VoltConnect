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

# 5. Build Web
flutter build web --release
