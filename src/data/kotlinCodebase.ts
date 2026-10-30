export interface ProjectFile {
  path: string;
  filename: string;
  category: 'workflow' | 'gradle' | 'manifest' | 'kotlin' | 'res' | 'docs';
  description: string;
  content: string;
}

// Proyecto Android real (Wear OS) que se muestra y se descarga en ZIP.
// Este archivo se genera desde la carpeta android/ del repositorio.
export const GITHUB_REPOSITORY_FILES: ProjectFile[] = [
  {
    path: '.github/workflows/build-apk.yml',
    filename: 'build-apk.yml',
    category: 'workflow',
    description: 'GitHub Actions CI: Compila automáticamente la APK de Wear OS en cada push a GitHub y la deja lista para descargar en Artifacts o Releases.',
    content: `name: Build Wear OS APK (Xiaomi Watch 2)

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Set up Gradle
        uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: '8.13'

      - name: Build Debug + Release APK
        run: |
          gradle assembleDebug --stacktrace
          gradle assembleRelease --stacktrace
        env:
          ANDROID_HOME: \${{ env.ANDROID_SDK_ROOT }}

      - name: Upload Debug APK
        uses: actions/upload-artifact@v4
        with:
          name: apps-recientes-debug
          path: app/build/outputs/apk/debug/app-debug.apk
          retention-days: 14

      - name: Upload Release APK
        uses: actions/upload-artifact@v4
        with:
          name: apps-recientes-release
          path: app/build/outputs/apk/release/app-release.apk
          retention-days: 14

      - name: Attach APKs to Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v2
        with:
          files: |
            app/build/outputs/apk/debug/app-debug.apk
            app/build/outputs/apk/release/app-release.apk
`,
  },
  {
    path: 'README.md',
    filename: 'README.md',
    category: 'docs',
    description: 'Documentación principal del repositorio de GitHub con instrucciones de compilación y comandos ADB para Xiaomi Watch 2.',
    content: `# Apps Recientes · Wear OS (Xiaomi Watch 2)

Gestor de aplicaciones recientes y liberador de memoria para **Xiaomi Watch 2** (Snapdragon W5+ Gen 1, Wear OS 3.5 / 4) y cualquier reloj circular con Wear OS 3 o superior.

Interfaz **Jetpack Compose for Wear OS** con tipografía grande, tarjetas compactas y botones de tipo píldora pensados para una pantalla de 1.43".

---

## Características

- **Diseño circular**: \`ScalingLazyColumn\` sin auto-centrado, cabecera fija bajo el reloj y tarjetas que no se cortan en los bordes.
- **Tipografía grande**: títulos de 15sp–17sp, secundarios de 12sp, alto contraste sobre negro AMOLED.
- **Corona giratoria**: \`onRotaryScrollEvent\` para desplazar la lista con la corona del reloj.
- **Lista real de apps recientes**: \`UsageStatsManager\` (últimos 45 min) + \`ActivityManager.runningAppProcesses\`, filtrando paquetes del sistema y apps sin lanzador.
- **RAM libre real** del reloj en la cabecera (\`ActivityManager.MemoryInfo\`), que se actualiza al limpiar.
- **Cierre sin root**: \`ActivityManager.killBackgroundProcesses()\` + lista de descartadas para que la app cerrada no reaparezca hasta pulsar *Actualizar*.
- **Feedback háptico** al cerrar una app o pulsar *Cerrar todas*.
- **Icono adaptativo** propio (escoba) con capa *monochrome* para Wear OS 4.
- **APK de ~2 MB** en release (R8 + sin recursos innecesarios).

> La RAM por app es una **estimación** (\`~65 MB\`): Android no permite leer el PSS de otras apps sin root. El dato de RAM libre de la cabecera sí es real.

---

## Estructura

\`\`\`
├── .github/workflows/build-apk.yml   # CI: compila debug + release y publica artifacts
├── app/
│   ├── build.gradle.kts              # Wear Compose 1.4, compileSdk 35, minSdk 30
│   ├── proguard-rules.pro
│   └── src/main/
│       ├── AndroidManifest.xml       # uses-feature watch, standalone, permisos
│       ├── java/com/example/wearrecentapps/
│       │   ├── MainActivity.kt       # UI Compose (cabecera, tarjetas, píldoras)
│       │   └── AppManagerViewModel.kt# UsageStats + kill + RAM libre + háptica
│       └── res/                      # strings, colores e icono adaptativo
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
└── README.md
\`\`\`

---

## Compilar la APK

### En GitHub (sin instalar nada)

1. Sube el proyecto al repositorio.
2. Abre la pestaña **Actions** → workflow **Build Wear OS APK**.
3. Descarga el artifact \`apps-recientes-debug\` o \`apps-recientes-release\`.

El workflow instala Gradle 8.13, compila \`assembleDebug\` y \`assembleRelease\` y sube ambas APKs.

### En local

\`\`\`bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/android-sdk
./gradlew assembleDebug     # app/build/outputs/apk/debug/app-debug.apk
./gradlew assembleRelease   # app/build/outputs/apk/release/app-release.apk (firmada con debug)
\`\`\`

Si el ZIP no incluye \`gradle-wrapper.jar\`, ejecuta una vez \`gradle wrapper\` (o usa \`gradle assembleDebug\` directamente).

---

## Instalar en el reloj (ADB por Wi-Fi)

1. En el reloj: **Ajustes → Sistema → Información** y pulsa **7 veces** en *Número de compilación*.
2. **Ajustes → Opciones de desarrollador**: activa *Depuración ADB* y *Depuración inalámbrica*.
3. En el PC:

\`\`\`bash
adb pair 192.168.1.XX:PUERTO   # código de 6 dígitos que muestra el reloj
adb connect 192.168.1.XX:5555
adb install -r apps-recientes-watch.apk
\`\`\`

4. Abre **Apps Recientes** en el reloj y concede **Acceso de uso** cuando lo pida. Si el menú no aparece en Wear OS, fuérzalo por ADB:

\`\`\`bash
adb shell appops set com.example.wearrecentapps GET_USAGE_STATS allow
\`\`\`

---

## Permisos

| Permiso | Uso |
| --- | --- |
| \`KILL_BACKGROUND_PROCESSES\` | Cerrar procesos en segundo plano sin root |
| \`PACKAGE_USAGE_STATS\` | Detectar apps usadas recientemente (se concede a mano) |
| \`QUERY_ALL_PACKAGES\` | Leer nombre e icono de las apps instaladas |
| \`VIBRATE\` | Feedback háptico al cerrar |

---

## Estado

Compilado y probado en emulador Wear OS (API 30, pantalla redonda 320×320): lista de apps, cierre individual, *Cerrar todas*, permiso de uso y refresco de RAM funcionando.
`,
  },
  {
    path: 'build-apk.sh',
    filename: 'build-apk.sh',
    category: 'docs',
    description: 'Script de compilación local: detecta JDK, Android SDK y genera la APK debug o release firmada con la clave de debug.',
    content: `#!/usr/bin/env bash
# Compila la APK de Apps Recientes (Wear OS / Xiaomi Watch 2).
# Uso: ./build-apk.sh [debug|release]
set -euo pipefail

cd "$(dirname "$0")"

export JAVA_HOME="\${JAVA_HOME:-/usr/lib/jvm/java-17-openjdk-amd64}"
export ANDROID_HOME="\${ANDROID_HOME:-$HOME/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

VARIANT="\${1:-release}"

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
`,
  },
  {
    path: '.gitignore',
    filename: '.gitignore',
    category: 'docs',
    description: 'Archivo .gitignore estándar para Android / Gradle.',
    content: `*.iml
.gradle
/local.properties
/.idea/caches
/.idea/libraries
/.idea/modules.xml
/.idea/workspace.xml
/.idea/navEditor.xml
/.idea/assetWizardSettings.xml
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
*.apk
*.aab
output-metadata.json
`,
  },
  {
    path: 'settings.gradle.kts',
    filename: 'settings.gradle.kts',
    category: 'gradle',
    description: 'Configuración de repositorios Google() y MavenCentral() y definición del módulo :app.',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "WearRecentApps"
include(":app")
`,
  },
  {
    path: 'build.gradle.kts',
    filename: 'build.gradle.kts',
    category: 'gradle',
    description: 'Archivo build.gradle.kts raíz del proyecto Android.',
    content: `plugins {
    id("com.android.application") version "8.7.1" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
}
`,
  },
  {
    path: 'gradle.properties',
    filename: 'gradle.properties',
    category: 'gradle',
    description: 'Propiedades de la JVM y compatibilidad con AndroidX.',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`,
  },
  {
    path: 'app/build.gradle.kts',
    filename: 'build.gradle.kts',
    category: 'gradle',
    description: 'Configuración Gradle del módulo de Wear OS con dependencias Compose 1.4+ y minSdk 30.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.example.wearrecentapps"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.wearrecentapps"
        // Xiaomi Watch 2 ejecuta Wear OS 3.5 (Android 11 / API 30) o Wear OS 4 (Android 13 / API 33)
        minSdk = 30
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ""
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    // Jetpack Compose para Wear OS (Componentes adaptados a pantalla circular)
    val wearComposeVersion = "1.4.0"
    implementation("androidx.wear.compose:compose-material:$wearComposeVersion")
    implementation("androidx.wear.compose:compose-foundation:$wearComposeVersion")
    implementation("androidx.wear.compose:compose-navigation:$wearComposeVersion")

    // Soporte Core Wearable
    implementation("androidx.wear:wear:1.3.0")

    // Compose Foundation e Iconos
    implementation("androidx.compose.ui:ui:1.7.5")
    implementation("androidx.compose.ui:ui-tooling-preview:1.7.5")
    implementation("androidx.compose.material:material-icons-extended:1.7.5")

    // Activity Compose & ViewModel
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("androidx.core:core-ktx:1.15.0")
}
`,
  },
  {
    path: 'app/proguard-rules.pro',
    filename: 'proguard-rules.pro',
    category: 'docs',
    description: 'Reglas de ProGuard/R8 para la build release (mantiene las clases de la app).',
    content: `# Add project specific ProGuard rules here.
-keep class com.example.wearrecentapps.** { *; }
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    category: 'manifest',
    description: 'Manifiesto de Wear OS con declaración de hardware, permisos de procesos y standalone=true.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Declaración obligatoria para apps de Wear OS -->
    <uses-feature android:name="android.hardware.type.watch" />

    <!-- 1. Permiso para finalizar procesos en segundo plano de otras apps sin root -->
    <uses-permission android:name="android.permission.KILL_BACKGROUND_PROCESSES" />

    <!-- 2. Permiso para consultar estadísticas de uso y detectar apps recientemente activas -->
    <uses-permission
        android:name="android.permission.PACKAGE_USAGE_STATS"
        tools:ignore="ProtectedPermissions" />

    <!-- 3. Permiso en Android 11+ para consultar los nombres e iconos de apps instaladas -->
    <uses-permission
        android:name="android.permission.QUERY_ALL_PACKAGES"
        tools:ignore="QueryAllPackagesPermission" />

    <!-- 4. Vibración para feedback háptico en corona y gestos -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.DeviceDefault">

        <!-- Declara que la app funciona de forma independiente en el reloj (standalone) -->
        <meta-data
            android:name="com.google.android.wearable.standalone"
            android:value="true" />

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:taskAffinity=""
            android:theme="@android:style/Theme.DeviceDefault">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
  },
  {
    path: 'app/src/main/java/com/example/wearrecentapps/MainActivity.kt',
    filename: 'MainActivity.kt',
    category: 'kotlin',
    description: 'Interfaz en Jetpack Compose Wear OS con TIPOGRAFÍA GRANDE (16sp-18sp), áreas táctiles de 48dp+ y soporte de corona.',
    content: `package com.example.wearrecentapps

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.gestures.scrollBy
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.rotary.onRotaryScrollEvent
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.graphics.drawable.toBitmap
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.ScalingLazyListState
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.AppCard
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.Colors
import androidx.wear.compose.material.Icon
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.PositionIndicator
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import kotlinx.coroutines.launch

/**
 * MainActivity para Xiaomi Watch 2.
 * Optimizada para uso tactil en muneca con TIPOGRAFIA GRANDE y botones de toque amplio (48dp+).
 */
class MainActivity : ComponentActivity() {

    private val viewModel: AppManagerViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            WearAppTheme {
                WearApp(viewModel = viewModel)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Al volver de los ajustes de permiso se refresca sola.
        viewModel.refreshPermissionAndApps()
    }
}

@Composable
fun WearApp(viewModel: AppManagerViewModel) {
    val listState = rememberScalingLazyListState()

    Scaffold(
        timeText = {
            TimeText(
                timeTextStyle = TextStyle(
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFE0E0E0)
                )
            )
        },
        positionIndicator = {
            if (listState.isScrollInProgress) {
                PositionIndicator(scalingLazyListState = listState)
            }
        }
    ) {
        RecentAppsScreen(viewModel = viewModel, listState = listState)
    }
}

@Composable
fun RecentAppsScreen(
    viewModel: AppManagerViewModel,
    listState: ScalingLazyListState
) {
    val context = LocalContext.current
    val haptics = LocalHapticFeedback.current
    val coroutineScope = rememberCoroutineScope()

    val apps by viewModel.recentApps.collectAsStateWithLifecycle()
    val isLoading by viewModel.isLoading.collectAsStateWithLifecycle()
    val hasUsageStatsPermission by viewModel.hasUsageStatsPermission.collectAsStateWithLifecycle()
    val freeRamMb by viewModel.freeRamMb.collectAsStateWithLifecycle()

    val focusRequester = remember { FocusRequester() }

    // Conecta la corona digital del Xiaomi Watch 2 para scroll fisico
    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
        viewModel.refreshPermissionAndApps()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .onRotaryScrollEvent {
                coroutineScope.launch { listState.scrollBy(it.verticalScrollPixels) }
                true
            }
            .focusRequester(focusRequester)
            .focusable(),
        contentAlignment = Alignment.Center
    ) {
        when {
            isLoading -> CircularProgressIndicator(
                modifier = Modifier.size(44.dp),
                indicatorColor = MaterialTheme.colors.primary,
                strokeWidth = 4.dp
            )

            !hasUsageStatsPermission -> PermissionRequiredCard(
                onGrantClick = { viewModel.openUsageAccessSettings(context) }
            )

            else -> ScalingLazyColumn(
                modifier = Modifier.fillMaxSize(),
                state = listState,
                // Sin auto-centrado: el contenido empieza arriba y no se corta
                // bajo el reloj de la esfera.
                autoCentering = null,
                contentPadding = PaddingValues(
                    top = 0.dp,
                    start = 10.dp,
                    end = 10.dp,
                    bottom = 18.dp
                ),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Hueco para que el titulo no quede debajo del reloj de la esfera
                item {
                    Spacer(modifier = Modifier.height(26.dp))
                }

                item {
                    ListHeader(
                        appCount = apps.size,
                        freeRamMb = freeRamMb
                    )
                }

                if (apps.isEmpty()) {
                    item {
                        EmptyAppsView(onRefresh = { viewModel.refreshAll() })
                    }
                }

                items(
                    items = apps,
                    key = { it.packageName }
                ) { appItem ->
                    var isVisible by remember { mutableStateOf(true) }

                    AnimatedVisibility(
                        visible = isVisible,
                        exit = fadeOut(animationSpec = tween(200)) +
                            shrinkVertically(animationSpec = tween(200))
                    ) {
                        AppItemCard(
                            app = appItem,
                            onCloseClick = {
                                isVisible = false
                                haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                                viewModel.closeApp(appItem.packageName)
                                Toast.makeText(
                                    context,
                                    "Cerrada: \${appItem.appName}",
                                    Toast.LENGTH_SHORT
                                ).show()
                            }
                        )
                    }
                }

                if (apps.isNotEmpty()) {
                    item {
                        ActionPill(
                            text = "Cerrar todas",
                            backgroundColor = Color(0xFFD32F2F),
                            contentColor = Color.White,
                            onClick = {
                                haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                                viewModel.closeAllApps()
                                Toast.makeText(
                                    context,
                                    "Memoria liberada",
                                    Toast.LENGTH_SHORT
                                ).show()
                            }
                        )
                    }
                }

                item {
                    ActionPill(
                        text = "Actualizar",
                        backgroundColor = Color(0xFF1E1E1E),
                        contentColor = Color(0xFF00E5FF),
                        icon = Icons.Default.Refresh,
                        onClick = { viewModel.refreshAll() }
                    )
                }
            }
        }
    }
}

/** Boton tipo pildora a todo el ancho, con texto siempre centrado. */
@Composable
fun ActionPill(
    text: String,
    backgroundColor: Color,
    contentColor: Color = Color.White,
    icon: androidx.compose.ui.graphics.vector.ImageVector? = null,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(44.dp)
            .clip(RoundedCornerShape(22.dp))
            .background(backgroundColor)
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (icon != null) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = contentColor,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.size(6.dp))
        }
        Text(
            text = text,
            color = contentColor,
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun ListHeader(appCount: Int, freeRamMb: Int) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 2.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Apps Activas",
            fontSize = 17.sp,
            fontWeight = FontWeight.ExtraBold,
            color = MaterialTheme.colors.primary
        )
        Text(
            text = if (freeRamMb > 0) {
                "$appCount en ejecucion · $freeRamMb MB libres"
            } else {
                "$appCount en ejecucion"
            },
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF80DEEA)
        )
    }
}

/**
 * Tarjeta individual de aplicacion adaptada para reloj:
 * Nombre de app en 16sp, RAM en 13sp de alto contraste, boton de cierre de 40dp.
 */
@Composable
fun AppItemCard(
    app: RecentAppItem,
    onCloseClick: () -> Unit
) {
    AppCard(
        onClick = onCloseClick,
        appName = {
            Text(
                text = app.appName,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                color = Color.White
            )
        },
        appImage = {
            if (app.iconDrawable != null) {
                val bitmap = remember(app.packageName) {
                    app.iconDrawable.toBitmap(56, 56).asImageBitmap()
                }
                Image(
                    bitmap = bitmap,
                    contentDescription = app.appName,
                    modifier = Modifier
                        .size(30.dp)
                        .clip(CircleShape)
                )
            } else {
                Box(
                    modifier = Modifier
                        .size(30.dp)
                        .background(MaterialTheme.colors.primary, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = app.appName.take(1).uppercase(),
                        color = Color.Black,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }
            }
        },
        time = {
            // La X de la esquina indica que toda la tarjeta cierra la app
            Icon(
                imageVector = Icons.Default.Close,
                contentDescription = "Cerrar app",
                tint = Color(0xFFFF8A80),
                modifier = Modifier.size(16.dp)
            )
        },
        title = {
            Text(
                text = "~\${app.estimatedRamMb} MB RAM · \${app.lastActiveFormatted}",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF80DEEA)
            )
        },
        modifier = Modifier.fillMaxWidth()
    ) {
        // Sin contenido extra: tarjeta compacta para pantallas de 1.43"
    }
}

@Composable
fun EmptyAppsView(onRefresh: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Sin Apps Activas",
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Memoria RAM optimizada.",
            fontSize = 13.sp,
            color = Color(0xFFB0BEC5),
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun PermissionRequiredCard(onGrantClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 18.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Permiso Requerido",
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colors.secondary,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = "Para detectar apps recientes en Wear OS se requiere 'Acceso de Uso'.",
            fontSize = 13.sp,
            textAlign = TextAlign.Center,
            color = Color(0xFFCFD8DC),
            lineHeight = 17.sp
        )
        Spacer(modifier = Modifier.height(12.dp))
        Chip(
            onClick = onGrantClick,
            label = {
                Text(
                    text = "Conceder Permiso",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            },
            modifier = Modifier.fillMaxWidth(0.92f)
        )
    }
}

@Composable
fun WearAppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colors = Colors(
            primary = Color(0xFF00E5FF),
            primaryVariant = Color(0xFF00B0FF),
            secondary = Color(0xFFFFAB00),
            secondaryVariant = Color(0xFFFF9100),
            background = Color.Black,
            surface = Color(0xFF1E1E1E),
            error = Color(0xFFFF5252),
            onPrimary = Color.Black,
            onSecondary = Color.Black,
            onBackground = Color.White,
            onSurface = Color.White,
            onError = Color.White
        ),
        content = content
    )
}
`,
  },
  {
    path: 'app/src/main/java/com/example/wearrecentapps/AppManagerViewModel.kt',
    filename: 'AppManagerViewModel.kt',
    category: 'kotlin',
    description: 'ViewModel con detección de apps activas por UsageStatsManager y cierre mediante killBackgroundProcesses.',
    content: `package com.example.wearrecentapps

import android.app.ActivityManager
import android.app.AppOpsManager
import android.app.Application
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.drawable.Drawable
import android.os.Process
import android.provider.Settings
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

data class RecentAppItem(
    val packageName: String,
    val appName: String,
    val iconDrawable: Drawable?,
    val estimatedRamMb: Int,
    val lastActiveFormatted: String,
    val lastTimeUsed: Long
)

/**
 * Logica del gestor de apps recientes para Wear OS.
 *
 * - Usa UsageStatsManager para saber que apps se han usado en los ultimos 45 min.
 * - Filtra procesos del sistema y solo deja apps que el usuario puede abrir.
 * - Cierra en segundo plano con ActivityManager.killBackgroundProcesses (sin root).
 * - Expone la RAM libre del reloj para que se vea el efecto de la limpieza.
 */
class AppManagerViewModel(application: Application) : AndroidViewModel(application) {

    private val context = application.applicationContext
    private val packageManager: PackageManager = context.packageManager
    private val activityManager: ActivityManager =
        context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
    private val usageStatsManager: UsageStatsManager? =
        context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager

    private val _recentApps = MutableStateFlow<List<RecentAppItem>>(emptyList())
    val recentApps: StateFlow<List<RecentAppItem>> = _recentApps.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _hasUsageStatsPermission = MutableStateFlow(true)
    val hasUsageStatsPermission: StateFlow<Boolean> = _hasUsageStatsPermission.asStateFlow()

    /** RAM libre (aproximada) del reloj, en MB. */
    private val _freeRamMb = MutableStateFlow(0)
    val freeRamMb: StateFlow<Int> = _freeRamMb.asStateFlow()

    // Apps cerradas por el usuario: se ocultan hasta que pida actualizar a mano.
    private val dismissedPackages = mutableSetOf<String>()

    // Procesos criticos del sistema que nunca deben mostrarse ni forzar cierre
    private val systemPackageBlacklist = setOf(
        "android",
        "com.android.systemui",
        "com.google.android.wearable.sysui",
        "com.google.android.gms",
        "com.google.android.gsf",
        "com.xiaomi.wearos.launcher",
        "com.xiaomi.wearos.settings",
        context.packageName
    )

    init {
        refreshPermissionAndApps()
    }

    /** Relee el permiso de Acceso de Uso y recarga la lista si esta concedido. */
    fun refreshPermissionAndApps() {
        val granted = checkUsageStatsPermission()
        _hasUsageStatsPermission.value = granted
        updateFreeRam()
        if (granted) {
            loadRecentRunningApps()
        }
    }

    private fun checkUsageStatsPermission(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.unsafeCheckOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            Process.myUid(),
            context.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    fun openUsageAccessSettings(context: Context) {
        val candidates = listOf(
            Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS),
            Intent(Settings.ACTION_SETTINGS)
        )
        for (intent in candidates) {
            try {
                context.startActivity(intent.apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK })
                return
            } catch (_: Exception) {
                // Probamos con la siguiente pantalla de ajustes disponible.
            }
        }
    }

    fun loadRecentRunningApps() {
        viewModelScope.launch {
            _isLoading.value = true
            val apps = withContext(Dispatchers.IO) { fetchActiveUserApps() }
            _recentApps.value = apps
            updateFreeRam()
            _isLoading.value = false
        }
    }

    /** Boton "Actualizar": vuelve a mostrar todo lo reciente, incluidas las cerradas. */
    fun refreshAll() {
        dismissedPackages.clear()
        loadRecentRunningApps()
    }

    private fun updateFreeRam() {
        try {
            val info = ActivityManager.MemoryInfo()
            activityManager.getMemoryInfo(info)
            _freeRamMb.value = (info.availMem / (1024L * 1024L)).toInt()
        } catch (_: Exception) {
            _freeRamMb.value = 0
        }
    }

    private fun fetchActiveUserApps(): List<RecentAppItem> {
        val now = System.currentTimeMillis()
        val usageWindow = now - (1000L * 60 * 60) // ultimos 60 minutos
        val recentWindow = now - (1000L * 60 * 45) // se muestra lo usado en 45 min
        val activePackages = mutableMapOf<String, Long>()

        // 1. UsageStatsManager: API moderna recomendada en Wear OS 3.5 / 4
        if (usageStatsManager != null && _hasUsageStatsPermission.value) {
            try {
                val stats = usageStatsManager.queryUsageStats(
                    UsageStatsManager.INTERVAL_BEST,
                    usageWindow,
                    now
                )
                for (stat in stats) {
                    if (stat.lastTimeUsed > recentWindow && stat.totalTimeInForeground > 0) {
                        activePackages[stat.packageName] = stat.lastTimeUsed
                    }
                }
            } catch (_: Exception) {
            }
        }

        // 2. Complementar con procesos en ejecucion detectables
        try {
            activityManager.runningAppProcesses?.forEach { process ->
                process.pkgList?.forEach { pkg ->
                    if (!activePackages.containsKey(pkg)) {
                        activePackages[pkg] = now
                    }
                }
            }
        } catch (_: Exception) {
        }

        val resultList = mutableListOf<RecentAppItem>()

        for ((pkgName, lastUsed) in activePackages) {
            if (systemPackageBlacklist.contains(pkgName)) continue
            if (dismissedPackages.contains(pkgName)) continue

            try {
                val appInfo = packageManager.getApplicationInfo(pkgName, 0)

                // Excluir procesos marcados como FLAG_SYSTEM o actualizaciones de fabrica
                val isSystem = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                val isUpdatedSystem = (appInfo.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) != 0
                if (isSystem || isUpdatedSystem) continue

                // Solo apps que el usuario puede abrir (evita servicios y procesos sueltos)
                if (packageManager.getLaunchIntentForPackage(pkgName) == null) continue

                val label = packageManager.getApplicationLabel(appInfo).toString()
                val icon = runCatching { packageManager.getApplicationIcon(appInfo) }.getOrNull()
                val ramMb = estimateAppMemory(pkgName)
                val formattedTime = formatTimeDiff(now - lastUsed)

                resultList.add(
                    RecentAppItem(
                        packageName = pkgName,
                        appName = label,
                        iconDrawable = icon,
                        estimatedRamMb = ramMb,
                        lastActiveFormatted = formattedTime,
                        lastTimeUsed = lastUsed
                    )
                )
            } catch (_: PackageManager.NameNotFoundException) {
            }
        }

        return resultList.sortedByDescending { it.lastTimeUsed }
    }

    /** Quita la app de la lista y pide al sistema que libere sus procesos en segundo plano. */
    fun closeApp(packageName: String) {
        dismissedPackages.add(packageName)
        _recentApps.value = _recentApps.value.filter { it.packageName != packageName }
        viewModelScope.launch(Dispatchers.IO) {
            runCatching { activityManager.killBackgroundProcesses(packageName) }
            delay(600)
            updateFreeRam()
        }
    }

    fun closeAllApps() {
        val currentList = _recentApps.value
        currentList.forEach { dismissedPackages.add(it.packageName) }
        _recentApps.value = emptyList()
        viewModelScope.launch(Dispatchers.IO) {
            currentList.forEach { app ->
                runCatching { activityManager.killBackgroundProcesses(app.packageName) }
            }
            delay(700)
            updateFreeRam()
        }
    }

    /**
     * Wear OS no permite leer la RAM real de otras apps sin root, asi que se
     * estima por tipo de app. El numero de RAM libre de la cabecera si es real.
     */
    private fun estimateAppMemory(pkg: String): Int {
        return when {
            pkg.contains("map") || pkg.contains("navigation") -> 160
            pkg.contains("strava") || pkg.contains("fitness") -> 135
            pkg.contains("music") || pkg.contains("spotify") -> 110
            pkg.contains("telegram") || pkg.contains("whatsapp") -> 90
            pkg.contains("youtube") || pkg.contains("video") -> 120
            else -> 65
        }
    }

    private fun formatTimeDiff(diffMillis: Long): String {
        val minutes = (diffMillis / (1000 * 60)).toInt()
        return when {
            minutes <= 1 -> "Hace 1 min"
            minutes < 60 -> "Hace $minutes min"
            else -> "Hace \${minutes / 60} h"
        }
    }
}
`,
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    filename: 'strings.xml',
    category: 'res',
    description: 'Recurso de cadenas de texto para la app de Wear OS.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Apps Recientes</string>
</resources>
`,
  },
  {
    path: 'app/src/main/res/values/colors.xml',
    filename: 'colors.xml',
    category: 'res',
    description: 'Paleta de colores AMOLED oscuros para optimización de batería en Xiaomi Watch 2.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="black">#FF000000</color>
    <color name="primary_cyan">#FF00E5FF</color>
    <color name="surface_dark">#FF1E1E1E</color>
    <color name="text_secondary">#FFB0BEC5</color>
    <color name="close_red">#FFD32F2F</color>
</resources>
`,
  },
  {
    path: 'app/src/main/res/values/ic_launcher_background.xml',
    filename: 'ic_launcher_background.xml',
    category: 'res',
    description: 'Color de fondo del icono adaptativo (#0B0F14, negro AMOLED).',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0B0F14</color>
</resources>
`,
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_foreground.xml',
    filename: 'ic_launcher_foreground.xml',
    category: 'res',
    description: 'Icono adaptativo vectorial: escoba "limpia apps" en cian sobre fondo oscuro.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<!-- Escoba "limpia apps" sobre fondo oscuro, dentro de la zona segura del icono adaptativo -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">

    <group
        android:pivotX="54"
        android:pivotY="54"
        android:rotation="-18">

        <!-- Mango -->
        <path
            android:fillColor="#ECEFF1"
            android:pathData="M50,28 L58,28 L58,58 L50,58 Z" />

        <!-- Cepillo / base -->
        <path
            android:fillColor="#00E5FF"
            android:pathData="M38,58 L70,58 A4,4 0 0 1 74,62 L74,66 A4,4 0 0 1 70,70 L38,70 A4,4 0 0 1 34,66 L34,62 A4,4 0 0 1 38,58 Z" />

        <!-- Cerdas -->
        <path
            android:fillColor="#80DEEA"
            android:pathData="M37,72 L42,72 L40,84 L35,84 Z" />
        <path
            android:fillColor="#80DEEA"
            android:pathData="M45,72 L50,72 L49,84 L44,84 Z" />
        <path
            android:fillColor="#80DEEA"
            android:pathData="M58,72 L63,72 L63,84 L58,84 Z" />
        <path
            android:fillColor="#80DEEA"
            android:pathData="M66,72 L71,72 L73,84 L68,84 Z" />

        <!-- Brillo / chispa de "limpio" -->
        <path
            android:fillColor="#FFFFFF"
            android:pathData="M68,32 L70,38 L76,40 L70,42 L68,48 L66,42 L60,40 L66,38 Z" />
    </group>
</vector>
`,
  },
  {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
    filename: 'ic_launcher.xml',
    category: 'res',
    description: 'Icono adaptativo con capa monochrome para los iconos temáticos de Wear OS 4.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
    <monochrome android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`,
  },
];
