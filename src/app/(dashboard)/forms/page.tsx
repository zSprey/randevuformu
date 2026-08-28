"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  Phone,
  List,
  CheckSquare,
  FileText,
  Save,
  Eye,
  Sparkles,
  CheckCircle2,
  Layers,
  HelpCircle,
} from "lucide-react";
import { FormField } from "@/types/schema";

export default function FormBuilderPage() {
  const [formTitle, setFormTitle] = useState("Danışan / Hasta Ön Muayene Formu");
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
      label: "Daha Önce Benzer Bir Hizmet Aldınız mı?",
      required: true,
      options: ["Evet, aldım", "Hayır, ilk defa", "Emin değilim"],
    },
    {
      id: "f3",
      type: "TEXTAREA",
      label: "Randevu Öncesi Belirtmek İstediğiniz Notlar",
      placeholder: "Detayları yazabilirsiniz...",
      required: false,
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Load existing form schema on mount
  useEffect(() => {
    async function loadFormSchema() {
      try {
        const res = await fetch("/api/forms?tenantId=default-tenant");
        const json = await res.json();
        if (json.schemas && json.schemas.length > 0) {
          const latest = json.schemas[0];
          setFormTitle(latest.name || "Danışan Ön Muayene Formu");
          if (Array.isArray(latest.fields) && latest.fields.length > 0) {
            setFields(latest.fields);
          }
        }
      } catch (err) {
        console.warn("Could not load form schemas:", err);
      }
    }
    loadFormSchema();
  }, []);

  const addField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: `f_${Date.now()}`,
      type,
      label: `Yeni ${
        type === "TEXT"
          ? "Metin Alanı"
          : type === "SELECT"
          ? "Açılır Liste"
          : type === "PHONE"
          ? "Telefon"
          : "Alan"
      }`,
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: "default-tenant",
          name: formTitle,
          fields,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch (error) {
      console.error("Save form error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Dinamik Form Oluşturucu
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              No-Code DB Engine
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Randevu alma akışında danışanlarınızdan toplayacağınız özel soruları tasarlayın ve yayınlayın.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 hover:bg-slate-800 shadow-sm transition-all"
          >
            <Eye className="w-4 h-4 text-indigo-400" />
            {previewMode ? "Düzenleme Modu" : "Canlı Önizleme"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Kaydediliyor..." : "Kaydet & Yayınla"}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Form şeması başarıyla veritabanına kaydedildi ve canlı randevu akışına bağlandı!
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Form Editor or Preview */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Form Başlığı
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-xl font-bold px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {previewMode ? (
              /* Live Preview */
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Eye className="w-4 h-4" /> Danışan Görünümü Önizlemesi
                </div>
                {fields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      {field.label} {field.required && <span className="text-rose-400">*</span>}
                    </label>
                    {field.type === "TEXT" && (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-400"
                      />
                    )}
                    {field.type === "TEXTAREA" && (
                      <textarea
                        placeholder={field.placeholder}
                        disabled
                        rows={3}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-400"
                      />
                    )}
                    {field.type === "SELECT" && (
                      <select
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-400"
                      >
                        <option>Seçiniz...</option>
                        {field.options?.map((opt, i) => (
                          <option key={i}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {field.type === "CHECKBOX" && (
                      <div className="flex items-center gap-2 pt-1">
                        <input type="checkbox" disabled className="rounded text-indigo-600" />
                        <span className="text-xs text-slate-400">Onaylıyorum</span>
                      </div>
                    )}
                    {field.type === "PHONE" && (
                      <input
                        type="tel"
                        placeholder="05XX XXX XX XX"
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-400"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Field List Editor */
              <div className="space-y-4 pt-4 border-t border-slate-800">
                {fields.map((field, idx) => (
                  <motion.div
                    key={field.id}
                    layout
                    className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/70 space-y-4 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="flex-1 font-semibold text-sm bg-transparent border-b border-transparent hover:border-slate-600 focus:border-indigo-500 focus:bg-slate-900 px-2.5 py-1 rounded text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="rounded text-indigo-500 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                          />
                          <span>Zorunlu</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Options editor for Select */}
                    {field.type === "SELECT" && (
                      <div className="pl-6 space-y-2">
                        <label className="text-[11px] font-semibold text-slate-400 block">
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
                          className="w-full text-xs px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Toolbox */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Alan Ekle (Toolbox)
            </h3>
            <p className="text-xs text-slate-400">
              Formunuza eklemek istediğiniz soru tipine tıklayın:
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => addField("TEXT")}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 hover:border-indigo-500/50 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <Type className="w-4 h-4 text-indigo-400" /> Metin Kutusu
              </button>
              <button
                type="button"
                onClick={() => addField("TEXTAREA")}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 hover:border-indigo-500/50 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <FileText className="w-4 h-4 text-indigo-400" /> Uzun Metin
              </button>
              <button
                type="button"
                onClick={() => addField("SELECT")}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 hover:border-indigo-500/50 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <List className="w-4 h-4 text-indigo-400" /> Açılır Liste
              </button>
              <button
                type="button"
                onClick={() => addField("CHECKBOX")}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 hover:border-indigo-500/50 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <CheckSquare className="w-4 h-4 text-indigo-400" /> Onay Kutusu
              </button>
              <button
                type="button"
                onClick={() => addField("PHONE")}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-indigo-600/20 hover:border-indigo-500/50 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all col-span-2 hover:scale-105 active:scale-95"
              >
                <Phone className="w-4 h-4 text-indigo-400" /> Ek İletişim / Tel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
