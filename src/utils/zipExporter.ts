import JSZip from 'jszip';
import { GITHUB_REPOSITORY_FILES } from '../data/kotlinCodebase';
import { GRADLE_WRAPPER_JAR_BASE64 } from '../data/gradleWrapper';

// Script oficial de Gradle (resumido): si existe el wrapper usa el jar,
// si no, reenvia al Gradle del sistema.
const GRADLEW_UNIX = `#!/bin/sh
# Lanzador de Gradle. Usa gradle/wrapper/gradle-wrapper.jar si esta presente.
APP_HOME=$(cd "$(dirname "$0")" && pwd)
if [ -f "$APP_HOME/gradle/wrapper/gradle-wrapper.jar" ]; then
  exec java -classpath "$APP_HOME/gradle/wrapper/gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain "$@"
fi
if ! command -v gradle >/dev/null 2>&1; then
  echo "No se encontro 'gradle' en el PATH." >&2
  echo "Instala Gradle 8.x o ejecuta: gradle wrapper" >&2
  exit 1
fi
exec gradle "$@"
`;

const GRADLEW_BAT = `@echo off
set APP_HOME=%~dp0
if exist "%APP_HOME%gradle\\wrapper\\gradle-wrapper.jar" (
  java -classpath "%APP_HOME%gradle\\wrapper\\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*
  exit /b %ERRORLEVEL%
)
where gradle >nul 2>nul
if errorlevel 1 (
  echo No se encontro gradle en el PATH. Instala Gradle 8.x o ejecuta: gradle wrapper
  exit /b 1
)
gradle %*
`;

const GRADLE_WRAPPER_PROPERTIES = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.13-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function generateProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Archivos del proyecto (Kotlin, Gradle, manifiesto, recursos, README...)
  for (const file of GITHUB_REPOSITORY_FILES) {
    zip.file(file.path, file.content);
  }

  // Gradle wrapper completo: scripts + propiedades + jar (base64)
  zip.file('gradlew', GRADLEW_UNIX, { unixPermissions: '755' });
  zip.file('gradlew.bat', GRADLEW_BAT);
  zip.file('gradle/wrapper/gradle-wrapper.properties', GRADLE_WRAPPER_PROPERTIES);
  zip.file('gradle/wrapper/gradle-wrapper.jar', base64ToBytes(GRADLE_WRAPPER_JAR_BASE64));

  const content = await zip.generateAsync({ type: 'blob' });
  return content;
}
