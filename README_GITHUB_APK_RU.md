# StandupLab — проект для сборки APK через GitHub Actions

Этот архив уже разложен так, чтобы содержимое можно было загрузить непосредственно в корень GitHub-репозитория. Не загружайте ZIP как один файл и не создавайте дополнительную папку-обёртку.

## Структура

```text
.
├── .github/
│   └── workflows/
│       └── build-apk.yml
├── android/
│   ├── app/
│   │   ├── build.gradle.kts
│   │   └── src/main/AndroidManifest.xml
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   ├── gradle.properties
│   ├── gradlew
│   └── gradle/wrapper/gradle-wrapper.properties
├── src/                     # исходники веб-версии
├── public/
├── package.json
└── README.md
```

## Загрузка в GitHub

1. Скачайте и распакуйте ZIP на компьютере.
2. Загрузите **всё содержимое** распакованной папки в корень репозитория (включая скрытую папку `.github`).
3. Проверьте, что в репозитории видны папки `.github`, `android`, `src` и файл `package.json` на одном уровне.
4. Сделайте commit в ветку `main` или `master`.
5. Откройте **Actions** → **Build StandupLab Android APK**. Сборка также запускается вручную через **Run workflow**.
6. После зелёной галочки откройте запуск и скачайте артефакт **StandupLab-Android-APK**.
7. Распакуйте скачанный артефакт — внутри будет `StandupLab-Android-debug.apk`.

## Что делает workflow

- настраивает Java 17, Gradle 8.9 и Android SDK;
- проверяет, что Android-проект и `AndroidManifest.xml` существуют;
- устанавливает Android Platform 35 и Build Tools 35.0.0;
- запускает `gradle :app:assembleDebug` напрямую, поэтому сборка не зависит от отсутствующего `gradle-wrapper.jar`;
- проверяет, что APK действительно создан, и публикует его как artifact на 30 дней.

## Если сборка не проходит

Откройте неудачный запуск в **Actions**, раскройте первый красный шаг и скопируйте его полный текст ошибки. Workflow не сообщает об успехе и не загружает артефакт, если APK не был создан.

## Важно

Это debug APK для тестирования и ручной установки, не подписанный релиз для Google Play. В этой среде не выполнялась полноценная сборка Gradle, поэтому результат необходимо подтвердить запуском GitHub Actions.
