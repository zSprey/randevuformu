"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  Phone,
  Mail,
  List,
  CheckSquare,
  FileText,
  Save,
  Eye,
  Sparkles,
  CheckCircle2,
  Copy
} from "lucide-react";
import { FormField } from "@/types/schema";

export default function FormBuilderPage() {
  const [formTitle, setFormTitle] = useState("Hasta / Danışan Ön Muayene Formu");
  const [fields, setFields] = useState<FormField[]>([
    {
      id: "f1",
      type: "TEXT",
      label: "Kronik Rahatsızlık veya Sürekli İlaç Kullanımı",
      placeholder: "Varsa belirtiniz...",
      required: false,
    },
    {
      id: "f2",
      type: "SELECT",
      label: "Daha Önce Benzer Bir Tedavi Aldınız mı?",
      required: true,
      options: ["Evet, aldım", "Hayır, ilk defa", "Emin değilim"],
    },
    {
      id: "f3",
      type: "TEXTAREA",
      label: "Tedavi Öncesi Belirtmek İstediğiniz Şikayetiniz",
      placeholder: "Şikayetinizi detaylandırın...",
      required: false,
    },
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const addField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: `f_${Date.now()}`,
      type,
      label: `Yeni ${type === "TEXT" ? "Metin" : type === "SELECT" ? "Seçenek" : type === "PHONE" ? "Telefon" : "Alan"}`,
      placeholder: "Açıklama giriniz...",
      required: false,
      options: type === "SELECT" || type === "RADIO" ? ["Seçenek 1", "Seçenek 2"] : undefined,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Dinamik Form Oluşturucu
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              No-Code Builder
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Randevu esnasında danışanlarınızdan alacağınız özel soruları ve alanları belirleyin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? "Düzenleme Modu" : "Önizlemeyi Gör"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            Kaydet & Yayınla
          </button>
        </div>
      </div>

      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Form şeması başarıyla kaydedildi ve randevu akışına bağlandı!
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Form Editor / Preview */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Form Başlığı
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-xl font-bold px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Field List */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              {fields.map((field, idx) => (
                <motion.div
                  key={field.id}
                  layout
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                      <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="flex-1 font-semibold text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white px-2 py-1 rounded focus:outline-none text-slate-900"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Zorunlu</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeField(field.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Options editor for Select */}
                  {field.type === "SELECT" && (
                    <div className="pl-6 space-y-2">
                      <label className="text-[11px] font-semibold text-slate-500 block">
                        Açılır Liste Seçenekleri (Virgülle ayırın)
                      </label>
                      <input
                        type="text"
                        value={field.options?.join(", ") || ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            options: e.target.value.split(",").map((s) => s.trim()),
                          })
                        }
                        placeholder="Seçenek 1, Seçenek 2, Seçenek 3"
                        className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Toolbox */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Alan Ekle (Toolbox)
            </h3>
            <p className="text-xs text-slate-500">
              Formunuza eklemek istediğiniz alan türünü tıklayın:
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => addField("TEXT")}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Type className="w-4 h-4" /> Metin Kutusu
              </button>
              <button
                type="button"
                onClick={() => addField("TEXTAREA")}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4" /> Uzun Metin
              </button>
              <button
                type="button"
                onClick={() => addField("SELECT")}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <List className="w-4 h-4" /> Açılır Liste
              </button>
              <button
                type="button"
                onClick={() => addField("CHECKBOX")}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <CheckSquare className="w-4 h-4" /> Onay Kutusu
              </button>
              <button
                type="button"
                onClick={() => addField("PHONE")}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all col-span-2"
              >
                <Phone className="w-4 h-4" /> Ek Telefon / İletişim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
