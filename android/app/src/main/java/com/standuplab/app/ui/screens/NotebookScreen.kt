package com.standuplab.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.standuplab.app.data.models.Note

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotebookScreen(navController: NavController) {
    var activeNoteText by remember {
        mutableStateOf(
            "Мысль для разгона: почему все курьеры на электросамокатах ездят с лицом людей, которые везут донорское сердце?"
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Блокнот автора", fontWeight = FontWeight.Bold) },
                actions = {
                    FilledTonalButton(
                        onClick = { navController.navigate("riffs") }
                    ) {
                        Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Разогнать с ИИ", fontSize = 12.sp)
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
            OutlinedTextField(
                value = activeNoteText,
                onValueChange = { activeNoteText = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                label = { Text("Заметки, сетапы, наблюдения из жизни") },
                shape = RoundedCornerShape(16.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = {},
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Save, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Сохранить в блокнот")
            }
        }
    }
}
