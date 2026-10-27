import React, { useState, useRef } from 'react';
import { Setlist, Joke } from '../../types';
import { formatSeconds, formatMinutesHuman, calculateSetlistDuration } from '../../utils/formatters';
import { X, Printer, Download, Copy, Check, FileText, Settings2, Sparkles, Clock, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SetlistPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  setlist: Setlist;
  jokes: Joke[];
}

export const SetlistPdfModal: React.FC<SetlistPdfModalProps> = ({
  isOpen,
  onClose,
  setlist,
  jokes
}) => {
  const [formatType, setFormatType] = useState<'full' | 'compact'>('full');
  const [showDeliveryNotes, setShowDeliveryNotes] = useState(true);
  const [showPunchlines, setShowPunchlines] = useState(true);
  const [showCumulativeTime, setShowCumulativeTime] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  const printSheetRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const totalDurationSec = calculateSetlistDuration(setlist.items, jokes);
  const targetDurationSec = (setlist.targetDurationMinutes || 5) * 60;

  // Cumulative time tracking helper
  let cumulativeTracker = 0;
  const itemsWithCumulative = setlist.items.map(item => {
    const joke = item.jokeId ? jokes.find(j => j.id === item.jokeId) : null;
    const dur = item.durationSec || joke?.durationSec || 45;
    const startSec = cumulativeTracker;
    cumulativeTracker += dur;
    return {
      ...item,
      joke,
      duration: dur,
      startSec,
      endSec: cumulativeTracker
    };
  });

  // Native Browser Print (which also allows saving as native vector PDF)
  const handleNativePrint = () => {
    window.print();
  };

  // Direct PDF generation and download via html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!printSheetRef.current) return;
    setIsExportingPdf(true);

    try {
      const element = printSheetRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // high DPI
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page if setlist is long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${setlist.title.replace(/[\s/\\?%*:|"<>]/g, '_')}_сценарий.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Ошибка при генерации PDF. Попробуйте нажать "Печать" и выбрать "Сохранить как PDF".');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCopyText = () => {
    let text = `📜 СЦЕНАРИЙ ВЫСТУПЛЕНИЯ: ${setlist.title}\n`;
    text += `Хронометраж: ${formatMinutesHuman(totalDurationSec)} из ${setlist.targetDurationMinutes} мин\n\n`;
    itemsWithCumulative.forEach((it, idx) => {
      const title = it.customTitle || it.joke?.title || 'Без названия';
      text += `${idx + 1}. [${formatSeconds(it.startSec)} - ${formatSeconds(it.endSec)}] ${title}\n`;
      if (it.joke) {
        text += `   Сетап: ${it.joke.premise}\n`;
        text += `   Панч: ${it.joke.punchline}\n`;
      }
      if (it.customText) {
        text += `   Текст: ${it.customText}\n`;
      }
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl text-neutral-100 my-6 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4 bg-neutral-950/70 shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
              📄
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-100">
                Экспорт сет-листа в PDF для печати
              </h2>
              <p className="text-xs text-neutral-400">
                Распечатай сценарий выступления или компактную шпаргалку на сцену
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition text-xs font-semibold flex items-center gap-1.5"
              title="Скопировать текст"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Скопировано!' : 'Текст'}</span>
            </button>

            <button
              onClick={handleNativePrint}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl transition flex items-center gap-2"
              title="Открыть диалог печати браузера"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Печать / Native PDF</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'Создание PDF...' : 'Скачать PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization Options Bar */}
        <div className="px-6 py-3 border-b border-neutral-800 bg-neutral-950/40 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 no-print">
          {/* Format Selector */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-semibold">Формат документа:</span>
            <div className="flex items-center bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
              <button
                onClick={() => setFormatType('full')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  formatType === 'full'
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                📋 Полный сценарий (A4)
              </button>
              <button
                onClick={() => setFormatType('compact')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  formatType === 'compact'
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                📜 Шпаргалка на сцену
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4 text-neutral-400">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-neutral-200">
              <input
                type="checkbox"
                checked={showCumulativeTime}
                onChange={e => setShowCumulativeTime(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span>Таймкоды (00:00 - 05:00)</span>
            </label>

            {formatType === 'full' && (
              <>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-neutral-200">
                  <input
                    type="checkbox"
                    checked={showPunchlines}
                    onChange={e => setShowPunchlines(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Панчлайны</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer hover:text-neutral-200">
                  <input
                    type="checkbox"
                    checked={showDeliveryNotes}
                    onChange={e => setShowDeliveryNotes(e.target.checked)}
                    className="accent-amber-500 rounded"
                  />
                  <span>Сценическая подача</span>
                </label>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-950 flex justify-center">
          {/* THE ACTUAL PRINTABLE DOCUMENT (Light / Paper Theme for Crisp Printing & PDF Export) */}
          <div
            id="printable-setlist-sheet"
            ref={printSheetRef}
            className="w-full max-w-[800px] bg-white text-neutral-900 rounded-xl p-8 sm:p-10 shadow-2xl font-sans"
            style={{ minHeight: '1050px' }}
          >
            {/* Document Header */}
            <div className="border-b-2 border-neutral-900 pb-5 mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-neutral-500">
                    STANDUPLAB • СЦЕНИЧЕСКИЙ СЦЕНАРИЙ
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight">
                  {setlist.title}
                </h1>
                {setlist.description && (
                  <p className="text-xs text-neutral-600 mt-1 italic">
                    {setlist.description}
                  </p>
                )}
              </div>

              {/* Timing Badge */}
              <div className="text-right border border-neutral-300 rounded-xl p-3 bg-neutral-50">
                <span className="text-[11px] uppercase font-bold text-neutral-500 block">
                  Хронометраж выступления
                </span>
                <span className="text-lg font-mono font-black text-neutral-900">
                  {formatSeconds(totalDurationSec)} / {formatSeconds(targetDurationSec)}
                </span>
                <span className="text-[11px] font-semibold text-neutral-600 block mt-0.5">
                  ({setlist.items.length} битов • {setlist.targetDurationMinutes} мин лимит)
                </span>
              </div>
            </div>

            {/* Stage Mindset & Notes Banner */}
            {setlist.stageNotes && (
              <div className="mb-6 p-3.5 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl print-page-break">
                <span className="text-[11px] font-black uppercase text-amber-900 block mb-0.5">
                  ⚡ ЗАМЕТКИ ПЕРЕД ВЫХОДОМ НА СЦЕНУ:
                </span>
                <p className="text-xs font-medium text-amber-950 leading-relaxed">
                  {setlist.stageNotes}
                </p>
              </div>
            )}

            {/* FORMAT 1: FULL SCRIPT (Detailed Table & Cards) */}
            {formatType === 'full' ? (
              <div className="space-y-4">
                {itemsWithCumulative.map((item, idx) => {
                  const title = item.customTitle || item.joke?.title || 'Без названия';
                  return (
                    <div
                      key={item.id}
                      className="border border-neutral-300 rounded-xl p-4 bg-neutral-50/50 print-page-break space-y-2.5"
                    >
                      {/* Beat header */}
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-md bg-neutral-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h3 className="text-sm font-black text-neutral-900">
                            {title}
                          </h3>
                          {item.joke?.category && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-200 text-neutral-700 font-semibold uppercase">
                              {item.joke.category}
                            </span>
                          )}
                        </div>

                        {showCumulativeTime && (
                          <div className="text-xs font-mono font-bold text-neutral-700">
                            <span>{formatSeconds(item.startSec)}</span>
                            <span className="text-neutral-400 mx-1">→</span>
                            <span className="text-neutral-950">{formatSeconds(item.endSec)}</span>
                            <span className="text-neutral-500 font-normal ml-1.5">({item.duration}с)</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      {item.customText ? (
                        <p className="text-xs text-neutral-800 font-medium leading-relaxed italic bg-sky-50/70 p-2.5 rounded-lg border border-sky-100">
                          {item.customText}
                        </p>
                      ) : item.joke ? (
                        <div className="space-y-2 text-xs">
                          {/* Premise */}
                          <div className="text-neutral-700 leading-relaxed">
                            <span className="font-bold text-neutral-900 mr-1.5">Сетап:</span>
                            {item.joke.premise}
                          </div>

                          {/* Punchline */}
                          {showPunchlines && (
                            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200/80 text-amber-950 font-bold leading-relaxed">
                              <span className="text-[10px] uppercase font-black text-amber-800 block mb-0.5">
                                ПАНЧЛАЙН:
                              </span>
                              {item.joke.punchline}
                            </div>
                          )}

                          {/* Tags / Callbacks */}
                          {item.joke.tags && item.joke.tags.length > 0 && (
                            <div className="text-[11px] text-neutral-500 flex flex-wrap gap-1">
                              <span className="font-semibold text-neutral-600">Теги / Добивки:</span>
                              {item.joke.tags.map((t, i) => (
                                <span key={i} className="bg-neutral-200 text-neutral-700 px-1.5 py-0.2 rounded text-[10px]">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}

                      {/* Delivery Notes */}
                      {showDeliveryNotes && (item.notes || item.joke?.notes) && (
                        <div className="text-[11px] text-neutral-600 bg-neutral-100 p-2 rounded-lg border border-neutral-200">
                          <span className="font-bold text-neutral-800 mr-1">🎙️ Подача:</span>
                          {item.notes || item.joke?.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* FORMAT 2: COMPACT STAGE CHEAT-SHEET (Minimalist quick lookup for stage) */
              <div className="border-2 border-neutral-900 rounded-xl overflow-hidden divide-y divide-neutral-300">
                {itemsWithCumulative.map((item, idx) => {
                  const title = item.customTitle || item.joke?.title || 'Без названия';
                  const punchHint = item.joke?.punchline || item.customText || '';

                  return (
                    <div key={item.id} className="p-3.5 flex items-start justify-between gap-4 bg-white print-page-break">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-md bg-neutral-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-sm font-black text-neutral-950">
                            {title}
                          </div>
                          {punchHint && (
                            <div className="text-xs text-neutral-700 font-semibold mt-0.5 line-clamp-1 text-amber-900">
                              👉 {punchHint}
                            </div>
                          )}
                        </div>
                      </div>

                      {showCumulativeTime && (
                        <div className="text-xs font-mono font-bold text-neutral-800 shrink-0 text-right">
                          <span>{formatSeconds(item.startSec)}</span>
                          <span className="text-neutral-400 block text-[10px] font-normal">
                            +{item.duration}с
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Document Footer */}
            <div className="mt-8 pt-4 border-t border-neutral-300 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
              <span>Сгенерировано в StandupLab PRO</span>
              <span>{new Date().toLocaleDateString('ru-RU')} • Удачи на сцене! 🎤</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
