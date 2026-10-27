package com.standuplab.app.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

@Entity(tableName = "setlists")
data class Setlist(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val venue: String = "",
    val targetDurationMinutes: Int = 10,
    val jokeIds: List<String> = emptyList(),
    val notes: String = "",
    val performanceDate: Long? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "notes")
data class Note(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val title: String,
    val content: String,
    val tags: List<String> = emptyList(),
    val updatedAt: Long = System.currentTimeMillis()
)

data class RiffMessage(
    val id: String = UUID.randomUUID().toString(),
    val role: String, // "user" or "assistant"
    val persona: String = "co_writer",
    val text: String,
    val suggestedPremise: String? = null,
    val suggestedPunchline: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "riff_sessions")
data class RiffSession(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),
    val topic: String,
    val persona: String = "co_writer",
    val messagesJson: String = "[]",
    val updatedAt: Long = System.currentTimeMillis()
)
