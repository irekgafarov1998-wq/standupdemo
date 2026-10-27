import React, { useState, useMemo } from 'react';
import { useStandup } from '../../context/StandupContext';
import { Gig, GigType, GigStatus } from '../../types';
import { 
  Calendar as CalendarIcon, MapPin, Navigation, Plus, Clock, 
  ExternalLink, Check, Trash2, Edit2, Star, Car, Filter, Map, List, Building2 
} from 'lucide-react';
import { StandupSectionBanner } from '../common/StandupSectionBanner';

const POPULAR_VENUES = [
  {
    name: 'Standup Club на Трубной',
    address: 'Рождественский бульвар, 10/7с1',
    city: 'Москва',
    metro: 'м. Трубная',
    coords: [55.767215, 37.625348] as [number, number]
  },
  {
    name: 'Standup Cafe (Покровка)',
    address: 'ул. Покровка, 16',
    city: 'Москва',
    metro: 'м. Чистые пруды',
    coords: [55.759325, 37.647589] as [number, number]
  },
  {
    name: 'Standup Store Moscow',
    address: 'ул. Петровка, 21',
    city: 'Москва',
    metro: 'м. Чеховская',
    coords: [55.766121, 37.615842] as [number, number]
  },
  {
    name: 'Comedy Gallery',
    address: 'ул. Мясницкая, 24',
    city: 'Москва',
    metro: 'м. Тургеневская',
    coords: [55.762812, 37.636915] as [number, number]
  },
  {
    name: 'Stage StandUp Club',
    address: 'ул. Белинского, 9',
    city: 'Санкт-Петербург',
    metro: 'м. Гостиный двор',
    coords: [59.938210, 30.347510] as [number, number]
  },
  {
    name: 'Craft & Comedy Bar',
    address: 'ул. Жуковского, 18',
    city: 'Санкт-Петербург',
    metro: 'м. Маяковская',
    coords: [59.936284, 30.354178] as [number, number]
  }
];

export const GigCalendar: React.FC = () => {
  const { gigs, setlists, addGig, updateGig, deleteGig, celebrate } = useStandup();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('20:00');
  const [formVenue, setFormVenue] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('Москва');
  const [formMetro, setFormMetro] = useState('');
  const [formType, setFormType] = useState<GigType>('open_mic');
  const [formStatus, setFormStatus] = useState<GigStatus>('scheduled');
  const [formSetlistId, setFormSetlistId] = useState('');
  const [formAllottedMinutes, setFormAllottedMinutes] = useState(5);
  const [formFee, setFormFee] = useState(0);
  const [formReview, setFormReview] = useState('');
  const [formRating, setFormRating] = useState(0);

  const filteredGigs = useMemo(() => {
    return gigs
      .filter(g => {
        if (selectedStatus !== 'all' && g.status !== selectedStatus) return false;
        return true;
      })
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  }, [gigs, selectedStatus]);

  const handleOpenAdd = () => {
    setEditingGig(null);
    setFormTitle('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('20:00');
    setFormVenue('');
    setFormAddress('');
    setFormCity('Москва');
    setFormMetro('');
    setFormType('open_mic');
    setFormStatus('scheduled');
    setFormSetlistId(setlists[0]?.id || '');
    setFormAllottedMinutes(5);
    setFormFee(0);
    setFormReview('');
    setFormRating(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (gig: Gig) => {
    setEditingGig(gig);
    setFormTitle(gig.title);
    setFormDate(gig.date);
    setFormTime(gig.time);
    setFormVenue(gig.venue);
    setFormAddress(gig.address || '');
    setFormCity(gig.city);
    setFormMetro(gig.metroStation || '');
    setFormType(gig.type);
    setFormStatus(gig.status);
    setFormSetlistId(gig.setlistId || '');
    setFormAllottedMinutes(gig.allottedMinutes);
    setFormFee(gig.fee || 0);
    setFormReview(gig.reviewNotes || '');
    setFormRating(gig.rating || 0);
    setIsModalOpen(true);
  };

  const handleSelectVenuePreset = (venue: typeof POPULAR_VENUES[0]) => {
    setFormVenue(venue.name);
    setFormAddress(venue.address);
    setFormCity(venue.city);
    setFormMetro(venue.metro);
  };

  const handleSaveGig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formVenue.trim()) return;

    const query = encodeURIComponent(`${formVenue} ${formAddress} ${formCity}`);
    const yandexMapsUrl = `https://yandex.ru/maps/?text=${query}`;

    const preset = POPULAR_VENUES.find(p => p.name === formVenue);
    const coords = preset ? preset.coords : undefined;

    if (editingGig) {
      updateGig(editingGig.id, {
        title: formTitle.trim(),
        date: formDate,
        time: formTime,
        venue: formVenue.trim(),
        address: formAddress.trim(),
        city: formCity.trim(),
        metroStation: formMetro.trim(),
        coords,
        yandexMapsUrl,
        type: formType,
        status: formStatus,
        setlistId: formSetlistId || undefined,
        allottedMinutes: Number(formAllottedMinutes) || 5,
        fee: Number(formFee) || 0,
        reviewNotes: formReview.trim(),
        rating: Number(formRating) || 0
      });
    } else {
      addGig({
        title: formTitle.trim(),
        date: formDate,
        time: formTime,
        venue: formVenue.trim(),
        address: formAddress.trim(),
        city: formCity.trim(),
        metroStation: formMetro.trim(),
        coords,
        yandexMapsUrl,
        type: formType,
        status: formStatus,
        setlistId: formSetlistId || undefined,
        allottedMinutes: Number(formAllottedMinutes) || 5,
        fee: Number(formFee) || 0,
        reviewNotes: formReview.trim(),
        rating: Number(formRating) || 0
      });
      celebrate();
    }

    setIsModalOpen(false);
  };

  const getStatusBadge = (status: GigStatus) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Подтверждено', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'scheduled':
        return { label: 'Запланировано', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'completed':
        return { label: 'Выступил', bg: 'bg-neutral-800 text-neutral-400 border-neutral-700' };
      case 'cancelled':
        return { label: 'Отменено', bg: 'bg-red-500/20 text-red-300 border-red-500/40' };
    }
  };

  const getTypeLabel = (type: GigType) => {
    switch (type) {
      case 'open_mic': return 'Открытый микрофон';
      case 'check_in': return 'Проверочный вечер';
      case 'showcase': return 'Сборный концерт';
      case 'solo': return 'Сольный концерт';
      case 'festival': return 'Фестиваль комедии';
      default: return 'Выступление';
    }
  };

  // Helper to open Yandex Maps route directly
  const openYandexRoute = (gig: Gig) => {
    const dest = encodeURIComponent(`${gig.city}, ${gig.address || gig.venue}`);
    const url = `https://yandex.ru/maps/?rtext=~${dest}&rtt=auto`;
    window.open(url, '_blank');
  };

  const openYandexTaxi = (gig: Gig) => {
    const dest = encodeURIComponent(`${gig.city}, ${gig.address || gig.venue}`);
    const url = `https://taxi.yandex.ru/?end-lat=${gig.coords ? gig.coords[0] : ''}&end-lon=${gig.coords ? gig.coords[1] : ''}&tariff=econom`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Standup Broadway Marquee Billboard Banner */}
      <StandupSectionBanner
        tab="calendar"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-black/80 p-1 rounded-xl border border-amber-900/60 text-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  viewMode === 'list' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Список</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  viewMode === 'map' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Яндекс Карта</span>
              </button>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить гиг</span>
            </button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: 'Все выступления' },
          { id: 'scheduled', label: 'Запланировано' },
          { id: 'confirmed', label: 'Подтверждено' },
          { id: 'completed', label: 'Выступил' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              selectedStatus === tab.id
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VIEW: MAP MODE (Integrated Yandex Maps Experience) */}
      {viewMode === 'map' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold">📍</span>
              <h3 className="text-sm font-bold text-neutral-200">
                Карта стендап-площадок (Яндекс Карты)
              </h3>
            </div>
            <span className="text-xs text-neutral-400">
              Нажмите на площадку для перехода к маршруту и деталям
            </span>
          </div>

          {/* Embedded Interactive Yandex Maps Iframe */}
          <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-950">
            <iframe
              title="Яндекс Карты Стендап Клубы"
              src="https://yandex.ru/map-widget/v1/?ll=37.625348%2C55.765215&z=13&pt=37.625348,55.767215,pm2rdm~37.647589,55.759325,pm2blm~37.615842,55.766121,pm2ywm"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen={true}
              className="w-full h-full filter invert-[0.9] hue-rotate-180 contrast-125"
            />

            {/* Floating Venue Cards Overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex gap-3 overflow-x-auto pb-1 pointer-events-auto">
              {filteredGigs.map(gig => (
                <div
                  key={gig.id}
                  onClick={() => setSelectedGig(gig)}
                  className="min-w-[280px] bg-neutral-950/95 backdrop-blur-md border border-neutral-800 p-3.5 rounded-xl shadow-2xl text-left cursor-pointer hover:border-amber-500/50 transition shrink-0"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-amber-400 truncate">
                      {gig.venue}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {gig.time}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-200 font-medium truncate">
                    {gig.title}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    📍 {gig.address || gig.city} {gig.metroStation ? `(${gig.metroStation})` : ''}
                  </p>
                  <div className="mt-2 pt-2 border-t border-neutral-800 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openYandexRoute(gig);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Маршрут</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openYandexTaxi(gig);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-yellow-400 hover:text-yellow-300"
                    >
                      <Car className="w-3 h-3" />
                      <span>Яндекс Go</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: LIST MODE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGigs.map(gig => {
          const statusStyle = getStatusBadge(gig.status);
          const setlist = gig.setlistId ? setlists.find(s => s.id === gig.setlistId) : null;

          return (
            <div
              key={gig.id}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 flex flex-col justify-between transition shadow-sm hover:shadow-md"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusStyle.bg}`}>
                    {statusStyle.label}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    ⏱️ {gig.allottedMinutes} мин
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-neutral-100 mb-1">
                  {gig.title}
                </h3>
                <span className="text-xs text-amber-400/90 font-medium block mb-3">
                  {getTypeLabel(gig.type)}
                </span>

                {/* Date & Time */}
                <div className="flex items-center gap-4 text-xs text-neutral-300 mb-3 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/60 font-mono">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span>{new Date(gig.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{gig.time}</span>
                  </div>
                </div>

                {/* Venue & Yandex Maps Info */}
                <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-2 mb-3">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-200">
                        <Building2 className="w-3.5 h-3.5 text-red-500" />
                        <span>{gig.venue}</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {gig.address ? `${gig.city}, ${gig.address}` : gig.city}
                      </p>
                      {gig.metroStation && (
                        <span className="text-[10px] text-sky-400 font-semibold block mt-0.5">
                          🚇 {gig.metroStation}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Yandex Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
                    <button
                      onClick={() => openYandexRoute(gig)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 text-neutral-200 hover:text-amber-300 text-xs font-bold rounded-lg transition"
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      <span>Маршрут</span>
                    </button>
                    <button
                      onClick={() => openYandexTaxi(gig)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-yellow-400 text-xs font-bold rounded-lg transition"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Яндекс Go</span>
                    </button>
                  </div>
                </div>

                {/* Linked Setlist */}
                {setlist && (
                  <div className="text-xs text-neutral-400 bg-neutral-950/40 p-2 rounded-lg border border-neutral-800/40 mb-3 flex items-center justify-between">
                    <span>Сет-лист:</span>
                    <span className="font-semibold text-neutral-200 truncate">{setlist.title}</span>
                  </div>
                )}

                {/* Review if completed */}
                {gig.reviewNotes && (
                  <div className="text-xs text-neutral-400 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-amber-400">Отзыв о выступлении:</span>
                      {gig.rating ? <span className="font-mono text-amber-300 font-bold">⭐ {gig.rating}/10</span> : null}
                    </div>
                    <p className="line-clamp-2 leading-relaxed">{gig.reviewNotes}</p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-300">
                  {gig.fee ? `${gig.fee.toLocaleString('ru-RU')} ₽` : 'Без гонорара'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(gig)}
                    className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition"
                    title="Редактировать"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Удалить выступление?')) deleteGig(gig.id);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGigs.length === 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center space-y-3">
          <CalendarIcon className="w-12 h-12 text-neutral-700 mx-auto" />
          <p className="text-sm text-neutral-400">Выступлений в этой категории нет</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl"
          >
            Запланировать выступление
          </button>
        </div>
      )}

      {/* Add / Edit Gig Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-xl w-full text-neutral-100 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-neutral-100 mb-4">
              {editingGig ? 'Редактировать выступление' : 'Запланировать новое выступление'}
            </h3>

            {/* Popular Russian Comedy Clubs Presets */}
            <div className="mb-4 p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Быстрый выбор стендап-клуба (Яндекс.Карты):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_VENUES.map(v => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => handleSelectVenuePreset(v)}
                    className="px-2.5 py-1 text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 border border-neutral-800 rounded-lg transition"
                  >
                    📍 {v.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveGig} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Название события</label>
                <input
                  type="text"
                  required
                  placeholder="например: Открытый микрофон, Money Mic, Сольный блок..."
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Дата</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Время сбора</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                  />
                </div>
              </div>

              {/* Venue & Address */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Клуб / Бар</label>
                  <input
                    type="text"
                    required
                    placeholder="Standup Club #1..."
                    value={formVenue}
                    onChange={e => setFormVenue(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Город</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={e => setFormCity(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Точный адрес (Яндекс Карты)</label>
                  <input
                    type="text"
                    placeholder="Рождественский бульвар, 10/7..."
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Ближайшее метро</label>
                  <input
                    type="text"
                    placeholder="м. Трубная..."
                    value={formMetro}
                    onChange={e => setFormMetro(e.target.value)}
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                  />
                </div>
              </div>

              {/* Type, Setlist & Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Формат</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as GigType)}
                    className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                  >
                    <option value="open_mic">Открытый микрофон</option>
                    <option value="check_in">Проверочный вечер</option>
                    <option value="showcase">Сборный концерт</option>
                    <option value="solo">Сольный концерт</option>
                    <option value="festival">Фестиваль</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Сет-лист</label>
                  <select
                    value={formSetlistId}
                    onChange={e => setFormSetlistId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                  >
                    <option value="">Не выбран</option>
                    {setlists.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Статус</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as GigStatus)}
                    className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                  >
                    <option value="scheduled">Запланировано</option>
                    <option value="confirmed">Подтверждено</option>
                    <option value="completed">Выступил</option>
                    <option value="cancelled">Отменено</option>
                  </select>
                </div>
              </div>

              {/* Timing & Fee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Время на сцене (минут)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={formAllottedMinutes}
                    onChange={e => setFormAllottedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Гонорар (₽)</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={formFee}
                    onChange={e => setFormFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                  />
                </div>
              </div>

              {/* Review notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Заметки / Итоги выступления
                </label>
                <textarea
                  rows={2}
                  value={formReview}
                  onChange={e => setFormReview(e.target.value)}
                  placeholder="Как зашел материал, реакция зала..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition"
                >
                  {editingGig ? 'Сохранить изменения' : 'Добавить выступление'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
