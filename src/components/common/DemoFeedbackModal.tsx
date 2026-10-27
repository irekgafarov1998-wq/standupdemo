import React, { useState } from 'react';
import { useStandup } from '../../context/StandupContext';
import { StorageService } from '../../services/storage';
import { soundEffects } from '../../utils/soundEffects';
import { 
  X, Sparkles, MessageSquare, Star, Copy, Check, 
  Send, ThumbsUp, AlertCircle, RefreshCw, Flame, Mic
} from 'lucide-react';

export const DemoFeedbackModal: React.FC = () => {
  const { 
    isFeedbackModalOpen, closeFeedbackModal, feedbackTopic, 
    celebrate, jokes, setlists, notes 
  } = useStandup();

  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>(feedbackTopic || 'Общее впечатление');
  const [comment, setComment] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isFeedbackModalOpen) return null;

  const categories = [
    'Общее впечатление',
    'Каталог шуток (Jokes)',
    'Разгоны с ИИ (Riff Room)',
    'Блокнот комика (Notebook)',
    'Сет-листы и суфлер для сцены',
    'Камера и нарезка Reels',
    'Запись аудио и детекция смеха',
    'Ошибка / Баг (Bug Report)'
  ];

  const ratingLabels = ['Ужасно', 'Слабо', 'Нормально', 'Отлично', 'Шедевр для сцены! 🔥'];

  const generateReportText = () => {
    return `🎙️ ОТЗЫВ ТЕСТЕРА ПРИЛОЖЕНИЯ STANDUPLAB
-------------------------------------
👤 Тестер: ${userName.trim() || 'Анонимный комик'}
⭐ Оценка: ${rating}/5 (${ratingLabels[rating - 1]})
📂 Раздел: ${category}
💬 Отзыв: 
${comment.trim() || 'Без комментария'}

📊 Состояние тестовой среды:
- Шуток в базе: ${jokes.length}
- Сет-листов: ${setlists.length}
- Заметок: ${notes.length}
- Устройство: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Веб/Android'}
- Дата: ${new Date().toLocaleString('ru-RU')}
-------------------------------------`;
  };

  const handleCopy = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    soundEffects.playStageClick();
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = {
      userName: userName.trim() || 'Анонимный тестер',
      rating,
      category,
      comment: comment.trim(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };
    StorageService.saveTesterFeedback(item);
    setIsSubmitted(true);
    celebrate();
    soundEffects.playApplause();
    setTimeout(() => {
      setIsSubmitted(false);
      closeFeedbackModal();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#140205] border-2 border-rose-900/80 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col relative text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-rose-950/80 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-900/40 text-xl">
              🧪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Тестовая версия (Beta)
                </span>
              </div>
              <h3 className="text-lg font-black text-amber-100 tracking-tight mt-0.5">
                Отзыв тестера StandupLab
              </h3>
            </div>
          </div>
          <button
            onClick={closeFeedbackModal}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center text-3xl">
              👏
            </div>
            <h4 className="text-xl font-black text-amber-200">
              Спасибо за ваш отзыв!
            </h4>
            <p className="text-sm text-neutral-300 max-w-sm mx-auto">
              Ваш фидбек сохранен в системе и поможет сделать приложение идеальным для всех стендап-комиков.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 relative z-10 overflow-y-auto max-h-[75vh]">
            {/* Rating Stars */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Как вам удобство и функционал приложения?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      soundEffects.playStageClick();
                    }}
                    className={`p-2 rounded-xl border transition ${
                      rating >= star 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 scale-105' 
                        : 'bg-neutral-900/60 text-neutral-600 border-neutral-800'
                    }`}
                  >
                    <Flame className={`w-5 h-5 ${rating >= star ? 'fill-amber-400' : ''}`} />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-400 ml-2">
                  {ratingLabels[rating - 1]}
                </span>
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Что вы тестировали:
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-rose-950/80 text-neutral-200 text-xs focus:outline-none focus:border-amber-500 transition"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Ваше имя или ник в Telegram (необязательно):
              </label>
              <input
                type="text"
                placeholder="например: @standup_comic"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-rose-950/80 text-neutral-200 text-xs focus:outline-none focus:border-amber-500 transition placeholder-neutral-600"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Что понравилось, чего не хватило или какой баг нашли?
              </label>
              <textarea
                rows={3}
                required
                placeholder="Опишите ваши впечатления от теста, что стоит улучшить на сцене..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-rose-950/80 text-neutral-200 text-xs focus:outline-none focus:border-amber-500 transition placeholder-neutral-600 resize-none"
              />
            </div>

            {/* Quick Copy to Messenger */}
            <div className="bg-neutral-950/70 p-3 rounded-2xl border border-rose-950/60 flex items-center justify-between gap-3">
              <div className="text-[11px] text-neutral-400">
                Отправьте отчет создателю в Telegram / WhatsApp в один клик:
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition shrink-0"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Скопировано!' : 'Скопировать'}</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeFeedbackModal}
                className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-bold transition"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-900/30 transition hover:scale-[1.02] active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Отправить отзыв</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
