package com.standuplab.app.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.standuplab.app.data.models.Joke
import com.standuplab.app.data.models.JokeCategory
import com.standuplab.app.data.models.JokeStatus

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JokeVaultScreen(navController: NavController) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf<JokeCategory?>(null) }
    var showAddDialog by remember { mutableStateOf(false) }

    // Sample comedy bits in memory / Room
    val sampleJokes = remember {
        mutableStateListOf(
            Joke(
                title = "Покупка авокадо в супермаркете",
                premise = "Покупка авокадо — это бытовая рулетка. Либо он как камень, либо ты опоздал на 5 секунд.",
                punchline = "Ты приходишь домой, режешь его, а внутри уже нефть.",
                tags = listOf("Еда", "Магазин", "Наблюдение"),
                category = JokeCategory.OBSERVATIONAL,
                status = JokeStatus.GOLDEN,
                durationSeconds = 45,
                rating = 5
            ),
            Joke(
                title = "Умный дом и робот-пылесос",
                premise = "Мой робот-пылесос считает себя полноправным членом семьи.",
                punchline = "Вчера он закрылся в ванной и бился в дверь, требуя свободы.",
                tags = listOf("Технологии", "Быт"),
                category = JokeCategory.OBSERVATIONAL,
                status = JokeStatus.TESTED,
                durationSeconds = 50,
                rating = 4
            )
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("База шуток", fontWeight = FontWeight.Bold)
                        Text(
                            "${sampleJokes.size} шуток • готов к сцене",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { navController.navigate("riffs") }) {
                        Icon(
                            Icons.Default.AutoAwesome,
                            contentDescription = "Разгон с ИИ",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            ) {
                Icon(Icons.Default.Add, contentDescription = "Добавить шутку")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp)
        ) {
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                placeholder = { Text("Поиск по сетапу, панчлайну, тегам...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                shape = RoundedCornerShape(16.dp),
                singleLine = true
            )

            // Joke List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(sampleJokes.filter {
                    searchQuery.isEmpty() ||
                    it.title.contains(searchQuery, true) ||
                    it.premise.contains(searchQuery, true)
                }) { joke ->
                    JokeCardItem(
                        joke = joke,
                        onRiffClick = { navController.navigate("riffs") }
                    )
                }
            }
        }
    }
}

@Composable
fun JokeCardItem(joke: Joke, onRiffClick: () -> Unit) {
    var isExpanded by remember { mutableStateOf(false) }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        ),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { isExpanded = !isExpanded }
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = joke.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                ) {
                    Text(
                        text = "${joke.durationSeconds} сек",
                        color = MaterialTheme.colorScheme.primary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Premise (Сетап)
            Text(
                text = joke.premise,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.9f)
            )

            // Punchline (Панчлайн / Добивка)
            AnimatedVisibility(visible = isExpanded) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f))
                        .padding(12.dp)
                ) {
                    Text(
                        text = "⚡ ПАНЧЛАЙН:",
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = joke.punchline,
                        fontWeight = FontWeight.Medium,
                        fontSize = 15.sp,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    joke.tags.take(2).forEach { tag ->
                        AssistChip(
                            onClick = {},
                            label = { Text("#$tag", fontSize = 11.sp) }
                        )
                    }
                }

                FilledTonalButton(
                    onClick = onRiffClick,
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Icon(
                        Icons.Default.AutoAwesome,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Разогнать", fontSize = 12.sp)
                }
            }
        }
    }
}
