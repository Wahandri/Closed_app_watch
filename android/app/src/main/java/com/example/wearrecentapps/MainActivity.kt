package com.example.wearrecentapps

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
                                    "Cerrada: ${appItem.appName}",
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
                text = "~${app.estimatedRamMb} MB RAM · ${app.lastActiveFormatted}",
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
