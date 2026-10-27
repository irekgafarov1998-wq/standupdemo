package com.standuplab.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.standuplab.app.ui.theme.StageGreen
import com.standuplab.app.ui.theme.StageRed
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StagePrompterScreen(navController: NavController) {
    var isRunning by remember { mutableStateOf(false) }
    var secondsElapsed by remember { mutableStateOf(0) }
    var currentJokeIndex by remember { mutableStateOf(0) }
    var laughHits by remember { mutableStateOf(0) }
    var silenceMisses by remember { mutableStateOf(0) }
    var showPanicAlert by remember { mutableStateOf(false) }

    val setlistBits = remember {
        listOf(
            "1. Покупка авокадо в супермаркете" to "Сетап: бытовая рулетка. Панчлайн: режешь, а внутри уже нефть.",
            "2. Умный дом и робот-пылесос" to "Сетап: пылесос член семьи. Панчлайн: заперся в ванной и бился в дверь.",
            "3. Походы в тренажерный зал" to "Сетап: тренер смотрит на меня с сочувствием. Панчлайн: я пришел просто полежать на коврике."
        )
    }

    LaunchedEffect(isRunning) {
        while (isRunning) {
            delay(1000)
            secondsElapsed += 1
        }
    }

    val minutes = secondsElapsed / 60
    val seconds = secondsElapsed % 60
    val timeFormatted = String.format("%02d:%02d", minutes, seconds)

    Scaffold(
        containerColor = Color(0xFF070410), // True stage OLED black
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Transparent,
                    titleContentColor = Color.White
                ),
                title = { Text("Сценический суфлер", fontWeight = FontWeight.Bold) },
                actions = {
                    FilledTonalButton(
                        onClick = {
                            isRunning = !isRunning
                        },
                        colors = ButtonDefaults.filledTonalButtonColors(
                            containerColor = if (isRunning) StageRed else StageGreen
                        )
                    ) {
                        Icon(
                            if (isRunning) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = null
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(if (isRunning) "Стоп" else "Старт")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Stage Timer Header
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = timeFormatted,
                    fontSize = 58.sp,
                    fontWeight = FontWeight.Black,
                    color = if (secondsElapsed > 600) StageRed else Color(0xFFF59E0B),
                    letterSpacing = 2.sp
                )
                Text(
                    text = "Шутка ${currentJokeIndex + 1} из ${setlistBits.size}",
                    color = Color.Gray,
                    fontSize = 14.sp
                )
            }

            // Big Prompter Card
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFF160E2E)
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(vertical = 16.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    val currentBit = setlistBits.getOrNull(currentJokeIndex)
                    Text(
                        text = currentBit?.first ?: "Конец сет-листа!",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFF59E0B),
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = currentBit?.second ?: "Отличная работа на сцене!",
                        fontSize = 19.sp,
                        lineHeight = 28.sp,
                        color = Color.White,
                        textAlign = TextAlign.Center
                    )
                }
            }

            // Panic / Rescue Bit Button
            Button(
                onClick = { showPanicAlert = true },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                Icon(Icons.Default.Warning, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text("🚨 ПАНИКА / СПАСАТЕЛЬНЫЙ ПАНЧЛАЙН", fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Stage Reaction Counters & Navigation
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Prev
                IconButton(
                    onClick = { if (currentJokeIndex > 0) currentJokeIndex -= 1 },
                    enabled = currentJokeIndex > 0
                ) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Назад", tint = Color.White)
                }

                // Laugh Hit Button (+1)
                Button(
                    onClick = { laughHits += 1 },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("😂 Смех: $laughHits", fontWeight = FontWeight.Bold)
                }

                // Silence Miss Button (-1)
                Button(
                    onClick = { silenceMisses += 1 },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4B5563)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("😐 Тишина: $silenceMisses", fontWeight = FontWeight.Bold)
                }

                // Next
                IconButton(
                    onClick = { if (currentJokeIndex < setlistBits.size - 1) currentJokeIndex += 1 },
                    enabled = currentJokeIndex < setlistBits.size - 1
                ) {
                    Icon(Icons.Default.ArrowForward, contentDescription = "Вперед", tint = Color.White)
                }
            }
        }
    }

    if (showPanicAlert) {
        AlertDialog(
            onDismissRequest = { showPanicAlert = false },
            title = { Text("Спасательный панчлайн 🛡️") },
            text = {
                Text(
                    "«Вы так внимательно молчите, как будто записываете это в протокол!»\n\nИли:\n«Ладно, эту шутку я явно украл у человека, который тоже не умеет шутить.»"
                )
            },
            confirmButton = {
                TextButton(onClick = { showPanicAlert = false }) {
                    Text("Понял, продолжаю!")
                }
            }
        )
    }
}
