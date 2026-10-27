package com.standuplab.app

import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material.icons.filled.FormatListNumbered
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.standuplab.app.ui.screens.CameraStudioScreen
import com.standuplab.app.ui.screens.GalleryScreen
import com.standuplab.app.ui.screens.JokeVaultScreen
import com.standuplab.app.ui.screens.NotebookScreen
import com.standuplab.app.ui.screens.RiffRoomScreen
import com.standuplab.app.ui.screens.SetlistScreen
import com.standuplab.app.ui.screens.StagePrompterScreen
import com.standuplab.app.ui.screens.VideoReelsScreen
import com.standuplab.app.ui.theme.StandupLabTheme

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Camera : Screen("camera", "Камера", Icons.Default.Videocam)
    object Gallery : Screen("gallery", "Галерея", Icons.Default.Videocam)
    object Reels : Screen("reels", "Монтаж", Icons.Default.ContentCut)
    object Jokes : Screen("jokes", "Шутки", Icons.Default.Lightbulb)
    object Setlists : Screen("setlists", "Сеты", Icons.Default.FormatListNumbered)
    object Prompter : Screen("prompter", "Суфлёр", Icons.Default.Mic)
    object Notebook : Screen("notebook", "Блокнот", Icons.Default.EditNote)
    object Riffs : Screen("riffs", "Разгоны", Icons.Default.AutoAwesome)
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            StandupLabTheme {
                NativeAppScaffold()
            }
        }
    }
}

@Composable
fun NativeAppScaffold() {
    val navController = rememberNavController()
    var selectedVideoUri by remember { mutableStateOf<Uri?>(null) }

    // Primary navigation remains compact. Gallery is opened from Camera/Editor.
    val bottomItems = listOf(
        Screen.Camera,
        Screen.Reels,
        Screen.Jokes,
        Screen.Setlists,
        Screen.Prompter,
        Screen.Notebook,
        Screen.Riffs
    )

    Scaffold(
        bottomBar = {
            val entry by navController.currentBackStackEntryAsState()
            val currentRoute = entry?.destination?.route
            NavigationBar(containerColor = Color(0xFF0E0725)) {
                bottomItems.forEach { screen ->
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title, fontSize = 9.sp, maxLines = 1) },
                        selected = currentRoute == screen.route,
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFFF59E0B),
                            selectedTextColor = Color(0xFFF59E0B),
                            indicatorColor = Color(0xFF221350),
                            unselectedIconColor = Color(0xFF94A3B8),
                            unselectedTextColor = Color(0xFF94A3B8)
                        ),
                        onClick = {
                            if (currentRoute != screen.route) {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.startDestinationId) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Camera.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Camera.route) {
                CameraStudioScreen(navController)
            }
            composable(Screen.Reels.route) {
                VideoReelsScreen(
                    navController = navController,
                    videoUri = selectedVideoUri,
                    onVideoSelected = { uri -> selectedVideoUri = uri }
                )
            }
            composable(Screen.Gallery.route) {
                GalleryScreen { uri ->
                    selectedVideoUri = uri
                    navController.navigate(Screen.Reels.route) {
                        popUpTo(Screen.Camera.route) { inclusive = false }
                        launchSingleTop = true
                    }
                }
            }
            composable(Screen.Jokes.route) { JokeVaultScreen(navController) }
            composable(Screen.Setlists.route) { SetlistScreen(navController) }
            composable(Screen.Prompter.route) { StagePrompterScreen(navController) }
            composable(Screen.Notebook.route) { NotebookScreen(navController) }
            composable(Screen.Riffs.route) { RiffRoomScreen(navController) }
        }
    }
}
