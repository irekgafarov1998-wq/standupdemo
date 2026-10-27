import React, { useState, useRef, useEffect } from 'react';
import { useStandup } from '../../context/StandupContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { RiffPersona, RiffMessage, JokeCategory } from '../../types';
import { soundEffects } from '../../utils/soundEffects';
import { 
  Flame, Sparkles, Send, Mic, MicOff, Star, Plus, Trash2, 
  Copy, Check, BookOpen, Shuffle, MessageSquare, ArrowRight,
  TrendingUp, Award, RefreshCw, Zap, Users, ShieldAlert, Theater, ChevronDown, ListFilter
} from 'lucide-react';
import { StandupSectionBanner } from '../common/StandupSectionBanner';

const PERSONAS: { id: RiffPersona; name: string; role: string; icon: string; desc: string; badgeColor: string }[] = [
  {
    id: 'observational',
    name: 'Мастер жизы',
    role: 'Бытовой циник',
    icon: '🧐',
    desc: 'Неловкие бытовые детали, стыдные привычки, ситуации, в которых каждый узнает себя.',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10'
  },
  {
    id: 'head_writer',
    name: 'Шеф-редактор',
    role: 'Строгий автор',
    icon: '🎙️',
    desc: 'Режет лишнюю воду в сетапе, держит ритм, ставит жесткую точку коротким панчем.',
    badgeColor: 'border-rose-500/40 text-rose-300 bg-rose-500/10'
  },
  {
    id: 'absurdist',
    name: 'Абсурдист',
    role: 'Эскалатор фантазий',
    icon: '🌀',
    desc: 'Раздувает бытовую мелочь до космоса, сюрреализма, диких гипербол и метафор.',
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-500/10'
  },
  {
    id: 'skeptic',
    name: 'Душнила-скептик',
    role: 'Голос зала',
    icon: '😈',
    desc: 'Докапывается до первопричины: "Зачем ты вообще это сделал?", обнажая настоящую боль.',
    badgeColor: 'border-blue-500/40 text-blue-300 bg-blue-500/10'
  },
  {
    id: 'character_pov',
    name: 'Вторая сторона',
    role: 'Адвокат оппонента',
    icon: '🎭',
    desc: 'Монолог кота, таксиста, кассира, арендодателя или твоего собственного уставшего тела.',
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
  }
];

const QUICK_TOPICS = [
  'Покупка спелого авокадо в супермаркете',
  'Когда тебе исполняется 30 лет и тело начинает скрипеть',
  'Общий чат жильцов дома в WhatsApp',
  'Бариста варит кофе за 450₽ с лицом судьи',
  'Поход в спортзал в понедельник после трёх месяцев перерыва',
  'Звонок с неизвестного номера: опрос качества услуг',
  'Ортопедическая подушка с эффектом злопамятности',
  'Свидание, на котором человек говорит только о своих бывших'
];

export const ComedyRiffRoom: React.FC = () => {
  const { 
    riffSessions, activeRiffSessionId, setActiveRiffSessionId,
    createRiffSession, updateRiffSession, deleteRiffSession, addRiffMessage,
    jokes, addJoke, notes, addNote, updateNote, celebrate 
  } = useStandup();

  const { t } = useLanguage();

  const [inputMessage, setInputMessage] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedJokeId, setSavedJokeId] = useState<string | null>(null);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [showJokePicker, setShowJokePicker] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = riffSessions.find(s => s.id === activeRiffSessionId) || riffSessions[0] || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  useEffect(() => {
    if (activeSession) {
      setTopicInput(activeSession.topic);
    }
  }, [activeSession?.id]);

  // Voice recognition setup
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showNotice('Голосовой ввод не поддерживается данным браузером');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        soundEffects.playStageClick();
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setInputMessage(prev => prev ? `${prev} ${currentTranscript.trim()}` : currentTranscript.trim());
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSendPrompt = async (mode: 'chat' | 'escalate' | 'punchlines' | 'pov' | 'tags' | 'actout' = 'chat', customPrompt?: string) => {
    if (!activeSession) return;
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend && mode === 'chat') return;

    soundEffects.playStageClick();

    // If customPrompt or textToSend, add user message to session
    if (textToSend) {
      addRiffMessage(activeSession.id, {
        sender: 'user',
        text: textToSend,
        type: mode
      });
      setInputMessage('');
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/riff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeSession.topic,
          userMessage: textToSend,
          persona: activeSession.persona,
          mode: mode,
          chatHistory: activeSession.messages.map(m => ({
            sender: m.sender,
            text: m.text,
            persona: m.persona
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();

      let replyText = data.text || 'Отличная идея, давай раскручивать дальше!';

      // Append escalation steps if present
      if (data.escalationSteps && Array.isArray(data.escalationSteps)) {
        replyText += '\n\n' + data.escalationSteps.map((s: any) => `🔥 **${s.title}**: ${s.description}`).join('\n\n');
      }

      // Append punchlines if present
      if (data.punchlines && Array.isArray(data.punchlines)) {
        replyText += '\n\n🎯 **Варианты добивок:**\n' + data.punchlines.map((p: any, idx: number) => `${idx + 1}. [${p.type}] "${p.text}"`).join('\n');
      }

      addRiffMessage(activeSession.id, {
        sender: 'ai',
        persona: activeSession.persona,
        text: replyText,
        type: mode,
        suggestedPremise: data.suggestedPremise,
        suggestedPunchline: data.suggestedPunchline,
        tags: data.tags || []
      });

      soundEffects.playStageClick();
    } catch (err) {
      console.warn('AI riff error, falling back locally', err);
      // Fallback
      addRiffMessage(activeSession.id, {
        sender: 'ai',
        persona: activeSession.persona,
        text: `Слушай, в этом есть зерно! Самое смешное в теме "${activeSession.topic}" — это контраст между тем, как пафосно мы себе это представляем, и тем, какой позор происходит на самом деле.\n\n💡 А прикинь добить так: "У меня было два выхода: уйти красиво или сделать вид, что я умер прямо в очереди"`,
        type: mode,
        suggestedPremise: `Когда я сталкиваюсь с "${activeSession.topic}"...`,
        suggestedPunchline: '...я делаю вид, что всё под контролем, хотя внутри играет музыка из шоу Бенни Хилла.',
        tags: ['разгон', 'жиза', 'сцена']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToJokes = (msg: RiffMessage) => {
    const premise = msg.suggestedPremise || activeSession?.topic || 'Разгон из комнаты соавтора';
    const punchline = msg.suggestedPunchline || msg.text.split('\n').filter(Boolean).pop() || 'Неожиданный поворот';

    addJoke({
      title: activeSession?.title ? `Шутка: ${activeSession.title.slice(0, 35)}` : 'Шутка с разгона',
      premise: premise,
      punchline: punchline,
      category: 'Наблюдения' as JokeCategory,
      status: 'draft',
      durationSec: 45,
      rating: 0,
      tags: msg.tags || ['с разгона', 'ИИ соавтор']
    });

    setSavedJokeId(msg.id);
    celebrate();
    setTimeout(() => setSavedJokeId(null), 2500);
  };

  const handleSaveToNotebook = (msg: RiffMessage) => {
    const addition = `--- 🎤 Разгон (${activeSession?.topic || 'Тема'}) ---\n${msg.text}\n${msg.suggestedPremise ? `\n[Сетап]: ${msg.suggestedPremise}` : ''}${msg.suggestedPunchline ? `\n[Панч]: ${msg.suggestedPunchline}` : ''}`;
    
    if (notes.length > 0) {
      const targetNote = notes[0];
      updateNote(targetNote.id, {
        content: targetNote.content + '\n\n' + addition
      });
    } else {
      addNote(`Разгон: ${activeSession?.topic || 'Новая тема'}`, addition);
    }

    setSavedNoteId(msg.id);
    showNotice('Идея успешно добавлена в Блокнот автора 📖');
    setTimeout(() => setSavedNoteId(null), 2500);
  };

  const handleSaveTopic = () => {
    if (!activeSession || !topicInput.trim()) return;
    updateRiffSession(activeSession.id, {
      topic: topicInput.trim(),
      title: topicInput.trim().slice(0, 40)
    });
    setIsEditingTopic(false);
  };

  const handlePersonaChange = (newPersona: RiffPersona) => {
    if (!activeSession) return;
    updateRiffSession(activeSession.id, { persona: newPersona });
    soundEffects.playStageClick();
  };

  const currentPersonaMeta = PERSONAS.find(p => p.id === activeSession?.persona) || PERSONAS[0];

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {notice && (
        <div className="p-3 bg-neutral-900 border border-amber-500/40 rounded-2xl text-amber-300 text-xs flex items-center justify-between shadow-lg shadow-amber-500/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{notice}</span>
          </div>
          <button 
            onClick={() => setNotice(null)} 
            className="text-neutral-400 hover:text-white text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Standup Backstage Green Room Banner */}
      <StandupSectionBanner
        tab="riffs"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                const randomTopic = QUICK_TOPICS[Math.floor(Math.random() * QUICK_TOPICS.length)];
                createRiffSession(randomTopic);
                soundEffects.playStageClick();
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-neutral-900/90 hover:bg-neutral-800 text-emerald-300 rounded-xl text-xs font-bold transition border border-emerald-500/30 shadow-sm"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>Случайная тема</span>
            </button>

            <button
              onClick={() => {
                createRiffSession('Новая мысль для стендапа');
                soundEffects.playStageClick();
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 rounded-xl text-xs font-black transition shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Новый разгон</span>
            </button>
          </div>
        }
      />

      {/* Sessions list tabs in Green Room lounge styling */}
      <div className="bg-[#041a12]/90 border border-emerald-900/60 rounded-2xl p-4 shadow-md flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs text-neutral-400 font-semibold shrink-0 flex items-center gap-1.5 mr-1">
              <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
              Сессии:
            </span>
            {riffSessions.map(session => (
              <div key={session.id} className="relative group shrink-0">
                <button
                  onClick={() => {
                    setActiveRiffSessionId(session.id);
                    soundEffects.playStageClick();
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                    activeRiffSessionId === session.id
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <span className="max-w-[160px] truncate">{session.title}</span>
                  {session.messages.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-400">
                      {session.messages.length}
                    </span>
                  )}
                </button>
                {riffSessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Удалить этот разгон?')) {
                        deleteRiffSession(session.id);
                      }
                    }}
                    title="Удалить сессию"
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Quick Joke Vault Importer */}
          <div className="relative">
            <button
              onClick={() => setShowJokePicker(!showJokePicker)}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium py-1 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 transition"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Разогнать шутку из базы ({jokes.length})</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showJokePicker && (
              <div className="absolute right-0 top-full mt-2 w-72 max-h-64 overflow-y-auto bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-2 z-30 space-y-1">
                <div className="text-[11px] font-bold uppercase text-neutral-400 px-2 py-1 border-b border-neutral-800">
                  Выберите шутку для разгона:
                </div>
                {jokes.map(j => (
                  <button
                    key={j.id}
                    onClick={() => {
                      createRiffSession(j.title, 'head_writer');
                      setShowJokePicker(false);
                      // Send initial riff request
                      handleSendPrompt('chat', `Разгоняем и докручиваем готовую шутку:\nСетап: "${j.premise}"\nПанчлайн: "${j.punchline}"\nПодскажи, как сделать этот панч ещё мощнее и какие добивки можно добавить?`);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-neutral-800 transition group"
                  >
                    <div className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300 truncate">
                      {j.title}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate">
                      {j.premise}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Persona Selection & Writing Tools */}
        <div className="lg:col-span-1 space-y-4">
          {/* Persona Picker */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Персонаж соавтора:
              </span>
              <span className="text-xs text-amber-400 font-semibold">
                {currentPersonaMeta.name}
              </span>
            </div>

            <div className="space-y-2">
              {PERSONAS.map(p => {
                const isSelected = activeSession?.persona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePersonaChange(p.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-start gap-2.5 ${
                      isSelected
                        ? `${p.badgeColor} border-current ring-1 ring-amber-500/30`
                        : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{p.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-200">{p.name}</span>
                        <span className="text-[10px] text-neutral-500 font-medium">{p.role}</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 leading-tight">
                        {p.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Riff Actions Panel */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Быстрые разгоны:
            </span>

            <div className="grid grid-cols-1 gap-2">
              <button
                disabled={isLoading}
                onClick={() => handleSendPrompt('escalate')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-purple-950/40 to-neutral-900 border border-purple-500/30 hover:border-purple-400/60 text-purple-200 hover:text-white transition text-left text-xs font-semibold group"
              >
                <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 group-hover:scale-110 transition">
                  🚀
                </span>
                <div>
                  <div>Разогнать в абсурд</div>
                  <div className="text-[10px] text-neutral-400 font-normal">Эскалация в 3 уровня фарса</div>
                </div>
              </button>

              <button
                disabled={isLoading}
                onClick={() => handleSendPrompt('punchlines')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-neutral-900 border border-amber-500/30 hover:border-amber-400/60 text-amber-200 hover:text-white transition text-left text-xs font-semibold group"
              >
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 group-hover:scale-110 transition">
                  🎯
                </span>
                <div>
                  <div>3 добивки (панча)</div>
                  <div className="text-[10px] text-neutral-400 font-normal">Обманка, правило 3, самоирония</div>
                </div>
              </button>

              <button
                disabled={isLoading}
                onClick={() => handleSendPrompt('pov')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-neutral-900 border border-emerald-500/30 hover:border-emerald-400/60 text-emerald-200 hover:text-white transition text-left text-xs font-semibold group"
              >
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:scale-110 transition">
                  🎭
                </span>
                <div>
                  <div>Смена угла (POV)</div>
                  <div className="text-[10px] text-neutral-400 font-normal">Глазами кассира, кота, вещи</div>
                </div>
              </button>

              <button
                disabled={isLoading}
                onClick={() => handleSendPrompt('tags')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-blue-950/40 to-neutral-900 border border-blue-500/30 hover:border-blue-400/60 text-blue-200 hover:text-white transition text-left text-xs font-semibold group"
              >
                <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 group-hover:scale-110 transition">
                  ⚡
                </span>
                <div>
                  <div>Тэги вдогонку</div>
                  <div className="text-[10px] text-neutral-400 font-normal">Короткие панчи на волне смеха</div>
                </div>
              </button>

              <button
                disabled={isLoading}
                onClick={() => handleSendPrompt('actout')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-rose-950/40 to-neutral-900 border border-rose-500/30 hover:border-rose-400/60 text-rose-200 hover:text-white transition text-left text-xs font-semibold group"
              >
                <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 group-hover:scale-110 transition">
                  🎬
                </span>
                <div>
                  <div>Акт-аут (Сценка)</div>
                  <div className="text-[10px] text-neutral-400 font-normal">Отыгрыш в лицах для сцены</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Writers' Chat & Brainstorm Table */}
        <div className="lg:col-span-3 flex flex-col h-[740px] bg-neutral-900/90 border border-neutral-800 rounded-3xl shadow-xl overflow-hidden">
          {/* Active Topic Banner */}
          <div className="bg-neutral-950/80 border-b border-neutral-800 p-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              {isEditingTopic ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={topicInput}
                    onChange={e => setTopicInput(e.target.value)}
                    placeholder="Тема разгона..."
                    className="flex-1 px-3 py-1.5 bg-neutral-900 border border-amber-500 rounded-xl text-sm text-neutral-100 focus:outline-none"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleSaveTopic()}
                  />
                  <button
                    onClick={handleSaveTopic}
                    className="px-3 py-1.5 bg-amber-500 text-neutral-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setIsEditingTopic(false)}
                    className="px-2 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingTopic(true)}
                  className="cursor-pointer group flex items-center gap-2"
                  title="Нажмите, чтобы изменить тему"
                >
                  <span className="text-amber-400 font-bold text-sm">Тема:</span>
                  <span className="font-extrabold text-sm sm:text-base text-neutral-100 group-hover:text-amber-300 transition truncate">
                    {activeSession?.topic || 'Без темы'}
                  </span>
                  <span className="text-[11px] text-neutral-500 opacity-0 group-hover:opacity-100 transition">
                    (изменить)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 hidden sm:inline">
                В комнате:
              </span>
              <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-neutral-800 border border-neutral-700 text-neutral-200 flex items-center gap-1.5">
                <span>{currentPersonaMeta.icon}</span>
                <span>{currentPersonaMeta.name}</span>
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {activeSession?.messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              const personaMeta = PERSONAS.find(p => p.id === msg.persona) || currentPersonaMeta;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-2xl shrink-0 flex items-center justify-center text-base shadow-md font-bold ${
                    isAi 
                      ? 'bg-neutral-800 border border-neutral-700 text-amber-400' 
                      : 'bg-gradient-to-tr from-rose-600 to-amber-500 text-neutral-950'
                  }`}>
                    {isAi ? personaMeta.icon : '🎤'}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`max-w-[85%] sm:max-w-[80%] space-y-2 ${isAi ? '' : 'text-right'}`}>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 px-1">
                      <span className="font-semibold text-neutral-300">
                        {isAi ? `${personaMeta.name} (${personaMeta.role})` : 'Вы (Комик)'}
                      </span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                      isAi
                        ? 'bg-neutral-950/90 border border-neutral-800 text-neutral-100 rounded-tl-sm'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-medium rounded-tr-sm shadow-amber-500/10'
                    }`}>
                      {msg.text}

                      {/* Suggested Joke Pearl Card if extracted */}
                      {isAi && (msg.suggestedPremise || msg.suggestedPunchline) && (
                        <div className="mt-3.5 pt-3 border-t border-neutral-800/80 bg-neutral-900/60 p-3 rounded-2xl border border-amber-500/20 text-left">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400" />
                              Готовая шутка в копилку:
                            </span>
                            {msg.tags && msg.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                {msg.tags.slice(0, 2).map((t, idx) => (
                                  <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {msg.suggestedPremise && (
                            <div className="text-xs text-neutral-300 mb-1">
                              <span className="text-neutral-500 font-semibold">Сетап:</span> {msg.suggestedPremise}
                            </div>
                          )}
                          {msg.suggestedPunchline && (
                            <div className="text-xs text-amber-200 font-semibold">
                              <span className="text-amber-500/80">Панчлайн:</span> {msg.suggestedPunchline}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick AI Message Actions */}
                    {isAi && (
                      <div className="flex items-center gap-1.5 pt-1 px-1 flex-wrap">
                        <button
                          onClick={() => handleSaveToJokes(msg)}
                          title="Забрать в Базу шуток"
                          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 transition"
                        >
                          {savedJokeId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>В базе шуток! ⭐</span>
                            </>
                          ) : (
                            <>
                              <Star className="w-3 h-3" />
                              <span>В шутки</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleSaveToNotebook(msg)}
                          title="Добавить в Блокнот автора"
                          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 transition"
                        >
                          {savedNoteId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>В блокноте!</span>
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3 h-3" />
                              <span>В блокнот</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          title="Скопировать текст"
                          className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Скопировано</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Копировать</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-neutral-800 border border-neutral-700 text-amber-400 shrink-0 flex items-center justify-center text-base animate-pulse">
                  {currentPersonaMeta.icon}
                </div>
                <div className="p-4 rounded-3xl bg-neutral-950/80 border border-neutral-800 rounded-tl-sm flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-neutral-400">
                    {currentPersonaMeta.name} разгоняет мысль и ищет взрывную добивку...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Voice Toolbar */}
          <div className="p-4 bg-neutral-950/90 border-t border-neutral-800 space-y-3">
            {/* Quick Prompt Starters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-neutral-400">
              <span className="shrink-0 text-[11px] font-semibold text-neutral-500">Вбросить мысль:</span>
              <button
                onClick={() => setInputMessage('А прикинь, если докрутить это до абсурда...')}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
              >
                "А прикинь, если..."
              </button>
              <button
                onClick={() => setInputMessage('Мне кажется, здесь сетап слишком длинный, как сократить?')}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
              >
                "Как сократить сетап?"
              </button>
              <button
                onClick={() => setInputMessage('Как бы на эту ситуацию отреагировал самый нелепый свидетель?')}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
              >
                "Взгляд свидетеля"
              </button>
              <button
                onClick={() => setInputMessage('Накинь 3 короткие добивки вдогонку после панча')}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
              >
                "Добивки вдогонку"
              </button>
            </div>

            {/* Input Row */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt('chat');
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? 'Остановить голосовой ввод' : 'Голосовой разгон (нажмите и говорите)'}
                className={`p-3 rounded-2xl border transition shrink-0 ${
                  isListening
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse ring-2 ring-rose-500/40'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-neutral-700'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder={isListening ? 'Слушаю вас... Говорите мысль' : 'Напишите наблюдение, сетап или реплику в разгон...'}
                className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-neutral-950 font-bold rounded-2xl transition shadow-md shadow-amber-500/20 shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
