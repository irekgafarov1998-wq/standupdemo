package com.standuplab.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.standuplab.app.data.models.RiffMessage

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RiffRoomScreen(navController: NavController) {
    var topic by remember { mutableStateOf("Покупка абонемента в спортзал") }
    var inputText by remember { mutableStateOf("") }
    var isGenerating by remember { mutableStateOf(false) }

    val messages = remember {
        mutableStateListOf(
            RiffMessage(
                role = "assistant",
                persona = "head_writer",
                text = "Привет! Я твой комедийный соавтор на базе ИИ. Давай разгоним тему про фитнес. В чем тут главное несоответствие ожиданий и реальности?",
                suggestedPremise = "Абонемент в зал — это самая дорогая индульгенция на пиццу в пятницу.",
                suggestedPunchline = "Ты платишь за годовой абонемент, чтобы 364 дня чувствовать себя виноватым."
            )
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Комната разгонов с ИИ", fontWeight = FontWeight.Bold)
                        Text(
                            "Writers' Room • Стендап-соавтор",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            // Chat message list
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(messages) { msg ->
                    val isAssistant = msg.role == "assistant"
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = if (isAssistant) Alignment.Start else Alignment.End
                    ) {
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = if (isAssistant) Color(0xFF221350) else MaterialTheme.colorScheme.primary,
                            contentColor = if (isAssistant) Color.White else Color.Black,
                            modifier = Modifier.widthIn(max = 320.dp)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = if (isAssistant) "🤖 Соавтор (ИИ)" else "Вы",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isAssistant) MaterialTheme.colorScheme.primary else Color.Black.copy(alpha = 0.7f)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(msg.text, fontSize = 14.sp)

                                if (msg.suggestedPunchline != null) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = Color.Black.copy(alpha = 0.25f),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Column(modifier = Modifier.padding(8.dp)) {
                                            Text(
                                                "💡 ДОБИВКА:",
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = Color(0xFFF59E0B)
                                            )
                                            Text(msg.suggestedPunchline, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Input Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    placeholder = { Text("Напиши сетап или наблюдение...") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                FloatingActionButton(
                    onClick = {
                        if (inputText.isNotBlank()) {
                            messages.add(RiffMessage(role = "user", text = inputText))
                            val prompt = inputText
                            inputText = ""
                            // Simulate instant comedy riff response
                            messages.add(
                                RiffMessage(
                                    role = "assistant",
                                    persona = "head_writer",
                                    text = "Отличная зацепка по теме '$prompt'! Давай усилим через гиперболу: доведи ситуацию до абсурда.",
                                    suggestedPunchline = "Когда тренер спрашивает: 'Какая у нас цель?', я честно отвечаю: 'Дожить до конца трека в наушниках'."
                                )
                            )
                        }
                    },
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary,
                    shape = CircleShape
                ) {
                    Icon(Icons.Default.Send, contentDescription = "Отправить")
                }
            }
        }
    }
}
