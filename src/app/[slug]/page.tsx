"use client";

import { useState } from "react";
import { CalendarDays, Clock, MapPin, ChevronLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";
import { tr } from "date-fns/locale";

// Mock Data
const BUSINESS = {
  name: "Dr. Ahmet Yılmaz",
  category: "Diş Hekimi",
  location: "Kadıköy, İstanbul",
  services: [
    { id: 1, name: "İmplant Konsültasyonu", duration: "30 Dk", desc: "Ücretsiz ön muayene ve planlama" },
    { id: 2, name: "Kanal Tedavisi Kontrolü", duration: "45 Dk", desc: "Rutin kontrol ve röntgen" },
    { id: 3, name: "Diş Taşı Temizliği", duration: "30 Dk", desc: "Detartraj işlemi" },
  ]
};

const TIME_SLOTS = ["09:00", "09:30", "10:30", "11:00", "13:30", "14:00", "15:45", "16:30"];

export default function BookingPage({ params }: { params: { slug: string } }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const today = startOfToday();
  const nextDates = Array.from({ length: 7 }).map((_, i) => addDays(today, i));

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Sol Panel: İşletme Özeti */}
        <div className="bg-slate-50/50 border-r border-slate-200 p-8 md:w-1/3 flex flex-col">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl font-bold">{BUSINESS.name.charAt(0)}</span>
          </div>
          <p className="text-sm font-semibold text-indigo-600 mb-1">{BUSINESS.category}</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{BUSINESS.name}</h1>
          
          <div className="space-y-4 text-sm text-slate-600 mt-4 flex-1">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-400" />
              <span>{BUSINESS.location}</span>
            </div>
            {selectedService && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <span>{selectedService.duration} Yüz Yüze Görüşme</span>
              </div>
            )}
            {selectedTime && (
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                  {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}<br/>
                  Saat: {selectedTime}
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-400 text-center">Powered by <strong>randevuformu.com</strong></p>
          </div>
        </div>

        {/* Sağ Panel: Akış (Progressive Disclosure) */}
        <div className="p-8 md:w-2/3">
          
          {/* Adım 1: Hizmet Seçimi */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Hizmet Seçiniz</h2>
              <div className="space-y-3">
                {BUSINESS.services.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => { setSelectedService(s); handleNext(); }}
                    className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{s.name}</p>
                      <p className="text-sm text-slate-500 mt-1">{s.desc} • {s.duration}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Adım 2: Tarih ve Saat Seçimi */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={handlePrev} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-slate-900">Tarih ve Saat Seçimi</h2>
              </div>
              
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-700 mb-3">Yaklaşan Günler</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {nextDates.map((date, i) => {
                    const isSelected = selectedDate.getDate() === date.getDate();
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 w-16 h-20 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        <span className={`text-xs ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {format(date, "EEE", { locale: tr })}
                        </span>
                        <span className="text-xl font-bold mt-1">{format(date, "d")}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Müsait Saatler</p>
                <div className="grid grid-cols-3 gap-3">
                  {TIME_SLOTS.map(time => (
                    <button
                      key={time}
                      onClick={() => { setSelectedTime(time); handleNext(); }}
                      className="py-3 px-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:border-indigo-600 hover:text-indigo-600 transition-colors focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Adım 3: İletişim Bilgileri */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={handlePrev} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-slate-900">İletişim Bilgileriniz</h2>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Ad Soyad</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-slate-900 placeholder:text-slate-400" placeholder="Örn: Ayşe Demir" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Telefon Numarası</label>
                  <input required type="tel" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-slate-900 placeholder:text-slate-400" placeholder="05XX XXX XX XX" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Not (Opsiyonel)</label>
                  <textarea rows={3} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all text-slate-900 resize-none"></textarea>
                </div>
                
                <button type="submit" className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
                  Randevuyu Onayla
                </button>
              </form>
            </div>
          )}

          {/* Adım 4: Başarılı */}
          {step === 4 && (
            <div className="animate-in zoom-in duration-300 text-center py-10">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Randevunuz Onaylandı!</h2>
              <p className="text-slate-500 mb-8">Randevu detaylarınız WhatsApp üzerinden telefonunuza gönderilmiştir.</p>
              
              <button onClick={() => setStep(1)} className="text-indigo-600 font-medium hover:underline">
                Yeni bir randevu al
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
