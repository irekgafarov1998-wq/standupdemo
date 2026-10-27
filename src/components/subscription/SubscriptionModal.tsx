import React, { useState } from 'react';
import { useStandup } from '../../context/StandupContext';
import { X, Check, Sparkles, ShieldCheck, Zap, ArrowRight, CreditCard, RotateCcw } from 'lucide-react';
import { StandupAppIcon } from '../common/StandupAppIcon';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  reason
}) => {
  const { isPro, proExpiryDate, upgradeToPro, downgradeToBasic, celebrate } = useStandup();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleActivatePro = () => {
    setIsProcessing(true);
    setTimeout(() => {
      upgradeToPro();
      setIsProcessing(false);
      setPaymentSuccess(true);
      celebrate();
      setTimeout(() => {
        setPaymentSuccess(false);
        onClose();
      }, 1800);
    }, 1000);
  };

  const handleSwitchToBasic = () => {
    downgradeToBasic();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl text-neutral-100 my-6 p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <StandupAppIcon size={56} className="mx-auto mb-2" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Тарифы для стендап-комиков</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-neutral-100 tracking-tight">
            {isPro ? 'Ваша подписка активна' : 'Снимите ограничения на шутки'}
          </h2>

          {reason ? (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs font-semibold">
              ⚠️ {reason}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              В базовой версии действует ограничение: не более 10 шуток в любой категории. Оформите подписку на полгода всего за 250 рублей!
            </p>
          )}
        </div>

        {/* Two Plans Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Basic Plan */}
          <div className={`p-4 rounded-2xl border transition text-left flex flex-col justify-between ${
            !isPro
              ? 'bg-neutral-950/80 border-amber-500/50 ring-1 ring-amber-500/30'
              : 'bg-neutral-950/40 border-neutral-800 opacity-70'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-neutral-200">Базовый режим</h3>
                {!isPro && (
                  <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-bold">
                    Текущий
                  </span>
                )}
              </div>
              <div className="text-2xl font-black text-neutral-100 mb-3">0 ₽</div>

              <ul className="space-y-2 text-xs text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Ограничение до 10 шуток в любой категории</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Ограничение на написание заметок (до 10 штук)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span className="font-semibold text-neutral-300">Только 3 создания рилса с помощью ИИ</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Базовый таймер выступлений</span>
                </li>
              </ul>
            </div>

            {isPro && (
              <button
                onClick={handleSwitchToBasic}
                className="mt-4 w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl text-xs font-semibold transition"
              >
                Включить Базовый
              </button>
            )}
          </div>

          {/* Premium 6 Months Plan */}
          <div className={`p-4 rounded-2xl border transition text-left flex flex-col justify-between relative ${
            isPro
              ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/40'
              : 'bg-gradient-to-b from-neutral-950 to-amber-950/20 border-amber-500/40'
          }`}>
            <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
              Выгодно
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-amber-300">Подписка на полгода</h3>
                {isPro && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    Активна
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-2xl font-black text-amber-300">250 ₽</span>
                <span className="text-xs text-neutral-400">/ 6 месяцев (полгода)</span>
              </div>

              <ul className="space-y-2 text-xs text-neutral-200">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="font-bold text-amber-200">Безлимитные шутки во всех категориях</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Безлимитный блокнот автора</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="font-bold text-amber-200">Безлимитная AI нарезка Reels (вместо 3 штук)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Синхронизация с Telegram, YouTube, VK, TikTok</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Экспорт сет-листов в PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Яндекс Карты и маршруты выступлений</span>
                </li>
              </ul>
            </div>

            {!isPro && (
              <button
                onClick={handleActivatePro}
                disabled={isProcessing}
                className="mt-4 w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Активация...' : 'Оформить за 250 ₽'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status message */}
        {paymentSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>Подписка успешно оформлена на 6 месяцев! Все ограничения сняты.</span>
          </div>
        )}

        {isPro && proExpiryDate && (
          <div className="text-center text-xs text-neutral-400 pt-2 border-t border-neutral-800">
            Подписка действует до: <span className="font-mono text-amber-300 font-bold">{proExpiryDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};
