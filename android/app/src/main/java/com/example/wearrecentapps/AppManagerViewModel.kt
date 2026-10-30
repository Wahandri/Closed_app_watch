package com.example.wearrecentapps

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
            else -> "Hace ${minutes / 60} h"
        }
    }
}
