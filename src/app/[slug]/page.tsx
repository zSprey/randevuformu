"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Clock, MapPin, ChevronLeft, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { format, addDays, startOfToday } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import SchemaMarkup from "@/components/SchemaMarkup";

const TIME_SLOTS = ["09:00", "09:30", "10:30", "11:00", "13:30", "14:00", "15:45", "16:30"];

export default function BookingPage({ params }: { params: { slug: string } }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); 
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [businessData, setBusinessData] = useState<any>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchBusiness() {
      const { data, error } = await supabase
        .from('businesses')
        .select('*, services(*)')
        .eq('slug', params.slug)
        .single();
      
      if (data) {
        setBusinessData(data);
      }
      setLoading(false);
    }
    fetchBusiness();
  }, [params.slug]);

  const today = startOfToday();
  const nextDates = Array.from({ length: 14 }).map((_, i) => addDays(today, i));

  const handleNext = () => { setDirection(1); setStep(s => s + 1); };
  const handlePrev = () => { setDirection(-1); setStep(s => s - 1); };

  const submitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('appointments')
      .insert([
        {
          business_id: businessData.id,
          service_id: selectedService.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_note: customerNote,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedTime,
        }
      ]);

    setIsSubmitting(false);
    if (!error) {
      handleNext(); 
    } else {
      alert("Randevu oluşturulurken bir hata oluştu.");
    }
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 30 : -30, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 30 : -30, opacity: 0 })
  };

  if (loading) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
  if (!businessData) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-xl font-bold text-slate-800">İşletme bulunamadı!</div>;

  const BUSINESS = businessData;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-indigo-100 selection:text-indigo-900 py-12 px-4 flex items-center justify-center relative overflow-hidden">
      <SchemaMarkup 
        type="LocalBusiness" 
        data={{
          name: BUSINESS.name,
          url: `https://randevuformu.com/${BUSINESS.slug}`,
          image: `https://randevuformu.com/og-image.jpg`,
          address: "Türkiye", // Ideally from DB, defaulting for now
          department: BUSINESS.category
        }} 
      />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-100 to-transparent -z-10" />
      
      <div className="max-w-[1000px] w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        <div className="bg-slate-50/50 p-8 md:p-10 md:w-[380px] border-r border-slate-100 flex flex-col relative overflow-hidden">
          <div className="absolute top-10 left-10 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none" />
          <div className="w-16 h-16 bg-white shadow-sm border border-slate-200 text-slate-900 rounded-2xl flex items-center justify-center mb-6 z-10">
            <span className="text-2xl font-extrabold">{BUSINESS.name.charAt(0)}</span>
          </div>
          <p className="text-xs font-bold tracking-wider uppercase text-indigo-600 mb-2 z-10">{BUSINESS.category}</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight z-10">{BUSINESS.name}</h1>
          
          <div className="space-y-5 text-sm text-slate-600 flex-1 z-10 font-medium">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-400" />
              <span>Sistemde Kayıtlı</span>
            </div>
            
            <AnimatePresence mode="popLayout">
              {selectedService && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span>{selectedService.duration_minutes} Dk Yüz Yüze</span>
                </motion.div>
              )}
              {selectedTime && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-start gap-3 mt-4 p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl">
                  <CalendarDays className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span className="font-semibold text-indigo-900 leading-snug">
                    {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}<br/>
                    <span className="text-indigo-600">Saat: {selectedTime}</span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-8 md:p-10 md:flex-1 relative bg-white">
          <AnimatePresence custom={direction} mode="wait">
            
            {step === 1 && (
              <motion.div key="step1" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="h-full flex flex-col">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Hizmet Seçiniz</h2>
                <p className="text-slate-500 font-medium mb-8">Randevu almak istediğiniz işlemi seçin.</p>
                <div className="space-y-3">
                  {BUSINESS.services.map((s: any) => (
                    <motion.button key={s.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => { setSelectedService(s); handleNext(); }} className="w-full text-left p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-[0_4px_20px_rgb(99,102,241,0.1)] transition-all group flex justify-between items-center bg-white">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-slate-900 text-lg">{s.name}</p>
                          <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{s.price_text}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">{s.description} • {s.duration_minutes} Dk</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="h-full flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={handlePrev} className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"><ArrowLeft className="w-5 h-5" /></button>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tarih ve Saat</h2>
                    <p className="text-sm font-medium text-slate-500">Size en uygun zamanı seçin.</p>
                  </div>
                </div>
                <div className="mb-8">
                  <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {nextDates.map((date, i) => {
                      const isSelected = selectedDate.getDate() === date.getDate();
                      if(date.getDay() === 0) return null;
                      return (
                        <button key={i} onClick={() => setSelectedDate(date)} className={`snap-start flex-shrink-0 w-20 h-24 rounded-2xl border flex flex-col items-center justify-center transition-all ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'}`}>
                          <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>{format(date, "EEE", { locale: tr })}</span>
                          <span className="text-2xl font-extrabold">{format(date, "d")}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {TIME_SLOTS.map(time => (
                      <motion.button key={time} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedTime(time); handleNext(); }} className="py-3 px-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:border-indigo-600 hover:text-indigo-600 hover:shadow-sm transition-all focus:ring-2 focus:ring-indigo-600 focus:outline-none">{time}</motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="h-full flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={handlePrev} className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"><ArrowLeft className="w-5 h-5" /></button>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bilgileriniz</h2>
                    <p className="text-sm font-medium text-slate-500">Randevuyu onaylamak için bilgilerinizi girin.</p>
                  </div>
                </div>
                <form onSubmit={submitAppointment} className="space-y-5">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Ad Soyad</label>
                    <input required value={customerName} onChange={e=>setCustomerName(e.target.value)} type="text" className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal bg-slate-50 focus:bg-white" placeholder="Örn: Ayşe Demir" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Telefon Numarası</label>
                    <input required value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} type="tel" className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal bg-slate-50 focus:bg-white" placeholder="05XX XXX XX XX" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Not (Opsiyonel)</label>
                    <textarea value={customerNote} onChange={e=>setCustomerNote(e.target.value)} rows={2} className="w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all text-slate-900 font-medium bg-slate-50 focus:bg-white resize-none"></textarea>
                  </div>
                  <motion.button disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-4 mt-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                    {isSubmitting ? 'Onaylanıyor...' : 'Randevuyu Onayla'}
                    {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="h-full flex flex-col items-center justify-center text-center py-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }} className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-emerald-200"><CheckCircle2 className="w-12 h-12" /></motion.div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Harika, Onaylandı!</h2>
                <p className="text-slate-500 font-medium max-w-sm mb-8 leading-relaxed">Randevu detaylarınız WhatsApp üzerinden telefonunuza az önce gönderildi.</p>
                <button onClick={() => setStep(1)} className="px-6 py-2 rounded-full border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors">Yeni bir randevu al</button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
