package com.standuplab.app.ui.screens

import android.Manifest
import android.content.ContentUris
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.VideoLibrary
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
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
import androidx.core.content.ContextCompat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

private data class GalleryVideo(
    val uri: Uri,
    val title: String,
    val durationMs: Long,
    val dateAddedSeconds: Long,
    val sizeBytes: Long
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GalleryScreen(
    onVideoSelected: (Uri) -> Unit
) {
    val context = LocalContext.current
    val readPermission = if (Build.VERSION.SDK_INT >= 33) {
        Manifest.permission.READ_MEDIA_VIDEO
    } else {
        Manifest.permission.READ_EXTERNAL_STORAGE
    }

    var hasPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, readPermission) ==
                PackageManager.PERMISSION_GRANTED
        )
    }
    var videos by remember { mutableStateOf<List<GalleryVideo>>(emptyList()) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasPermission = granted
        if (!granted) {
            errorMessage = "Нет доступа к списку видео. Можно импортировать ролик через системный выбор файлов."
        }
    }

    val pickerLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        if (uri != null) onVideoSelected(uri)
    }

    LaunchedEffect(hasPermission) {
        if (!hasPermission) {
            videos = emptyList()
            return@LaunchedEffect
        }

        isLoading = true
        errorMessage = null
        val loaded = withContext(Dispatchers.IO) {
            runCatching {
                val result = mutableListOf<GalleryVideo>()
                val collection = MediaStore.Video.Media.EXTERNAL_CONTENT_URI
                val projection = arrayOf(
                    MediaStore.Video.Media._ID,
                    MediaStore.Video.Media.DISPLAY_NAME,
                    MediaStore.Video.Media.DURATION,
                    MediaStore.Video.Media.DATE_ADDED,
                    MediaStore.Video.Media.SIZE
                )
                context.contentResolver.query(
                    collection,
                    projection,
                    null,
                    null,
                    "${MediaStore.Video.Media.DATE_ADDED} DESC"
                )?.use { cursor ->
                    val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media._ID)
                    val nameColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DISPLAY_NAME)
                    val durationColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DURATION)
                    val dateColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATE_ADDED)
                    val sizeColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.SIZE)

                    while (cursor.moveToNext()) {
                        val id = cursor.getLong(idColumn)
                        result += GalleryVideo(
                            uri = ContentUris.withAppendedId(collection, id),
                            title = cursor.getString(nameColumn) ?: "Видео без названия",
                            durationMs = cursor.getLong(durationColumn).coerceAtLeast(0L),
                            dateAddedSeconds = cursor.getLong(dateColumn).coerceAtLeast(0L),
                            sizeBytes = cursor.getLong(sizeColumn).coerceAtLeast(0L)
                        )
                    }
                }
                result
            }.getOrElse {
                errorMessage = "Не получилось прочитать галерею: ${it.localizedMessage ?: "ошибка доступа"}"
                emptyList()
            }
        }
        videos = loaded
        isLoading = false
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Галерея видео", fontWeight = FontWeight.Bold)
                        Text(
                            "${videos.size} видео · локально на телефоне",
                            fontSize = 11.sp,
                            color = Color(0xFFCBD5E1)
                        )
                    }
                },
                actions = {
                    Button(
                        onClick = {
                            pickerLauncher.launch(
                                PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)
                            )
                        },
                        modifier = Modifier.padding(end = 8.dp)
                    ) {
                        Icon(Icons.Default.FolderOpen, contentDescription = null)
                        Spacer(Modifier.width(5.dp))
                        Text("Импорт")
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
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            if (!hasPermission) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF180D3D)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text("Нужен доступ к видео", color = Color.White, fontWeight = FontWeight.Bold)
                        Text(
                            "Разрешение нужно только для отображения списка роликов на телефоне. Отдельный ролик можно выбрать через системный медиапикер без выдачи полного доступа.",
                            color = Color(0xFFCBD5E1),
                            fontSize = 12.sp
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = { permissionLauncher.launch(readPermission) }) {
                                Text("Разрешить")
                            }
                            Button(
                                onClick = {
                                    pickerLauncher.launch(
                                        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)
                                    )
                                }
                            ) {
                                Text("Выбрать видео")
                            }
                        }
                    }
                }
            } else if (isLoading) {
                Text("Загружаю список видео…", color = Color(0xFFCBD5E1))
            } else if (videos.isEmpty()) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF180D3D)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(Icons.Default.VideoLibrary, contentDescription = null, tint = Color(0xFFF59E0B), modifier = Modifier.size(40.dp))
                        Text("Пока видео не найдено", color = Color.White, fontWeight = FontWeight.Bold)
                        Text(
                            "Запиши выступление камерой StandupLab или выбери готовый ролик из галереи.",
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
                            Text("Выбрать готовое видео")
                        }
                    }
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    items(videos, key = { it.uri.toString() }) { video ->
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF180D3D)),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(13.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Icon(Icons.Default.Movie, contentDescription = null, tint = Color(0xFFF59E0B), modifier = Modifier.size(32.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        video.title,
                                        color = Color.White,
                                        fontWeight = FontWeight.SemiBold,
                                        maxLines = 2
                                    )
                                    Text(
                                        "${formatDuration(video.durationMs)}  ·  ${formatBytes(video.sizeBytes)}",
                                        color = Color(0xFFCBD5E1),
                                        fontSize = 11.sp
                                    )
                                }
                                Button(
                                    onClick = { onVideoSelected(video.uri) },
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Icon(Icons.Default.PlayArrow, contentDescription = null)
                                    Text("Монтаж")
                                }
                            }
                        }
                    }
                }
            }

            if (!errorMessage.isNullOrBlank()) {
                Text(errorMessage.orEmpty(), color = Color(0xFFFCA5A5), fontSize = 12.sp)
            }
        }
    }
}

private fun formatDuration(durationMs: Long): String {
    val totalSeconds = (durationMs / 1000L).toInt()
    return String.format(java.util.Locale.getDefault(), "%02d:%02d", totalSeconds / 60, totalSeconds % 60)
}

private fun formatBytes(bytes: Long): String {
    return when {
        bytes >= 1024L * 1024L * 1024L -> String.format(java.util.Locale.getDefault(), "%.1f ГБ", bytes / (1024.0 * 1024 * 1024))
        bytes >= 1024L * 1024L -> String.format(java.util.Locale.getDefault(), "%.1f МБ", bytes / (1024.0 * 1024))
        else -> "${(bytes / 1024L).coerceAtLeast(1L)} КБ"
    }
}
