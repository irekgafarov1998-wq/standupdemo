package com.standuplab.app.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

enum class JokeStatus(val title: String) {
    IDEA("Идея"),
    DRAFT("В работе"),
    TESTED("Проверено на открытом микрофоне"),
    GOLDEN("Золотой фонд (Хит)"),
    ARCHIVED("В архив")
}

enum class JokeCategory(val title: String) {
    OBSERVATIONAL("Наблюдения"),
    SELF_DEPRECATING("Самоирония"),
    RELATIONSHIPS("Отношения"),
    WORK_STUDY("Работа и учеба"),
    SOCIETY("Общество"),
    ABSURD("Абсурд"),
    DARK("Черный юмор")
}

@Entity(tableName = "jokes")
data class Joke(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val premise: String,
    val punchline: String,
    val tags: List<String> = emptyList(),
    val category: JokeCategory = JokeCategory.OBSERVATIONAL,
    val status: JokeStatus = JokeStatus.IDEA,
    val durationSeconds: Int = 45,
    val rating: Int = 3, // 1 to 5 stars
    val notes: String = "",
    val laughsCount: Int = 0,
    val silenceCount: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
