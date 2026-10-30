# Apps Recientes · Xiaomi Watch 2 (Wear OS)

Gestor de apps recientes y liberador de RAM para **Xiaomi Watch 2** (Wear OS 3.5 / 4), escrito en **Kotlin + Jetpack Compose for Wear OS**.

El repositorio tiene dos partes:

| Carpeta | Qué es |
| --- | --- |
| [`android/`](./android) | Proyecto Android real: código Kotlin, Gradle, iconos y workflow de compilación. |
| `src/` + `index.html` | Web de presentación (React + Vite) con el visor del código y descarga del ZIP del proyecto. |

## APK lista para instalar

Descarga [`apps-recientes-watch.apk`](https://github.com/Wahandri/Closed_app_watch/releases/latest/download/apps-recientes-watch.apk) (v1.0.0, ~2 MB, Android 11+).

```bash
adb pair IP_DEL_RELOJ:PUERTO
adb connect IP_DEL_RELOJ:5555
adb install -r apps-recientes-watch.apk
adb shell appops set com.example.wearrecentapps GET_USAGE_STATS allow   # permiso de uso
```

Instrucciones completas en [`android/README.md`](./android/README.md).

## Compilar

```bash
# Android (debug o release firmada con la clave de debug)
cd android
./build-apk.sh release

# Web de presentación
npm install
npm run build
```

La CI de GitHub Actions compila `debug` y `release` en cada push que toque `android/`.

## Licencia

Uso personal. El proyecto se generó originalmente en Google AI Studio y se completó/verificó aquí.
