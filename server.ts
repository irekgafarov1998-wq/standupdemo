import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint: AI auto-slicing stand-up video into viral Reels / Shorts
app.post('/api/ai/slice-reels', async (req, res) => {
  try {
    const { videoTitle, durationSec, jokes = [], markers = [], customContext = '' } = req.body;

    const jokesInfo = jokes.map((j: any, i: number) => 
      `Бит ${i + 1}: [${j.title}] (хронометраж: ~${j.durationSec || 45}с). Сетап: "${j.premise}". Панчлайн: "${j.punchline}". Реакция/Статус: ${j.status || 'нормально'}`
    ).join('\n');

    const markersInfo = markers.map((m: any) =>
      `Таймкод ${m.timestampSec}с: ${m.type === 'kill' ? '💥 РАЗРЫВ (смех зала)' : m.type === 'smile' ? '🙂 Улыбка' : m.type === 'bomb' ? '💀 Провал' : '💡 Импровизация'} - "${m.label}"`
    ).join('\n');

    // If Gemini key is set, call Gemini
    if (process.env.GEMINI_API_KEY) {
      const prompt = `Ты — профессиональный продюсер стендап-комедии и рилсмейкер (Reels/Shorts/TikTok).
Твоя задача — проанализировать стендап-выступление комика (хронометраж видео: ${Math.round(durationSec || 180)} секунд, название: "${videoTitle || 'Стендап-сет'}") и нарезать его на 3-5 вирусных вертикальных Reels/Shorts.

Материал и шутки выступления:
${jokesInfo || 'Обычное комедийное выступление с бытовыми наблюдениями и панчлайнами'}

Таймкоды реакций зала и смеха:
${markersInfo || 'Равномерный смех зала'}

Дополнительный контекст:
${customContext || 'Стендап на открытом микрофоне'}

ПРАВИЛА ДЛЯ СТЕНДАП-РИЛС:
1. Идеальная длина рилса: от 20 до 55 секунд (не больше 60 секунд!).
2. Обязательно должен содержать четкий сетап и взрывной панчлайн (желательно попадающий в таймкод с пометкой РАЗРЫВ).
3. Придумай цепляющий хук-заголовок (Hook Headline) на экран КАПСОМ с эмодзи (например: "САМЫЙ СТРАШНЫЙ ЗВОНОК ПОСЛЕ 28 ЛЕТ 💀", "КОГДА КУПИЛ РОБОТ-ПЫЛЕСОС 🤖").
4. Напиши вирусный текст поста для Instagram/TikTok/VK с актуальными комедийными хэштегами.
5. Разбей отрезок на 3-5 динамичных субтитровых фраз для караоке-анимации.

Верни строго JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reels: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING, description: 'Короткое название клипа' },
                    startTime: { type: Type.NUMBER, description: 'Время старта клипа в секундах' },
                    endTime: { type: Type.NUMBER, description: 'Время конца клипа в секундах' },
                    hookHeadline: { type: Type.STRING, description: 'Крупный заголовок хука на видео' },
                    punchlineQuote: { type: Type.STRING, description: 'Ключевая добивка' },
                    viralScore: { type: Type.NUMBER, description: 'Оценка вирусности 1-100' },
                    caption: { type: Type.STRING, description: 'Готовый текст описания для Reels с хэштегами' },
                    subtitlePhrases: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          text: { type: Type.STRING },
                          timeOffsetSec: { type: Type.NUMBER }
                        },
                        required: ['text', 'timeOffsetSec']
                      }
                    }
                  },
                  required: ['id', 'title', 'startTime', 'endTime', 'hookHeadline', 'punchlineQuote', 'viralScore', 'caption', 'subtitlePhrases']
                }
              }
            },
            required: ['reels']
          }
        }
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      return res.json(parsed);
    }

    // High quality intelligent fallback if API key is not yet set
    const fallbackReels = [
      {
        id: 'reel-1',
        title: 'Звонок стоматолога',
        startTime: 15,
        endTime: 55,
        hookHeadline: 'САМЫЙ СТРАШНЫЙ ЗВОНОК ПОСЛЕ 28 ЛЕТ 💀',
        punchlineQuote: 'Мы присмотрели путевку на Бали, оплатите наш коренной зуб',
        viralScore: 96,
        caption: 'Зубы после 28 — это отдельная статья расходов 😭\nА вам часто звонят из клиники?\n\n#стендап #юмор #комедия #стоматолог #жиза #reels',
        subtitlePhrases: [
          { text: 'Самый страшный звонок после 28 лет...', timeOffsetSec: 0 },
          { text: 'Это звонит твой стоматолог ласковым голосом', timeOffsetSec: 8 },
          { text: 'Здравствуйте, вы у нас полгода не были!', timeOffsetSec: 16 },
          { text: 'Перевод: профинансируйте нам отпуск на Бали! 🏖️', timeOffsetSec: 25 }
        ]
      },
      {
        id: 'reel-2',
        title: 'Робот-пылесос и кот',
        startTime: 60,
        endTime: 105,
        hookHeadline: 'КОГДА КУПИЛ РОБОТА-ПЫЛЕСОСА С ИИ 🤖🐈',
        punchlineQuote: 'Кот нажал кнопку ДОМОЙ и выселил его нафиг',
        viralScore: 92,
        caption: 'Технологии против кошачьей мафии 🐈⬛\nУ кого дома кот тоже буллит робота?\n\n#котики #роботпылесос #стендап #приколы #shorts',
        subtitlePhrases: [
          { text: 'Купил робот-пылесос с искусственным интеллектом', timeOffsetSec: 0 },
          { text: 'Думал, освободит время... В итоге смотрю, как он боится кота', timeOffsetSec: 10 },
          { text: 'Кот смотрит на него как на должника', timeOffsetSec: 22 },
          { text: 'Вчера кот нажал лапой "ДОМОЙ". Выселил!', timeOffsetSec: 32 }
        ]
      },
      {
        id: 'reel-3',
        title: 'Ортопедическая подушка за 12k',
        startTime: 110,
        endTime: 155,
        hookHeadline: 'ВЗРОСЛЕНИЕ — ЭТО ПОДУШКА ЗА 12 ТЫСЯЧ 🛌',
        punchlineQuote: 'Она помнит все мои позорные ошибки за 10 лет',
        viralScore: 89,
        caption: 'Эффект памяти оказался слишком злопамятным 🤦‍♂️\n#возраст #жиза #стендап #комедия #смех',
        subtitlePhrases: [
          { text: 'Самый дорогой девайс в спальне — подушка', timeOffsetSec: 0 },
          { text: 'Ортопедическая, с эффектом памяти', timeOffsetSec: 9 },
          { text: 'Только память у неё злопамятная', timeOffsetSec: 18 },
          { text: 'Просыпаешься с шеей под 90 градусов!', timeOffsetSec: 28 }
        ]
      }
    ];

    res.json({ reels: fallbackReels });
  } catch (error: any) {
    console.error('Error generating reels:', error);
    res.status(500).json({ error: error.message || 'Failed to generate reels' });
  }
});

// Endpoint: AI Standup Comedy Riffing & Writers' Room (Комедийные Разгоны с ИИ)
app.post('/api/ai/riff', async (req, res) => {
  try {
    const { 
      topic = 'Бытовая ситуация', 
      userMessage = '', 
      persona = 'observational', 
      mode = 'chat', 
      chatHistory = [],
      currentPremise = '',
      currentPunchline = '' 
    } = req.body;

    const personaDescriptions: Record<string, string> = {
      head_writer: 'Опытный шеф-редактор стендапа: строгий, ищет краткость и ритм, режет лишние вводные слова в сетапе, бьет неожиданным твердым панчем.',
      absurdist: 'Абсурдист-эскалатор: доводит любую бытовую деталь до сюрреализма, космического фарса, параноидального бреда и диких гипербол.',
      observational: 'Мастер бытовой жизы и наблюдательности: подмечает неловкие детали, стыд, привычки, вранье себе в повседневной жизни, в которых каждый узнает себя.',
      skeptic: 'Дотошный душнила-скептик: задает неудобные вопросы к логике сетапа ("А зачем ты это вообще сделал?", "Почему нельзя было просто промолчать?"), обнажая суть проблемы.',
      character_pov: 'Смена угла и адвокат оппонента: говорит от лица второго участника ситуации (кот, таксист, кассир, арендодатель, зубной врач, кроссовки комика).'
    };

    const personaDesc = personaDescriptions[persona] || personaDescriptions.observational;

    if (process.env.GEMINI_API_KEY) {
      const historyText = chatHistory.slice(-8).map((m: any) => 
        `${m.sender === 'user' ? 'Комик' : 'Соавтор-ИИ'}: "${m.text}"`
      ).join('\n');

      const systemPrompt = `Ты — первоклассный стендап-комик и соавтор в комнате комедийных разгонов (как в шоу "Разгоны" Stand-Up Club #1).
Твоя роль: ${personaDesc}
Твоя манера общения: живая, смешная, на "ты", как будто вы с комиком сидите за одним столом на вычитке материала с кофе.
Не читай лекций! Говори сразу готовыми репликами, подхватывай мысль, вбрасывай шутки, добивки и варианты отыгрыша.

Тема разгона: "${topic}"
${currentPremise ? `Текущий сетап: "${currentPremise}"` : ''}
${currentPunchline ? `Текущий панч: "${currentPunchline}"` : ''}

Режим разгона (mode): "${mode}".
- chat: отреагируй на реплику комика ("${userMessage}"), подхвати шутку, добавь 1-2 смешные идеи/сценки ("А прикинь...", "И самое дикое здесь то, что..."), и предложи готовую четкую пару Сетап/Панчлайн.
- escalate: разгони тему по 3 уровням абсурда (1: Обычный быт -> 2: Дикая эскалация -> 3: Абсолютный финал/апокалипсис).
- punchlines: предложи 3 разных хлестких панчлайна (1: слом ожидания/обманка, 2: правило трех, 3: стыдная самоирония).
- pov: напиши смешной монолог/реакцию от лица второй стороны ситуации.
- tags: дай 3-4 коротких добивки (tags) вдогонку после основного панча.
- actout: опиши короткую сценку (акт-аут) для отыгрыша на сцене с ремарками интонации и движений.`;

      const prompt = `История диалога за столом:\n${historyText || 'Начало разгона'}\n\nНовая реплика комика: "${userMessage || 'Подкинь идею, как разогнать эту тему!'}"\n\nРазгони этот материал максимально смешно!`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: 'Основная живая реплика соавтора-ИИ' },
              suggestedPremise: { type: Type.STRING, description: 'Сформулированный сетап для базы шуток' },
              suggestedPunchline: { type: Type.STRING, description: 'Сформулированный панчлайн для базы шуток' },
              tags: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: 'Короткие теги и добивки'
              },
              escalationSteps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    level: { type: Type.NUMBER },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ['level', 'title', 'description']
                }
              },
              punchlines: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    text: { type: Type.STRING }
                  },
                  required: ['type', 'text']
                }
              }
            },
            required: ['text']
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      return res.json(parsed);
    }

    // Dynamic Intelligent Standup Fallback if API key is not yet set
    const fallbackResponses: Record<string, any> = {
      chat: {
        text: `О, хорошая жиза! Тут самое смешное — это контраст между тем, как мы это планируем в голове, и каким позором всё оборачивается в реальности.\n\nПрикинь: ты стоишь с уверенным лицом эксперта, а внутри просто паника и надежда, что никто не заметит. А прикинь, если докрутить это до сценки, где тебя вызывают свидетелем на суд за эту покупку?\n\n💡 Лови готовый панч в копилку:`,
        suggestedPremise: `Каждый раз, когда я пытаюсь вести себя как взрослый человек в "${topic}"...`,
        suggestedPunchline: '...вселенная включает фоновую музыку из цирка и продает билеты моим бывшим.',
        tags: ['жиза', 'быт', 'самоирония', 'разгон']
      },
      escalate: {
        text: `Вот как эта тема эскалирует от бытовой мелочи до полного апокалипсиса:\n\n🔥 Уровень 1: Ты просто хотел сэкономить 50 рублей.\n🚀 Уровень 2: Ты уже споришь с кассиром о международном праве.\n💥 Уровень 3: Ты объявлен в международный розыск за неуплату пакета-маечки!`,
        suggestedPremise: `Все мои катастрофы начинаются с невинной мысли: "Я просто зайду на минутку"`,
        suggestedPunchline: 'Через час я стою в одном носке и объясняю наряду полиции, что пакет был подарочный.',
        escalationSteps: [
          { level: 1, title: 'Уровень 1: Бытовая мелочь', description: 'Невинная попытка решить простой вопрос за 2 минуты' },
          { level: 2, title: 'Уровень 2: Гордость и эскалация', description: 'Принцип важнее здравого смысла, подключаются случайные свидетели' },
          { level: 3, title: 'Уровень 3: Полный апокалипсис', description: 'Масштаб трагедии превышает годовой бюджет небольшого государства' }
        ],
        tags: ['эскалация', 'абсурд']
      },
      punchlines: {
        text: `Держи 3 разных угла для удара по залу:\n\n1️⃣ Слом ожидания: "Все думают, что это про деньги... На самом деле это про то, что мне лень стирать штаны".\n2️⃣ Правило трёх: "У меня было три плана: уйти красиво, сделать вид, что звонят, или упасть в обморок прямо в отделе заморозки".\n3️⃣ Стыдная правда: "Я потратил 4000 рублей только чтобы не говорить кассиру слово 'нет'"`,
        suggestedPremise: `Я понял, почему у меня не клеится взрослая жизнь:`,
        suggestedPunchline: 'Я трачу 4000 рублей только чтобы не говорить незнакомым людям слово "нет".',
        punchlines: [
          { type: 'Обманка (Misdirection)', text: 'Все думают, что я уверен в себе, но я репетирую заказ шаурмы в зеркале.' },
          { type: 'Правило трёх (Rule of 3)', text: 'С возрастом приходят три вещи: мудрость, сколиоз и любовь к скидкам на порошок.' },
          { type: 'Самоирония', text: 'Мой психолог берет деньги вперед, потому что знает, чем это закончится.' }
        ],
        tags: ['добивки', 'панч']
      },
      pov: {
        text: `А теперь посмотрим на это глазами второй стороны!\n\nПредставь монолог кассира / свидетеля:\n"Стоит парень в пуховике. Смотрит на ценник 15 минут. Лицо такое, будто ему предложили подписать ипотеку на Луне. Я уже сменой поменялся, а он всё ещё взвешивает этот несчастный банан..."`,
        suggestedPremise: 'Я всегда думаю, что меня никто не замечает. А потом ловлю взгляд кассира...',
        suggestedPunchline: '...и понимаю: я для него сегодня — бесплатный сериал про дурачка.',
        tags: ['персонаж', 'смена угла']
      },
      tags: {
        text: `Короткие добивки вдогонку (Tags), чтобы держать зал на смехе после панча:\n\n⚡ "И это еще со скидочной картой!"\n⚡ "Моя бабушка за такое бы меня переписала из завещания"\n⚡ "Теперь я живу в коробке из-под этой покупки"\n⚡ "Зато доставка была бесплатная, спасибо!"`,
        suggestedPremise: topic,
        suggestedPunchline: 'И это еще со скидочной картой любимого покупателя!',
        tags: ['теги', 'добивки вдогонку']
      },
      actout: {
        text: `Сценка для сцены (Акт-аут):\n\n[Комик отступает на шаг назад, меняет голос на вкрадчивый шёпот]\n— "Здравствуйте... А пакет у вас точно бесплатный?"\n[Делает паузу, оглядывается по сторонам]\n— "Просто у меня дома уже есть коллекция из 40 пакетов, но этот... этот особенный, в него поместится вся моя несостоявшаяся карьера!"`,
        suggestedPremise: `Стендап-акт-аут: ${topic}`,
        suggestedPunchline: 'В этот пакет поместится вся моя несостоявшаяся карьера.',
        tags: ['акт-аут', 'сценка', 'подача']
      }
    };

    const result = fallbackResponses[mode] || fallbackResponses.chat;
    res.json(result);
  } catch (error: any) {
    console.error('Error in AI riff:', error);
    res.status(500).json({ error: error.message || 'Failed to process riff' });
  }
});

// Serve public folder for app icons, favicons, manifests
app.use(express.static(path.resolve(__dirname, 'public')));

// Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StandupLab Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
