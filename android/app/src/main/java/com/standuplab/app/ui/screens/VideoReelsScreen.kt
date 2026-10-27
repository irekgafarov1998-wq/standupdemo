package com.standuplab.app.ui.screens

import android.content.ContentValues
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.SaveAlt
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.net.toUri
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.transformer.Composition
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.ExportException
import androidx.media3.transformer.ExportResult
import androidx.media3.transformer.Transformer
import androidx.media3.ui.PlayerView
import androidx.navigation.NavController
import com.standuplab.app.data.DemoCreationLimit
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.util.concurrent.Executors

@OptIn(ExperimentalMaterial3Api::class, UnstableApi::class)
@Composable
fun VideoReelsScreen(
    navController: NavController,
    videoUri: Uri?,
    onVideoSelected: (Uri) -> Unit
) {
    val context = LocalContext.current
    var durationMs by remember { mutableLongStateOf(0L) }
    var startTrimSec by remember { mutableFloatStateOf(0f) }
    var endTrimSec by remember { mutableFloatStateOf(1f) }
    var isExporting by remember { mutableStateOf(false) }
    var statusMessage by remember { mutableStateOf<String?>(null) }

    val pickerLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        if (uri != null) {
            statusMessage = null
            onVideoSelected(uri)
        }
    }

    val player = remember(videoUri) {
        videoUri?.let { uri ->
            ExoPlayer.Builder(context).build().apply {
                setMediaItem(MediaItem.fromUri(uri))
                prepare()
                playWhenReady = false
            }
        }
    }

    DisposableEffect(player) {
        onDispose { player?.release() }
    }

    LaunchedEffect(videoUri) {
        durationMs = 0L
        startTrimSec = 0f
        endTrimSec = 1f
        statusMessage = null
        val uri = videoUri ?: return@LaunchedEffect
        val probedDuration = withContext(Dispatchers.IO) {
            runCatching {
                val retriever = android.media.MediaMetadataRetriever()
                try {
                    retriever.setDataSource(context, uri)
                    retriever.extractMetadata(android.media.MediaMetadataRetriever.METADATA_KEY_DURATION)
                        ?.toLongOrNull() ?: 0L
                } finally {
                    retriever.release()
                }
            }.getOrDefault(0L)
        }
        durationMs = probedDuration.coerceAtLeast(1000L)
        startTrimSec = 0f
        endTrimSec = (durationMs / 1000f).coerceAtLeast(1f)
    }

    val totalSeconds = (durationMs / 1000f).coerceAtLeast(1f)

    fun exportClip() {
        val sourceUri = videoUri
        if (sourceUri == null) {
            statusMessage = "Сначала выбери видео."
            return
        }
        if (DemoCreationLimit.isLimitReached(context)) {
            statusMessage = "Демо-лимит исчерпан: можно создать не больше 5 видео/клипов суммарно."
            return
        }
        val startMs = (startTrimSec * 1000f).toLong().coerceAtLeast(0L)
        val endMs = (endTrimSec * 1000f).toLong().coerceAtMost(durationMs)
        if (endMs <= startMs + 250L) {
            statusMessage = "Выбери отрезок длиной больше 0,25 секунды."
            return
        }

        val temporaryFile = File(context.cacheDir, "standuplab_trim_${System.currentTimeMillis()}.mp4")
        val inputItem = MediaItem.Builder()
            .setUri(sourceUri)
            .setClippingConfiguration(
                MediaItem.ClippingConfiguration.Builder()
                    .setStartPositionMs(startMs)
                    .setEndPositionMs(endMs)
                    .build()
            )
            .build()
        val editedItem = EditedMediaItem.Builder(inputItem).build()
        val mainHandler = Handler(Looper.getMainLooper())

        val transformer = Transformer.Builder(context)
            .addListener(object : Transformer.Listener {
                override fun onCompleted(composition: Composition, exportResult: ExportResult) {
                    val executor = Executors.newSingleThreadExecutor()
                    executor.execute {
                        val savedUri = runCatching {
                            val values = ContentValues().apply {
                                put(
                                    MediaStore.Video.Media.DISPLAY_NAME,
                                    "StandupLab_Reel_${System.currentTimeMillis()}.mp4"
                                )
                                put(MediaStore.Video.Media.MIME_TYPE, "video/mp4")
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                                    put(
                                        MediaStore.Video.Media.RELATIVE_PATH,
                                        "${Environment.DIRECTORY_MOVIES}/StandupLab"
                                    )
                                    put(MediaStore.Video.Media.IS_PENDING, 1)
                                }
                            }
                            val destination = context.contentResolver.insert(
                                MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
                                values
                            ) ?: error("Не удалось создать файл в галерее")
                            try {
                                val output = context.contentResolver.openOutputStream(destination)
                                    ?: error("Не удалось открыть файл для записи")
                                output.use { stream ->
                                    temporaryFile.inputStream().use { input -> input.copyTo(stream) }
                                }
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                                    context.contentResolver.update(
                                        destination,
                                        ContentValues().apply { put(MediaStore.Video.Media.IS_PENDING, 0) },
                                        null,
                                        null
                                    )
                                }
                                destination
                            } catch (error: Exception) {
                                context.contentResolver.delete(destination, null, null)
                                throw error
                            }
                        }
                        temporaryFile.delete()
                        mainHandler.post {
                            isExporting = false
                            savedUri.onSuccess {
                                DemoCreationLimit.recordCreated(context)
                                statusMessage = "Готово: ролик сохранён. Демо-лимит: осталось ${DemoCreationLimit.remaining(context)} из 5."
                            }.onFailure { error ->
                                statusMessage = "Видео обработано, но не удалось сохранить в галерею: ${error.localizedMessage ?: "ошибка"}"
                            }
                        }
                        executor.shutdown()
                    }
                }

                override fun onError(
                    composition: Composition,
                    exportResult: ExportResult,
                    exportException: ExportException
                ) {
                    temporaryFile.delete()
                    mainHandler.post {
                        isExporting = false
                        statusMessage = "Не удалось обработать видео: ${exportException.localizedMessage ?: "ошибка экспорта"}"
                    }
                }
            })
            .build()

        try {
            isExporting = true
            statusMessage = "Обрезаю и сохраняю настоящий видеофайл…"
            transformer.start(editedItem, temporaryFile.absolutePath)
        } catch (error: Exception) {
            temporaryFile.delete()
            isExporting = false
            statusMessage = "Экспорт не запустился: ${error.localizedMessage ?: "ошибка"}"
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Монтаж Reels / Shorts", fontWeight = FontWeight.Bold)
                        Text(
                            "ДЕМО • осталось ${DemoCreationLimit.remaining(context)} из 5 созданий",
                            color = Color(0xFFF59E0B),
                            fontSize = 11.sp
                        )
                    }
                },
                actions = {
                    Button(
                        onClick = { navController.navigate("gallery") },
                        modifier = Modifier.padding(end = 8.dp),
                        enabled = !isExporting
                    ) {
                        Icon(Icons.Default.FolderOpen, contentDescription = null)
                        Spacer(Modifier.size(4.dp))
                        Text("Галерея")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0E0725))
            )
        },
        containerColor = Color(0xFF070314)
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (videoUri == null || player == null) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF180D3D)),
                    shape = RoundedCornerShape(18.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(22.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(Icons.Default.Movie, contentDescription = null, tint = Color(0xFFF59E0B), modifier = Modifier.size(50.dp))
                        Text("Выбери видео для монтажа", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                        Text(
                            "Можно открыть ролик из галереи телефона. После обрезки новый MP4 сохранится отдельно, исходник останется нетронутым.",
                            color = Color(0xFFCBD5E1),
                            fontSize = 12.sp
                        )
                        Button(
                            onClick = {
                                pickerLauncher.launch(
                                    PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)
                                )
                            }
                        ) {
                            Icon(Icons.Default.FolderOpen, contentDescription = null)
                            Spacer(Modifier.size(6.dp))
                            Text("Выбрать видео")
                        }
                        OutlinedButton(onClick = { navController.navigate("gallery") }) {
                            Text("Моя галерея")
                        }
                    }
                }
            } else {
                AndroidView(
                    factory = { ctx ->
                        PlayerView(ctx).apply {
                            useController = true
                            this.player = player
                        }
                    },
                    update = { view -> view.player = player },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(230.dp)
                )

                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF180D3D)),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Начало фрагмента", color = Color(0xFFCBD5E1), fontSize = 12.sp)
                            Text(formatSeconds(startTrimSec), color = Color(0xFFF59E0B), fontWeight = FontWeight.Bold)
                        }
                        Slider(
                            value = startTrimSec.coerceIn(0f, totalSeconds),
                            onValueChange = { value ->
                                startTrimSec = value.coerceAtMost(endTrimSec - 0.5f).coerceAtLeast(0f)
                            },
                            valueRange = 0f..totalSeconds,
                            enabled = !isExporting && totalSeconds > 1f
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Конец фрагмента", color = Color(0xFFCBD5E1), fontSize = 12.sp)
                            Text(formatSeconds(endTrimSec), color = Color(0xFFEC4899), fontWeight = FontWeight.Bold)
                        }
                        Slider(
                            value = endTrimSec.coerceIn(0f, totalSeconds),
                            onValueChange = { value ->
                                endTrimSec = value.coerceAtLeast(startTrimSec + 0.5f).coerceAtMost(totalSeconds)
                            },
                            valueRange = 0f..totalSeconds,
                            enabled = !isExporting && totalSeconds > 1f
                        )
                        Text(
                            "Итоговая длина: ${formatSeconds((endTrimSec - startTrimSec).coerceAtLeast(0f))} из ${formatSeconds(totalSeconds)}",
                            color = Color(0xFFCBD5E1),
                            fontSize = 11.sp
                        )
                    }
                }

                Button(
                    onClick = { exportClip() },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(14.dp),
                    enabled = !isExporting && durationMs > 0L && (endTrimSec - startTrimSec) > 0.25f,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                ) {
                    if (isExporting) {
                        CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                        Spacer(Modifier.size(8.dp))
                        Text("Обрабатываю видео…")
                    } else {
                        Icon(Icons.Default.SaveAlt, contentDescription = null)
                        Spacer(Modifier.size(8.dp))
                        Text("Экспортировать обрезанный MP4", fontWeight = FontWeight.Bold)
                    }
                }

                OutlinedButton(
                    onClick = {
                        pickerLauncher.launch(
                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isExporting
                ) {
                    Text("Выбрать другой ролик")
                }
            }

            if (!statusMessage.isNullOrBlank()) {
                Text(statusMessage.orEmpty(), color = Color(0xFFE2E8F0), fontSize = 12.sp)
            }
            Text(
                "Сейчас реализованы предпросмотр, обрезка по времени и экспорт. ИИ-поиск панчлайнов и вшитые субтитры не имитируются и требуют отдельной реализации.",
                color = Color(0xFF94A3B8),
                fontSize = 10.sp
            )
        }
    }
}

private fun formatSeconds(seconds: Float): String {
    val total = seconds.toInt().coerceAtLeast(0)
    return String.format(java.util.Locale.getDefault(), "%02d:%02d", total / 60, total % 60)
}
