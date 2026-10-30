#!/usr/bin/env bash
# Compila la APK de Apps Recientes (Wear OS / Xiaomi Watch 2).
# Uso: ./build-apk.sh [debug|release]
set -euo pipefail

cd "$(dirname "$0")"

export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-17-openjdk-amd64}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

VARIANT="${1:-release}"

echo "==> Java: $(java -version 2>&1 | head -1)"
echo "==> SDK:  $ANDROID_HOME"

if [ "$VARIANT" = "debug" ]; then
  ./gradlew --no-daemon assembleDebug
  APK="app/build/outputs/apk/debug/app-debug.apk"
else
  # La release va firmada con la clave de debug para poder instalarla por ADB.
  ./gradlew --no-daemon assembleRelease
  APK="app/build/outputs/apk/release/app-release.apk"
fi

echo "==> APK: $APK ($(du -h "$APK" | cut -f1))"
echo "Instalar en el reloj:  adb install -r $APK"
