package com.standuplab.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val AmberPrimary = Color(0xFFF59E0B)
val AmberVariant = Color(0xFFD97706)
val PinkAccent = Color(0xFFEC4899)
val PurpleAccent = Color(0xFF8B5CF6)
val DarkBackground = Color(0xFF0E0725)
val DarkSurface = Color(0xFF180D3D)
val DarkCard = Color(0xFF221350)
val OnDarkSurface = Color(0xFFF8FAFC)
val StageGreen = Color(0xFF10B981)
val StageRed = Color(0xFFEF4444)

private val DarkColorScheme = darkColorScheme(
    primary = AmberPrimary,
    onPrimary = Color(0xFF180D3D),
    primaryContainer = AmberVariant,
    secondary = PinkAccent,
    background = DarkBackground,
    surface = DarkSurface,
    surfaceVariant = DarkCard,
    onBackground = OnDarkSurface,
    onSurface = OnDarkSurface
)

@Composable
fun StandupLabTheme(
    darkTheme: Boolean = true, // Stand-up comedy performers rely on true OLED dark mode
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography(),
        content = content
    )
}
