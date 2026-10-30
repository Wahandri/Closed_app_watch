# Apps Recientes · Wear OS (Xiaomi Watch 2)

Gestor de aplicaciones recientes y liberador de memoria para **Xiaomi Watch 2** (Snapdragon W5+ Gen 1, Wear OS 3.5 / 4) y cualquier reloj circular con Wear OS 3 o superior.

Interfaz **Jetpack Compose for Wear OS** con tipografía grande, tarjetas compactas y botones de tipo píldora pensados para una pantalla de 1.43".

---

## Características

- **Diseño circular**: `ScalingLazyColumn` sin auto-centrado, cabecera fija bajo el reloj y tarjetas que no se cortan en los bordes.
- **Tipografía grande**: títulos de 15sp–17sp, secundarios de 12sp, alto contraste sobre negro AMOLED.
- **Corona giratoria**: `onRotaryScrollEvent` para desplazar la lista con la corona del reloj.
- **Lista real de apps recientes**: `UsageStatsManager` (últimos 45 min) + `ActivityManager.runningAppProcesses`, filtrando paquetes del sistema y apps sin lanzador.
- **RAM libre real** del reloj en la cabecera (`ActivityManager.MemoryInfo`), que se actualiza al limpiar.
- **Cierre sin root**: `ActivityManager.killBackgroundProcesses()` + lista de descartadas para que la app cerrada no reaparezca hasta pulsar *Actualizar*.
- **Feedback háptico** al cerrar una app o pulsar *Cerrar todas*.
- **Icono adaptativo** propio (escoba) con capa *monochrome* para Wear OS 4.
- **APK de ~2 MB** en release (R8 + sin recursos innecesarios).

> La RAM por app es una **estimación** (`~65 MB`): Android no permite leer el PSS de otras apps sin root. El dato de RAM libre de la cabecera sí es real.

---

## Estructura

```
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
```

---

## Compilar la APK

### En GitHub (sin instalar nada)

1. Sube el proyecto al repositorio.
2. Abre la pestaña **Actions** → workflow **Build Wear OS APK**.
3. Descarga el artifact `apps-recientes-debug` o `apps-recientes-release`.

El workflow instala Gradle 8.13, compila `assembleDebug` y `assembleRelease` y sube ambas APKs.

### En local

```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/android-sdk
./gradlew assembleDebug     # app/build/outputs/apk/debug/app-debug.apk
./gradlew assembleRelease   # app/build/outputs/apk/release/app-release.apk (firmada con debug)
```

Si el ZIP no incluye `gradle-wrapper.jar`, ejecuta una vez `gradle wrapper` (o usa `gradle assembleDebug` directamente).

---

## Instalar en el reloj (ADB por Wi-Fi)

1. En el reloj: **Ajustes → Sistema → Información** y pulsa **7 veces** en *Número de compilación*.
2. **Ajustes → Opciones de desarrollador**: activa *Depuración ADB* y *Depuración inalámbrica*.
3. En el PC:

```bash
adb pair 192.168.1.XX:PUERTO   # código de 6 dígitos que muestra el reloj
adb connect 192.168.1.XX:5555
adb install -r apps-recientes-watch.apk
```

4. Abre **Apps Recientes** en el reloj y concede **Acceso de uso** cuando lo pida. Si el menú no aparece en Wear OS, fuérzalo por ADB:

```bash
adb shell appops set com.example.wearrecentapps GET_USAGE_STATS allow
```

---

## Permisos

| Permiso | Uso |
| --- | --- |
| `KILL_BACKGROUND_PROCESSES` | Cerrar procesos en segundo plano sin root |
| `PACKAGE_USAGE_STATS` | Detectar apps usadas recientemente (se concede a mano) |
| `QUERY_ALL_PACKAGES` | Leer nombre e icono de las apps instaladas |
| `VIBRATE` | Feedback háptico al cerrar |

---

## Estado

Compilado y probado en emulador Wear OS (API 30, pantalla redonda 320×320): lista de apps, cierre individual, *Cerrar todas*, permiso de uso y refresco de RAM funcionando.
