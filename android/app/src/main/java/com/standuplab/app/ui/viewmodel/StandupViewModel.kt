package com.standuplab.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.standuplab.app.data.db.JokeDao
import com.standuplab.app.data.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class StagePrompterState(
    val isRunning: Boolean = false,
    val isPaused: Boolean = false,
    val secondsElapsed: Int = 0,
    val currentJokeIndex: Int = 0,
    val activeSetlist: Setlist? = null,
    val laughCount: Int = 0,
    val silenceCount: Int = 0,
    val isRecording: Boolean = false
)

class StandupViewModel(private val jokeDao: JokeDao) : ViewModel() {

    private val _jokes = MutableStateFlow<List<Joke>>(emptyList())
    val jokes: StateFlow<List<Joke>> = _jokes.asStateFlow()

    private val _setlists = MutableStateFlow<List<Setlist>>(emptyList())
    val setlists: StateFlow<List<Setlist>> = _setlists.asStateFlow()

    private val _notes = MutableStateFlow<List<Note>>(emptyList())
    val notes: StateFlow<List<Note>> = _notes.asStateFlow()

    private val _prompterState = MutableStateFlow(StagePrompterState())
    val prompterState: StateFlow<StagePrompterState> = _prompterState.asStateFlow()

    init {
        loadInitialData()
    }

    private fun loadInitialData() {
        viewModelScope.launch {
            jokeDao.getAllJokes().collect { list ->
                _jokes.value = list
            }
        }
        viewModelScope.launch {
            jokeDao.getAllSetlists().collect { list ->
                _setlists.value = list
            }
        }
        viewModelScope.launch {
            jokeDao.getAllNotes().collect { list ->
                _notes.value = list
            }
        }
    }

    fun addJoke(title: String, premise: String, punchline: String, category: JokeCategory, status: JokeStatus, durationSec: Int) {
        viewModelScope.launch {
            val newJoke = Joke(
                title = title,
                premise = premise,
                punchline = punchline,
                category = category,
                status = status,
                durationSeconds = durationSec
            )
            jokeDao.insertJoke(newJoke)
        }
    }

    fun updateJoke(joke: Joke) {
        viewModelScope.launch {
            jokeDao.updateJoke(joke)
        }
    }

    fun deleteJoke(joke: Joke) {
        viewModelScope.launch {
            jokeDao.deleteJoke(joke)
        }
    }

    // Stage Prompter Controls
    fun startStagePerformance(setlist: Setlist?) {
        _prompterState.value = StagePrompterState(
            isRunning = true,
            isPaused = false,
            secondsElapsed = 0,
            currentJokeIndex = 0,
            activeSetlist = setlist
        )
    }

    fun recordLaughHit() {
        val current = _prompterState.value
        _prompterState.value = current.copy(laughCount = current.laughCount + 1)
    }

    fun recordSilenceMiss() {
        val current = _prompterState.value
        _prompterState.value = current.copy(silenceCount = current.silenceCount + 1)
    }

    fun nextJoke() {
        val current = _prompterState.value
        val maxIndex = (current.activeSetlist?.jokeIds?.size ?: _jokes.value.size) - 1
        if (current.currentJokeIndex < maxIndex) {
            _prompterState.value = current.copy(currentJokeIndex = current.currentJokeIndex + 1)
        }
    }

    fun prevJoke() {
        val current = _prompterState.value
        if (current.currentJokeIndex > 0) {
            _prompterState.value = current.copy(currentJokeIndex = current.currentJokeIndex - 1)
        }
    }

    fun stopStagePerformance() {
        _prompterState.value = _prompterState.value.copy(isRunning = false)
    }
}
