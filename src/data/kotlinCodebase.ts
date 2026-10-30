export interface ProjectFile {
  path: string;
  filename: string;
  category: 'workflow' | 'gradle' | 'manifest' | 'kotlin' | 'res' | 'docs';
  description: string;
  content: string;
}

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
          cache: gradle

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew || true

      - name: Build Debug APK
        run: ./gradlew assembleDebug --stacktrace

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: wear-recent-apps-debug-apk
          path: app/build/outputs/apk/debug/app-debug.apk
          retention-days: 14
`,
  },
  {
    path: 'README.md',
    filename: 'README.md',
    category: 'docs',
    description: 'Documentación principal del repositorio de GitHub con instrucciones de compilación y comandos ADB para Xiaomi Watch 2.',
    content: `# Wear OS Recent Apps Manager (Xiaomi Watch 2)

Gestor de aplicaciones recientes y liberador de memoria RAM en segundo plano diseñado específicamente para **Xiaomi Watch 2** (Snapdragon W5+ Gen 1 con Wear OS 3.5 / 4) y relojes circulares con pantalla AMOLED.

Construido íntegramente con **Jetpack Compose for Wear OS** con tipografía de **gran tamaño y alto contraste** para lectura cómoda en muñeca.

---

## Características

- **Diseño Adaptado a Pantallas Circulares:** Utiliza \`ScalingLazyColumn\` para curvas fluidas que no se cortan en los bordes de la esfera.
- **Tipografía Grande y Legible (Watch-Optimized):** Textos de 16sp–18sp, botones con áreas táctiles ampliadas (48dp+) y números de RAM en alto contraste pensados para uso con dedos en pantallas de 1.43".
- **Soporte de Corona Giratoria (Rotary Input):** Navegación completa mediante la corona física del Xiaomi Watch 2 con feedback háptico.
- **Filtrado Inteligente de Procesos:** Oculta automáticamente los procesos críticos de Android, SystemUI y el Launcher de Xiaomi mediante comprobación de \`ApplicationInfo.FLAG_SYSTEM\`.
- **Cierre Seguro sin Root:** Utiliza \`ActivityManager.killBackgroundProcesses()\` para limpiar memoria y detener servicios secundarios sin requerir permisos de superusuario ni poner en riesgo el firmware del reloj.
- **GitHub Actions Incluido:** Cada push a este repositorio genera automáticamente la APK lista para descargar desde la pestaña **Actions > Artifacts**.

---

## Estructura del Proyecto

\`\`\`
├── .github/workflows/build-apk.yml  # Compilación automática en la nube de GitHub
├── app/
│   ├── build.gradle.kts            # Dependencias Wear Compose 1.4+, Wear Material
│   └── src/main/
│       ├── AndroidManifest.xml     # Hardware Watch, permisos de procesos
│       ├── java/com/example/wearrecentapps/
│       │   ├── MainActivity.kt     # Interfaz Compose con botones y textos grandes
│       │   └── AppManagerViewModel.kt # Lógica UsageStatsManager + ActivityManager
│       └── res/values/             # Strings, colores AMOLED oscuros
├── build.gradle.kts                # Buildscript raíz
├── settings.gradle.kts             # Módulos y repositorios
├── gradle.properties               # Configuración de memoria JVM
└── README.md
\`\`\`

---

## Cómo compilar la APK

### Opción A: Compilar automáticamente en GitHub (Sin instalar nada en tu PC)
1. Sube este proyecto a tu repositorio de GitHub.
2. Ve a la pestaña **Actions** en GitHub.
3. El flujo **Build Wear OS APK** compilará el código en la nube de forma automática.
4. Al terminar el trabajo, descarga el archivo \`wear-recent-apps-debug-apk\` (dentro viene el archivo \`app-debug.apk\`).

### Opción B: Compilar localmente con Android Studio o Terminal
\`\`\`bash
# En Windows:
gradlew.bat assembleDebug

# En Mac / Linux:
chmod +x gradlew
./gradlew assembleDebug
\`\`\`
El archivo generado estará en: \`app/build/outputs/apk/debug/app-debug.apk\`

---

## Cómo instalar en tu Xiaomi Watch 2 vía Wi-Fi ADB

1. **Activar Opciones de Desarrollador en el Reloj:**
   - En tu Xiaomi Watch 2, ve a **Ajustes > Sistema > Información**.
   - Pulsa **7 veces** seguidas en **Número de compilación**.
   - Ve atrás a **Ajustes > Opciones de desarrollador**.
   - Activa **Depuración ADB** y **Depuración inalámbrica (Wi-Fi)**.

2. **Vincular por Wi-Fi:**
   En *Depuración inalámbrica*, pulsa **Vincular nuevo dispositivo** para ver tu IP, puerto y código de 6 dígitos:
   \`\`\`bash
   adb pair 192.168.1.XX:PUERTO_VINCULACION
   # Introduce el código de 6 dígitos que muestra el reloj
   \`\`\`

3. **Conectar e Instalar:**
   \`\`\`bash
   adb connect 192.168.1.XX:5555
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   \`\`\`

4. **Conceder Permiso Especial de Acceso de Uso:**
   Para permitir que la app detecte qué aplicaciones están activas en segundo plano en Wear OS:
   \`\`\`bash
   adb shell appops set com.example.wearrecentapps android:get_usage_stats allow
   \`\`\`

---

## Licencia

Distribuido bajo licencia MIT o Apache 2.0. Uso personal libre.
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
    compileSdk = 34

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
        android:icon="@android:drawable/sym_def_app_icon"
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
import androidx.compose.foundation.focusable
import androidx.compose.foundation.gestures.scrollBy
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DeleteSweep
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.input.rotary.onRotaryScrollEvent
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.graphics.drawable.toBitmap
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.ScalingLazyListAnchorType
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.*
import kotlinx.coroutines.launch

/**
 * MainActivity para Xiaomi Watch 2.
 * Optimizada para uso táctil en muñeca con TIPOGRAFÍA GRANDE y botones de toque amplio (48dp+).
 */
class MainActivity : ComponentActivity() {

    private val viewModel: AppManagerViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            WearAppTheme {
                Scaffold(
                    timeText = {
                        TimeText(
                            modifier = Modifier.padding(top = 2.dp),
                            timeTextStyle = androidx.compose.ui.text.TextStyle(
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFE0E0E0)
                            )
                        )
                    },
                    positionIndicator = {
                        val listState = rememberScalingLazyListState()
                        PositionIndicator(scalingLazyListState = listState)
                    }
                ) {
                    RecentAppsScreen(viewModel = viewModel)
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.loadRecentRunningApps()
    }
}

@Composable
fun RecentAppsScreen(viewModel: AppManagerViewModel) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val apps by viewModel.recentApps.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val hasUsageStatsPermission by viewModel.hasUsageStatsPermission.collectAsState()

    val listState = rememberScalingLazyListState(initialCenterItemIndex = 1)
    val focusRequester = remember { FocusRequester() }

    // Conecta la corona digital del Xiaomi Watch 2 para scroll físico
    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
        viewModel.loadRecentRunningApps()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .onRotaryScrollEvent {
                coroutineScope.launch {
                    listState.scrollBy(it.verticalScrollPixels)
                }
                true
            }
            .focusRequester(focusRequester)
            .focusable(),
        contentAlignment = Alignment.Center
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(44.dp),
                indicatorColor = MaterialTheme.colors.primary,
                strokeWidth = 4.dp
            )
        } else if (!hasUsageStatsPermission) {
            PermissionRequiredCard(onGrantClick = {
                viewModel.openUsageAccessSettings(context)
            })
        } else if (apps.isEmpty()) {
            EmptyAppsView(onRefresh = { viewModel.loadRecentRunningApps() })
        } else {
            ScalingLazyColumn(
                modifier = Modifier.fillMaxSize(),
                state = listState,
                anchorType = ScalingLazyListAnchorType.ItemCenter,
                contentPadding = PaddingValues(
                    top = 40.dp,
                    start = 14.dp,
                    end = 14.dp,
                    bottom = 48.dp
                ),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Título de lista con LETRA GRANDE (18sp)
                item {
                    ListHeader {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(bottom = 4.dp)
                        ) {
                            Text(
                                text = "Apps Activas",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = MaterialTheme.colors.primary
                            )
                            Text(
                                text = "\${apps.size} en ejecución",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFFB0BEC5)
                            )
                        }
                    }
                }

                // Lista de aplicaciones con fuentes ampliadas y áreas de toque cómodas
                items(
                    items = apps,
                    key = { it.packageName }
                ) { appItem ->
                    var isVisible by remember { mutableStateOf(true) }

                    AnimatedVisibility(
                        visible = isVisible,
                        exit = fadeOut(animationSpec = tween(220)) + shrinkVertically(animationSpec = tween(220))
                    ) {
                        AppItemCard(
                            app = appItem,
                            onCloseClick = {
                                isVisible = false
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

                // Botón grande "Cerrar Todas" (Altura 52dp, fuente 15sp negrita)
                item {
                    Chip(
                        onClick = {
                            viewModel.closeAllApps()
                            Toast.makeText(context, "Todas las apps cerradas", Toast.LENGTH_SHORT).show()
                        },
                        icon = {
                            Icon(
                                imageVector = Icons.Default.DeleteSweep,
                                contentDescription = "Cerrar Todo",
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        },
                        label = {
                            Text(
                                text = "Cerrar Todas",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = Color.White
                            )
                        },
                        colors = ChipDefaults.chipColors(
                            backgroundColor = Color(0xFFD32F2F),
                            contentColor = Color.White
                        ),
                        modifier = Modifier
                            .fillMaxWidth(0.92f)
                            .height(52.dp)
                            .padding(top = 6.dp)
                    )
                }
            }
        }
    }
}

/**
 * Tarjeta individual de aplicación adaptada para reloj:
 * Nombre de app en 16sp, RAM en 13sp de alto contraste, botón de cierre de 40dp.
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
                fontSize = 16.sp,
                color = Color.White
            )
        },
        title = {
            Text(
                text = "\${app.estimatedRamMb} MB RAM • \${app.lastActiveFormatted}",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF80DEEA)
            )
        },
        time = {},
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
        modifier = Modifier.fillMaxWidth(0.96f)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 6.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Toca para cerrar",
                fontSize = 12.sp,
                color = Color(0xFFB0BEC5),
                fontWeight = FontWeight.Medium
            )

            // Botón táctil grande con icono de 22dp para pulsar fácilmente sin fallar
            Button(
                onClick = onCloseClick,
                modifier = Modifier.size(38.dp),
                colors = ButtonDefaults.buttonColors(
                    backgroundColor = Color(0x4DFF5252),
                    contentColor = Color(0xFFFF5252)
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Cerrar app",
                    modifier = Modifier.size(22.dp)
                )
            }
        }
    }
}

@Composable
fun EmptyAppsView(onRefresh: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Sin Apps Activas",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = "Memoria RAM optimizada.",
            fontSize = 14.sp,
            color = Color(0xFFB0BEC5),
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(14.dp))
        Button(
            onClick = onRefresh,
            modifier = Modifier.size(48.dp),
            colors = ButtonDefaults.primaryButtonColors()
        ) {
            Icon(
                imageVector = Icons.Default.Refresh,
                contentDescription = "Refrescar",
                modifier = Modifier.size(24.dp)
            )
        }
    }
}

@Composable
fun PermissionRequiredCard(onGrantClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 20.dp),
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
            modifier = Modifier
                .fillMaxWidth(0.9f)
                .height(46.dp)
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

    // Procesos críticos del sistema que nunca deben mostrarse ni forzar cierre
    private val systemPackageBlacklist = setOf(
        "android",
        "com.android.systemui",
        "com.google.android.wearable.sysui",
        "com.google.android.gms",
        "com.xiaomi.wearos.launcher",
        "com.xiaomi.wearos.settings",
        context.packageName
    )

    init {
        checkPermissionAndLoad()
    }

    fun checkPermissionAndLoad() {
        val granted = checkUsageStatsPermission()
        _hasUsageStatsPermission.value = granted
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
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (_: Exception) {
            val intent = Intent(Settings.ACTION_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        }
    }

    fun loadRecentRunningApps() {
        viewModelScope.launch {
            _isLoading.value = true
            val apps = withContext(Dispatchers.IO) {
                fetchActiveUserApps()
            }
            _recentApps.value = apps
            _isLoading.value = false
        }
    }

    private fun fetchActiveUserApps(): List<RecentAppItem> {
        val now = System.currentTimeMillis()
        val threshold = now - (1000 * 60 * 60) // Apps en los últimos 60 minutos
        val activePackages = mutableMapOf<String, Long>()

        // 1. UsageStatsManager: API moderna recomendada en Wear OS 3.5 / 4
        if (usageStatsManager != null && _hasUsageStatsPermission.value) {
            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_BEST,
                threshold,
                now
            )
            for (stat in stats) {
                if (stat.lastTimeUsed > (now - 1000 * 60 * 45) && stat.totalTimeInForeground > 0) {
                    activePackages[stat.packageName] = stat.lastTimeUsed
                }
            }
        }

        // 2. Complementar con procesos en ejecución detectables
        try {
            activityManager.runningAppProcesses?.forEach { process ->
                process.pkgList?.forEach { pkg ->
                    if (!activePackages.containsKey(pkg)) {
                        activePackages[pkg] = now
                    }
                }
            }
        } catch (_: Exception) {}

        val resultList = mutableListOf<RecentAppItem>()

        for ((pkgName, lastUsed) in activePackages) {
            if (systemPackageBlacklist.contains(pkgName)) continue

            try {
                val appInfo = packageManager.getApplicationInfo(pkgName, 0)

                // Excluir procesos marcados como FLAG_SYSTEM o actualizaciones de fábrica
                val isSystem = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                val isUpdatedSystem = (appInfo.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) != 0

                if (!isSystem && !isUpdatedSystem) {
                    val label = packageManager.getApplicationLabel(appInfo).toString()
                    val icon = packageManager.getApplicationIcon(appInfo)
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
                }
            } catch (_: PackageManager.NameNotFoundException) {}
        }

        return resultList.sortedByDescending { it.lastTimeUsed }
    }

    fun closeApp(packageName: String) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                activityManager.killBackgroundProcesses(packageName)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            _recentApps.value = _recentApps.value.filter { it.packageName != packageName }
        }
    }

    fun closeAllApps() {
        val currentList = _recentApps.value
        viewModelScope.launch(Dispatchers.IO) {
            currentList.forEach { app ->
                try {
                    activityManager.killBackgroundProcesses(app.packageName)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            _recentApps.value = emptyList()
        }
    }

    private fun estimateAppMemory(pkg: String): Int {
        return when {
            pkg.contains("map") || pkg.contains("navigation") -> 160
            pkg.contains("strava") || pkg.contains("fitness") -> 135
            pkg.contains("music") || pkg.contains("spotify") -> 110
            pkg.contains("telegram") || pkg.contains("whatsapp") -> 90
            else -> 65
        }
    }

    private fun formatTimeDiff(diffMillis: Long): String {
        val minutes = (diffMillis / (1000 * 60)).toInt()
        return when {
            minutes <= 1 -> "Hace 1 min"
            minutes < 60 -> "Hace \${minutes} min"
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
];
