package com.standuplab.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.standuplab.app.data.models.Setlist

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SetlistScreen(navController: NavController) {
    val sampleSetlists = remember {
        mutableStateListOf(
            Setlist(
                title = "Открытый микрофон в Standup Store",
                venue = "Standup Store Moscow",
                targetDurationMinutes = 10,
                jokeIds = listOf("1", "2", "3")
            ),
            Setlist(
                title = "Проверка материала (Бар 'Комедия')",
                venue = "Бар Комедия",
                targetDurationMinutes = 15,
                jokeIds = listOf("1", "2")
            )
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Сет-листы выступлений", fontWeight = FontWeight.Bold) }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {},
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Default.Add, contentDescription = "Создать сет-лист")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(sampleSetlists) { setlist ->
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = setlist.title,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                            Badge(containerColor = MaterialTheme.colorScheme.primary) {
                                Text("${setlist.targetDurationMinutes} мин")
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "📍 ${setlist.venue} • ${setlist.jokeIds.size} шуток в сете",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = { navController.navigate("prompter") },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Выйти на сцену с этим сетом")
                        }
                    }
                }
            }
        }
    }
}
