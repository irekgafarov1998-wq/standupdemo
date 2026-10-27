package com.standuplab.app.data

import android.content.Context

/**
 * Demo restriction: at most five newly created video files total (recordings + exported clips).
 * The counter is stored on-device and survives app restarts.
 */
object DemoCreationLimit {
    const val MAX_CREATIONS = 5
    private const val PREFS = "standuplab_demo_limits"
    private const val KEY_CREATED = "created_video_files"

    fun createdCount(context: Context): Int =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getInt(KEY_CREATED, 0)
            .coerceIn(0, MAX_CREATIONS)

    fun remaining(context: Context): Int =
        (MAX_CREATIONS - createdCount(context)).coerceAtLeast(0)

    fun isLimitReached(context: Context): Boolean = remaining(context) <= 0

    fun recordCreated(context: Context) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val current = prefs.getInt(KEY_CREATED, 0).coerceIn(0, MAX_CREATIONS)
        if (current < MAX_CREATIONS) {
            prefs.edit().putInt(KEY_CREATED, current + 1).apply()
        }
    }
}
