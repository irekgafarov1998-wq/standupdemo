package com.standuplab.app

import android.app.Application
import androidx.room.Room
import com.standuplab.app.data.db.AppDatabase

class StandupApplication : Application() {
    lateinit var database: AppDatabase
        private set

    override fun onCreate() {
        super.onCreate()
        database = Room.databaseBuilder(
            applicationContext,
            AppDatabase::class.java,
            "standuplab.db"
        ).fallbackToDestructiveMigration().build()
    }
}
