package com.standuplab.app.data.db

import androidx.room.*
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.standuplab.app.data.models.*
import kotlinx.coroutines.flow.Flow

class Converters {
    private val gson = Gson()

    @TypeConverter
    fun fromStringList(value: List<String>): String = gson.toJson(value)

    @TypeConverter
    fun toStringList(value: String): List<String> {
        val listType = object : TypeToken<List<String>>() {}.type
        return gson.fromJson(value, listType) ?: emptyList()
    }
}

@Dao
interface JokeDao {
    @Query("SELECT * FROM jokes ORDER BY updatedAt DESC")
    fun getAllJokes(): Flow<List<Joke>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertJoke(joke: Joke)

    @Update
    suspend fun updateJoke(joke: Joke)

    @Delete
    suspend fun deleteJoke(joke: Joke)

    // Setlists
    @Query("SELECT * FROM setlists ORDER BY createdAt DESC")
    fun getAllSetlists(): Flow<List<Setlist>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSetlist(setlist: Setlist)

    @Delete
    suspend fun deleteSetlist(setlist: Setlist)

    // Notes
    @Query("SELECT * FROM notes ORDER BY updatedAt DESC")
    fun getAllNotes(): Flow<List<Note>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNote(note: Note)

    @Delete
    suspend fun deleteNote(note: Note)
}

@Database(entities = [Joke::class, Setlist::class, Note::class, RiffSession::class], version = 1, exportSchema = false)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun jokeDao(): JokeDao
}
