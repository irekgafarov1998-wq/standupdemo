# 📱 Как перевести проект в APK на GitHub (Пошаговая инструкция)

В проект уже добавлен файл автоматической сборки для GitHub Actions:  
**`.github/workflows/build-apk.yml`**

---

## ⚡ Способ 1: Получение APK в 3 клика через GitHub Actions (Без установки Android Studio)

1. **Загрузите репозиторий на свой GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: standup comedy app with android project"
   git remote add origin https://github.com/<ваш_логин>/<имя_репозитория>.git
   git push -u origin main
   ```

2. **Зайдите на GitHub в свой репозиторий**:
   - Перейдите на вкладку **Actions** (в верхнем меню репозитория).
   - В левой колонке нажмите на воркфлоу **"Build Android APK"**.
   - Справа нажмите серую кнопку **"Run workflow"** -> выберите ветку `main` -> нажмите зеленую кнопку **"Run workflow"** (или воркфлоу запустится сам при обычном `git push`).

3. **Скачайте готовый APK**:
   - Подождите 2–3 минуты, пока сборка завершится зеленой галочкой ✅ **Build StandupLab APK**.
   - Нажмите на название завершенного запуска (например, *"feat: standup comedy app..."*).
   - Прокрутите страницу вниз до раздела **Artifacts**.
   - Нажмите на **`StandupLab-Android-APK`** — начнется скачивание архива с файлом:
     `StandupLab-v1.0.0-debug.apk`.
   - Распакуйте архив и перекиньте `.apk` на любой телефон Android (через Telegram, USB или Google Диск) и установите!

---

## 🏷️ Способ 2: Создание официального релиза с прикрепленным APK

Если вы хотите, чтобы APK-файл лежал во вкладке **Releases** на главной странице репозитория:
Создайте Git-тег:
```bash
git tag v1.0.0
git push origin v1.0.0
```
GitHub Actions автоматически соберет APK и создаст страницу релиза с готовой прямой ссылкой на скачивание `.apk` файла!

---

## 💻 Способ 3: Локальная сборка на компьютере (если установлен Android SDK / Studio)

1. Откройте терминал в папке проекта:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
2. Готовый APK файл будет по пути:
   `android/app/build/outputs/apk/debug/app-debug.apk`

3. Установка на подключенный телефон:
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```
