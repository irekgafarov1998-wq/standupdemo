package com.standuplab.app.ui.screens

import android.Manifest
import android.content.ContentValues
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.video.MediaStoreOutputOptions
import androidx.camera.video.Quality
import androidx.camera.video.QualitySelector
import androidx.camera.video.FallbackStrategy
import androidx.camera.video.Recorder
import androidx.camera.video.Recording
import androidx.camera.video.VideoCapture
import androidx.camera.video.VideoRecordEvent
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FlipCameraAndroid
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.navigation.NavController
import com.standuplab.app.data.DemoCreationLimit
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private val StageAmber = Color(0xFFF59E0B)
private val StageBackground = Color(0xFF070314)

@OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
@Composable
fun CameraStudioScreen(navController: NavController) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var previewView by remember { mutableStateOf<PreviewView?>(null) }
    var cameraProvider by remember { mutableStateOf<ProcessCameraProvider?>(null) }
    var screenActive by remember { mutableStateOf(true) }
    var videoCapture by remember { mutableStateOf<VideoCapture<Recorder>?>(null) }
    var activeRecording by remember { mutableStateOf<Recording?>(null) }
    var lensFacing by remember { mutableIntStateOf(CameraSelector.LENS_FACING_BACK) }
    var cameraPermissionGranted by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) ==
                PackageManager.PERMISSION_GRANTED
        )
    }
    var audioPermissionGranted by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
                PackageManager.PERMISSION_GRANTED
        )
    }
    var recording by remember { mutableStateOf(false) }
    var elapsedSeconds by remember { mutableIntStateOf(0) }
    var cameraMessage by remember { mutableStateOf<String?>(null) }
    var lastSavedUri by remember { mutableStateOf<Uri?>(null) }
    var prompterEnabled by remember { mutableStateOf(true) }
    var prompterText by remember {
        mutableStateOf("Сетап: Покупка авокадо — бытовая рулетка.\nПанчлайн: Приходишь домой, режешь, а внутри уже нефть!")
    }

    val permissionsLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { grants ->
        cameraPermissionGranted = grants[Manifest.permission.CAMERA] == true ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) ==
                PackageManager.PERMISSION_GRANTED
        audioPermissionGranted = grants[Manifest.permission.RECORD_AUDIO] == true ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
                PackageManager.PERMISSION_GRANTED
        if (!cameraPermissionGranted) {
            cameraMessage = "Чтобы снимать видео, разреши доступ к камере."
        } else {
            cameraMessage = null
        }
    }

    fun requestCapturePermissions() {
        val requested = mutableListOf(
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO
        )
        if (Build.VERSION.SDK_INT <= 28) {
            requested += Manifest.permission.WRITE_EXTERNAL_STORAGE
        }
        permissionsLauncher.launch(requested.toTypedArray())
    }

    LaunchedEffect(Unit) {
        if (!cameraPermissionGranted || !audioPermissionGranted) requestCapturePermissions()
    }

    LaunchedEffect(previewView, cameraPermissionGranted, lensFacing) {
        val previewSurface = previewView
        if (previewSurface == null || !cameraPermissionGranted) return@LaunchedEffect

        try {
            val providerFuture = ProcessCameraProvider.getInstance(context)
            providerFuture.addListener({
                try {
                    if (!screenActive) return@addListener
                    val provider = providerFuture.get()
                    val selector = CameraSelector.Builder()
                        .requireLensFacing(lensFacing)
                        .build()

                    if (!provider.hasCamera(selector)) {
                        cameraMessage = "Эта камера недоступна на устройстве."
                        return@addListener
                    }

                    val preview = Preview.Builder().build().also {
                        it.surfaceProvider = previewSurface.surfaceProvider
                    }
                    val recorder = Recorder.Builder()
                        .setQualitySelector(
                            QualitySelector.fromOrderedList(
                                listOf(Quality.UHD, Quality.FHD, Quality.HD, Quality.SD),
                                FallbackStrategy.lowerQualityOrHigherThan(Quality.SD)
                            )
                        )
                        .build()
                    val capture = VideoCapture.withOutput(recorder)

                    provider.unbindAll()
                    provider.bindToLifecycle(lifecycleOwner, selector, preview, capture)
                    cameraProvider = provider
                    videoCapture = capture
                    cameraMessage = null
                } catch (error: Exception) {
                    cameraMessage = "Не удалось запустить камеру: ${error.localizedMessage ?: "ошибка устройства"}"
                }
            }, ContextCompat.getMainExecutor(context))
        } catch (error: Exception) {
            cameraMessage = "Не удалось инициализировать камеру: ${error.localizedMessage ?: "ошибка"}"
        }
    }

    LaunchedEffect(recording) {
        if (recording) {
            elapsedSeconds = 0
            while (recording) {
                delay(1000)
                elapsedSeconds++
            }
        }
    }

    val latestRecording = rememberUpdatedState(activeRecording)
    val latestCameraProvider = rememberUpdatedState(cameraProvider)
    DisposableEffect(Unit) {
        onDispose {
            screenActive = false
            latestRecording.value?.stop()
            latestCameraProvider.value?.unbindAll()
        }
    }

    fun startOrStopRecording() {
        if (recording) {
            activeRecording?.stop()
            return
        }
        if (DemoCreationLimit.isLimitReached(context)) {
            cameraMessage = "Демо-лимит исчерпан: можно создать не больше 5 видео/клипов суммарно."
            return
        }
        val capture = videoCapture
        if (capture == null) {
            cameraMessage = "Камера ещё запускается. Подожди секунду и попробуй снова."
            return
        }
        if (!cameraPermissionGranted) {
            requestCapturePermissions()
            return
        }

        val stamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val contentValues = ContentValues().apply {
            put(MediaStore.Video.Media.DISPLAY_NAME, "StandupLab_$stamp.mp4")
            put(MediaStore.Video.Media.MIME_TYPE, "video/mp4")
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(
                    MediaStore.Video.Media.RELATIVE_PATH,
                    "${Environment.DIRECTORY_MOVIES}/StandupLab"
                )
            }
        }
        val outputOptions = MediaStoreOutputOptions.Builder(
            context.contentResolver,
            MediaStore.Video.Media.EXTERNAL_CONTENT_URI
        ).setContentValues(contentValues).build()

        try {
            var pending = capture.output.prepareRecording(context, outputOptions)
            if (
                audioPermissionGranted &&
                ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) ==
                PackageManager.PERMISSION_GRANTED
            ) {
                pending = pending.withAudioEnabled()
            }
            recording = true
            activeRecording = pending.start(ContextCompat.getMainExecutor(context)) { event ->
                when (event) {
                    is VideoRecordEvent.Start -> {
                        cameraMessage = if (audioPermissionGranted) {
                            "Запись идёт. Видео сохраняется в Movies/StandupLab."
                        } else {
                            "Запись идёт без звука: разрешение на микрофон не выдано."
                        }
                    }
                    is VideoRecordEvent.Finalize -> {
                        recording = false
                        activeRecording = null
                        if (!event.hasError()) {
                            DemoCreationLimit.recordCreated(context)
                            lastSavedUri = event.outputResults.outputUri
                            cameraMessage = "Видео сохранено в галерею телефона. Демо-лимит: осталось ${DemoCreationLimit.remaining(context)} из 5."
                        } else {
                            cameraMessage = "Не удалось сохранить видео (код ${event.error})."
                        }
                    }
                    else -> Unit
                }
            }
        } catch (error: Exception) {
            recording = false
            activeRecording = null
            cameraMessage = "Не удалось начать запись: ${error.localizedMessage ?: "ошибка"}"
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Камера для сцены", color = StageAmber, fontWeight = FontWeight.Black)
                        Text(
                            "ДЕМО • осталось ${DemoCreationLimit.remaining(context)} из 5 созданий",
                            color = Color(0xFFF59E0B),
                            fontSize = 11.sp
                        )
                    }
                },
                actions = {
                    IconButton(
                        onClick = { navController.navigate("gallery") },
                        enabled = !recording
                    ) {
                        Icon(Icons.Default.Folder, contentDescription = "Галерея", tint = Color.White)
                    }
                    IconButton(
                        onClick = {
                            if (!recording) {
                                lensFacing = if (lensFacing == CameraSelector.LENS_FACING_BACK) {
                                    CameraSelector.LENS_FACING_FRONT
                                } else {
                                    CameraSelector.LENS_FACING_BACK
                                }
                            }
                        },
                        enabled = !recording
                    ) {
                        Icon(Icons.Default.FlipCameraAndroid, contentDescription = "Сменить камеру", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0E0725))
            )
        },
        containerColor = StageBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(22.dp))
                    .background(Color(0xFF120B24))
            ) {
                AndroidView(
                    factory = { ctx ->
                        PreviewView(ctx).apply {
                            scaleType = PreviewView.ScaleType.FILL_CENTER
                            implementationMode = PreviewView.ImplementationMode.COMPATIBLE
                            previewView = this
                        }
                    },
                    modifier = Modifier.fillMaxSize()
                )

                if (!cameraPermissionGranted) {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Icon(Icons.Default.Videocam, contentDescription = null, tint = StageAmber, modifier = Modifier.size(48.dp))
                        Text("Разреши доступ к камере", color = Color.White, fontWeight = FontWeight.Bold)
                        Button(onClick = { requestCapturePermissions() }) {
                            Text("Разрешить камеру и микрофон")
                        }
                    }
                }

                if (prompterEnabled) {
                    Surface(
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                            .fillMaxWidth()
                            .padding(10.dp),
                        color = Color.Black.copy(alpha = 0.72f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(modifier = Modifier.padding(9.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("СУФЛЁР", color = StageAmber, fontSize = 10.sp, fontWeight = FontWeight.Black)
                                Text("Текст можно менять ниже", color = Color.LightGray, fontSize = 10.sp)
                            }
                            Spacer(Modifier.height(5.dp))
                            Text(prompterText, color = Color.White, fontSize = 12.sp, lineHeight = 16.sp)
                        }
                    }
                }

                Row(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .background(Color.Black.copy(alpha = 0.65f))
                        .padding(horizontal = 14.dp, vertical = 9.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Mic, contentDescription = null, tint = if (audioPermissionGranted) Color(0xFF34D399) else Color.LightGray, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.size(5.dp))
                        Text(
                            if (audioPermissionGranted) "ЗВУК ВКЛ." else "БЕЗ МИКРОФОНА",
                            color = if (audioPermissionGranted) Color(0xFF34D399) else Color.LightGray,
                            fontSize = 10.sp
                        )
                    }
                    Text(
                        if (recording) String.format(Locale.getDefault(), "REC %02d:%02d", elapsedSeconds / 60, elapsedSeconds % 60)
                        else "ГОТОВ К ЗАПИСИ",
                        color = if (recording) Color(0xFFFF6B6B) else Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = { startOrStopRecording() },
                    enabled = cameraPermissionGranted && (videoCapture != null || recording),
                    modifier = Modifier.weight(1f).height(54.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (recording) Color(0xFFDC2626) else StageAmber,
                        contentColor = if (recording) Color.White else Color.Black
                    )
                ) {
                    Icon(
                        if (recording) Icons.Default.Stop else Icons.Default.Videocam,
                        contentDescription = null
                    )
                    Spacer(Modifier.size(8.dp))
                    Text(if (recording) "Остановить запись" else "Начать запись", fontWeight = FontWeight.Bold)
                }
                Button(
                    onClick = { prompterEnabled = !prompterEnabled },
                    modifier = Modifier.height(54.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF221350))
                ) {
                    Text(if (prompterEnabled) "Скрыть\nсуфлёр" else "Показать\nсуфлёр", fontSize = 11.sp)
                }
            }

            OutlinedTextField(
                value = prompterText,
                onValueChange = { prompterText = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Текст для суфлёра") },
                minLines = 2,
                maxLines = 3,
                enabled = !recording,
                shape = RoundedCornerShape(14.dp)
            )

            if (!cameraMessage.isNullOrBlank()) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF180D3D)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        cameraMessage.orEmpty(),
                        modifier = Modifier.padding(10.dp),
                        color = Color(0xFFE2E8F0),
                        fontSize = 12.sp
                    )
                }
            }

            if (lastSavedUri != null) {
                Button(
                    onClick = { navController.navigate("gallery") },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Folder, contentDescription = null)
                    Spacer(Modifier.size(7.dp))
                    Text("Открыть галерею — последнее видео сохранено")
                }
            }
        }
    }
}
