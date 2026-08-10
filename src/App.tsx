import React, { useState, useEffect, useRef } from 'react';

type FontScale = 'normal' | 'large' | 'xlarge';
type ActiveTab = 'guideTab' | 'formTab';

interface CorrectionRow {
  id: string;
  page: string;
  original: string;
  edit: string;
}

interface MahapadesaState {
  m1: 'ကိုက်ညီ' | 'လွဲမှား' | 'သံသယရှိ';
  m1_note: string;
  m2: 'ကိုက်ညီ' | 'လွဲမှား' | 'သံသယရှိ';
  m2_note: string;
  m3: 'ကိုက်ညီ' | 'လွဲမှား' | 'သံသယရှိ';
  m3_note: string;
  m4: 'ကိုက်ညီ' | 'လွဲမှား' | 'သံသယရှိ';
  m4_note: string;
}

interface LegalState {
  l1: 'ကင်းရှင်း' | 'ငြိစွန်း' | 'သံသယရှိ';
  l1_note: string;
  l2: 'ကင်းရှင်း' | 'ငြိစွန်း' | 'သံသယရှိ';
  l2_note: string;
  l3: 'ကင်းရှင်း' | 'ငြိစွန်း' | 'သံသယရှိ';
  l3_note: string;
  l4: 'ကင်းရှင်း' | 'ငြိစွန်း' | 'သံသယရှိ';
  l4_note: string;
}

interface FormDataState {
  bookTitle: string;
  authorName: string;
  reviewerName: string;
  publishYear: string;
  categories: string[];
  mahapadesa: MahapadesaState;
  legal: LegalState;
  citationStatus: string;
  paliGrammar: string;
  paliGrammarNote: string;
  corrections: CorrectionRow[];
  bookClass: 'Class-A' | 'Class-B' | 'Class-C';
  finalVerdict: 'အတည်ပြုသည်' | 'စာရေးသူသို့ပြန်ပြရန်' | 'ပယ်ဖျက်သည်';
  additionalNotes: string;
  signReviewerName: string;
  signDepartment: string;
  signDate: string;
}

const initialFormState: FormDataState = {
  bookTitle: '',
  authorName: '',
  reviewerName: '',
  publishYear: 'ပထမအကြိမ်၊ ၂၀၂၆',
  categories: ['လက်တွေ့တရားဘာဝနာ'],
  mahapadesa: {
    m1: 'ကိုက်ညီ',
    m1_note: '',
    m2: 'ကိုက်ညီ',
    m2_note: '',
    m3: 'ကိုက်ညီ',
    m3_note: '',
    m4: 'ကိုက်ညီ',
    m4_note: '',
  },
  legal: {
    l1: 'ကင်းရှင်း',
    l1_note: '',
    l2: 'ကင်းရှင်း',
    l2_note: '',
    l3: 'ကင်းရှင်း',
    l3_note: '',
    l4: 'ကင်းရှင်း',
    l4_note: '',
  },
  citationStatus: 'တိကျသည်',
  paliGrammar: 'မှန်ကန်သည်',
  paliGrammarNote: '',
  corrections: [
    { id: '1', page: '', original: '', edit: '' },
    { id: '2', page: '', original: '', edit: '' },
    { id: '3', page: '', original: '', edit: '' },
  ],
  bookClass: 'Class-A',
  finalVerdict: 'အတည်ပြုသည်',
  additionalNotes: '',
  signReviewerName: '',
  signDepartment: 'ဓမ္မစိစစ်ရေးအဖွဲ့ဝင်',
  signDate: new Date().toISOString().split('T')[0],
};

export default function App() {
  const [fontScale, setFontScale] = useState<FontScale>('large');
  const [activeTab, setActiveTab] = useState<ActiveTab>('guideTab');
  const [formData, setFormData] = useState<FormDataState>(initialFormState);
  const [toast, setToast] = useState<{ show: boolean; msg: string; icon: string }>({
    show: false,
    msg: '',
    icon: '✅',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync reviewer name
  const handleReviewerNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      reviewerName: val,
      signReviewerName: val,
    }));
  };

  const showToast = (msg: string, icon = '✅') => {
    setToast({ show: true, msg, icon });
    setTimeout(() => {
      setToast({ show: false, msg: '', icon: '✅' });
    }, 3200);
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(category);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== category)
          : [...prev.categories, category],
      };
    });
  };

  const handleMahapadesaChange = (key: keyof MahapadesaState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      mahapadesa: {
        ...prev.mahapadesa,
        [key]: value,
      },
    }));
  };

  const handleLegalChange = (key: keyof LegalState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      legal: {
        ...prev.legal,
        [key]: value,
      },
    }));
  };

  const addCorrectionRow = () => {
    setFormData((prev) => ({
      ...prev,
      corrections: [
        ...prev.corrections,
        { id: Date.now().toString(), page: '', original: '', edit: '' },
      ],
    }));
  };

  const removeCorrectionRow = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      corrections: prev.corrections.filter((c) => c.id !== id),
    }));
  };

  const updateCorrectionRow = (id: string, field: 'page' | 'original' | 'edit', value: string) => {
    setFormData((prev) => ({
      ...prev,
      corrections: prev.corrections.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  };

  const quickPassAll = () => {
    setActiveTab('formTab');
    setFormData((prev) => ({
      ...prev,
      mahapadesa: {
        m1: 'ကိုက်ညီ',
        m1_note: prev.mahapadesa.m1_note,
        m2: 'ကိုက်ညီ',
        m2_note: prev.mahapadesa.m2_note,
        m3: 'ကိုက်ညီ',
        m3_note: prev.mahapadesa.m3_note,
        m4: 'ကိုက်ညီ',
        m4_note: prev.mahapadesa.m4_note,
      },
      legal: {
        l1: 'ကင်းရှင်း',
        l1_note: prev.legal.l1_note,
        l2: 'ကင်းရှင်း',
        l2_note: prev.legal.l2_note,
        l3: 'ကင်းရှင်း',
        l3_note: prev.legal.l3_note,
        l4: 'ကင်းရှင်း',
        l4_note: prev.legal.l4_note,
      },
      citationStatus: 'တိကျသည်',
      paliGrammar: 'မှန်ကန်သည်',
      bookClass: 'Class-A',
      finalVerdict: 'အတည်ပြုသည်',
    }));
    showToast('အားလုံး "ကိုက်ညီ/ကင်းရှင်း" သို့ ဖြည့်သွင်းပြီးပါပြီ (Fast-filled)');
  };

  const confirmReset = () => {
    if (window.confirm('ဖောင်ပါ အချက်အလက်များကို မူလအတိုင်း ပြန်လည်ရှင်းလင်းလိုပါသလား။')) {
      setFormData({
        ...initialFormState,
        signDate: new Date().toISOString().split('T')[0],
      });
      showToast('ဖောင်ကို မူလအတိုင်း ပြန်စပြီးပါပြီ', '🔄');
    }
  };

  const exportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `Dhamma_Review_${formData.bookTitle ? formData.bookTitle.replace(/\s+/g, '_') : 'Document'}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('အချက်အလက်များ သိမ်းဆည်းပြီးပါပြီ (JSON Saved)');
  };

  const importJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        setFormData({
          ...initialFormState,
          ...parsed,
          corrections: parsed.corrections?.length
            ? parsed.corrections
            : initialFormState.corrections,
        });
        setActiveTab('formTab');
        showToast('အချက်အလက်များ ထည့်သွင်းပြီးပါပြီ (JSON Loaded)');
      } catch {
        showToast('ဖိုင်ဖတ်ရာတွင် အမှားရှိနေပါသည် (Invalid JSON)', '⚠️');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Calculate live badge status
  const calculateLiveBadge = () => {
    const { mahapadesa, legal, bookClass } = formData;
    const mPass =
      mahapadesa.m1 === 'ကိုက်ညီ' &&
      mahapadesa.m2 === 'ကိုက်ညီ' &&
      mahapadesa.m3 === 'ကိုက်ညီ' &&
      mahapadesa.m4 === 'ကိုက်ညီ';
    const lPass =
      legal.l1 === 'ကင်းရှင်း' &&
      legal.l2 === 'ကင်းရှင်း' &&
      legal.l3 === 'ကင်းရှင်း' &&
      legal.l4 === 'ကင်းရှင်း';

    if (mPass && lPass && bookClass === 'Class-A') {
      return {
        badgeClass: 'text-emerald-400 font-bold',
        text: 'Class-A (စံပြုကျမ်း) • ကိုက်ညီမှု ၁၀၀%',
      };
    } else if (lPass && bookClass !== 'Class-C') {
      return {
        badgeClass: 'text-amber-300 font-bold',
        text: `${bookClass} • ပြင်ဆင်ရန် အကြံပြုချက်အချို့ပါဝင်`,
      };
    } else {
      return {
        badgeClass: 'text-rose-300 font-bold',
        text: 'သတိပြုရန် • ဝိနိစ္ဆယ သို့မဟုတ် ပိဋကတ်တော်နှင့် စိစစ်ရန်ပါဝင်',
      };
    }
  };

  const badgeInfo = calculateLiveBadge();

  return (
    <div
      className={`min-h-screen py-6 px-3 sm:px-6 lg:px-8 font-scale-${fontScale}`}
    >
      {/* Top Action Toolbar & Navigation */}
      <div className="max-w-6xl mx-auto mb-6 no-print space-y-4">
        {/* App Title & Senior Control Header */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-slate-300 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-maroon-700 text-gold-400 flex items-center justify-center font-bold text-2xl shadow-md shrink-0 border border-gold-500">
              ☸
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                ဓမ္မစာအုပ် စိစစ်ရေးစနစ် (Dhamma Evaluation)
              </h1>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                မဟာပဒေသ (၄) ပါးနှင့် ဝိနိစ္ဆယ စံနှုန်းများဖြင့် စနစ်တကျ စိစစ်ရန်
              </p>
            </div>
          </div>

          {/* Font Size Scaler Controls & Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-amber-100/80 border border-amber-300 rounded-xl p-1.5 flex items-center gap-1 shadow-sm">
              <span className="text-xs font-bold text-amber-950 px-1">
                <i className="fa-solid fa-text-height"></i> စာလုံးအရွယ်:
              </span>
              <button
                type="button"
                onClick={() => setFontScale('normal')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                  fontScale === 'normal'
                    ? 'bg-maroon-700 text-white border-maroon-800 shadow'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
              >
                ပုံမှန်
              </button>
              <button
                type="button"
                onClick={() => setFontScale('large')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                  fontScale === 'large'
                    ? 'bg-maroon-700 text-white border-maroon-800 shadow'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
              >
                အကြီး
              </button>
              <button
                type="button"
                onClick={() => setFontScale('xlarge')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                  fontScale === 'xlarge'
                    ? 'bg-maroon-700 text-white border-maroon-800 shadow'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
              >
                အကြီးဆုံး
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={quickPassAll}
                className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm"
                title="Auto-fill default compliant values"
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i> အားလုံးကိုက်ညီ (Pass All)
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2.5 bg-maroon-700 hover:bg-maroon-800 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm"
              >
                <i className="fa-solid fa-print"></i> PDF/ပုံနှိပ်
              </button>
              <button
                type="button"
                onClick={exportJSON}
                className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-download"></i> Save
              </button>
              <label className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer">
                <i className="fa-solid fa-upload"></i> Load
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={importJSON}
                  className="hidden"
                  accept=".json"
                />
              </label>
              <button
                type="button"
                onClick={confirmReset}
                className="px-3 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm font-bold transition"
                title="Reset Form"
              >
                <i className="fa-solid fa-rotate-left"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Workflow Progress Banner (SOP Stepper) */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between mb-2.5 px-1 gap-2">
            <span className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
              <i className="fa-solid fa-list-check text-amber-700 text-lg"></i>
              စိစစ်ရေး လုပ်ငန်းစဉ် အဆင့်ဆင့် (SOP Review Workflow):
            </span>
            <span className="text-xs sm:text-sm text-amber-900 font-bold bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300">
              အဆင့် (၁) မှ စတင်ပါ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            {/* Step 1 Button */}
            <button
              type="button"
              onClick={() => setActiveTab('guideTab')}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition text-left shadow-sm ${
                activeTab === 'guideTab'
                  ? 'bg-amber-100/90 border-amber-500 font-bold shadow-md'
                  : 'bg-white border-slate-300 hover:border-amber-500'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  activeTab === 'guideTab'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                ၁
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm sm:text-base">
                  ၁။ လမ်းညွှန် ဖတ်ရန်
                </div>
                <div className="text-xs text-slate-700 font-medium">စံနှုန်းများ အရင်လေ့လာပါ</div>
              </div>
            </button>

            {/* Step 2 Button */}
            <button
              type="button"
              onClick={() => setActiveTab('formTab')}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition text-left shadow-sm ${
                activeTab === 'formTab'
                  ? 'bg-maroon-50 border-maroon-700 font-bold shadow-md'
                  : 'bg-white border-slate-300 hover:border-maroon-700'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  activeTab === 'formTab'
                    ? 'bg-maroon-700 text-white shadow'
                    : 'bg-slate-200 text-slate-800'
                }`}
              >
                ၂
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm sm:text-base">
                  ၂။ စိစစ်ဖောင် ဖြည့်ရန်
                </div>
                <div className="text-xs text-slate-700 font-medium">အချက်အလက်များ ထည့်ပါ</div>
              </div>
            </button>

            {/* Step 3 Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-300 bg-white hover:border-emerald-600 transition text-left shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm shrink-0">
                ၃
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm sm:text-base">
                  ၃။ ရလဒ် ထုတ်ယူရန်
                </div>
                <div className="text-xs text-slate-700 font-medium">PDF ပုံနှိပ် / Save ပြုလုပ်ပါ</div>
              </div>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex gap-3 border-b-2 border-slate-300 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('guideTab')}
            className={`px-5 py-3 rounded-xl text-sm sm:text-base font-bold border-2 transition flex items-center gap-2.5 shadow-sm ${
              activeTab === 'guideTab'
                ? 'bg-maroon-700 text-white border-gold-600 shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
            }`}
          >
            <i className="fa-solid fa-circle-info text-base"></i> ၁။ စနစ်သုံးစွဲပုံ လမ်းညွှန် (Simple Guide & SOP)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('formTab')}
            className={`px-5 py-3 rounded-xl text-sm sm:text-base font-bold border-2 transition flex items-center gap-2.5 shadow-sm ${
              activeTab === 'formTab'
                ? 'bg-maroon-700 text-white border-gold-600 shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
            }`}
          >
            <i className="fa-solid fa-file-signature text-base"></i> ၂။ စိစစ်ရေး ဖောင် (Evaluation Form)
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border-2 border-slate-300 print-shadow-none overflow-hidden">
        {/* Header Banner */}
        <header className="bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-900 text-white p-6 sm:p-8 text-center relative border-b-8 border-gold-500">
          <div className="text-3xl text-gold-400 mb-1">☸</div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide">
            ဓမ္မစာအုပ် မှတ်ကျောက်တင် စိစစ်ရေးစနစ်
          </h1>
          <p className="text-sm sm:text-base text-gold-300 font-medium mt-1">
            Dhamma Book Review & Canonical Evaluation System
          </p>

          {/* Live Compliance Status Pill */}
          <div className="mt-4 inline-flex items-center gap-2.5 bg-black/40 backdrop-blur px-5 py-2 rounded-full border-2 border-gold-400/50 text-sm sm:text-base">
            <span className="text-slate-200 font-medium">အဆင့်သတ်မှတ်ချက်:</span>
            <span className={badgeInfo.badgeClass}>{badgeInfo.text}</span>
          </div>
        </header>

        {/* TAB 1: SIMPLE GUIDE & SOP */}
        {activeTab === 'guideTab' && (
          <div className="p-6 sm:p-10 space-y-8 bg-slate-50">
            {/* Senior Onboarding Banner */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-300 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between border-b-2 pb-4 border-maroon-700 gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl text-maroon-800">☸</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-maroon-900">
                      ဓမ္မစာအုပ် စိစစ်ရေးစနစ် လမ်းညွှန် (Simple Guide for Reviewers)
                    </h2>
                    <p className="text-sm text-slate-700 font-medium">
                      စိစစ်သူ လူကြီးမင်းများ လွယ်ကူစွာ အသုံးပြုနိုင်ရန် လမ်းညွှန် ၃ ဆင့်
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('formTab')}
                  className="px-5 py-3 bg-maroon-700 hover:bg-maroon-800 text-white text-sm sm:text-base font-bold rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <span>စိစစ်ရေး ဖောင်သို့ သွားမည်</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm sm:text-base">
                {/* Guide Card 1 */}
                <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-300 space-y-3 relative shadow-sm">
                  <div className="font-bold text-amber-950 flex items-center gap-3 text-base sm:text-lg">
                    <span className="w-8 h-8 bg-amber-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow shrink-0">
                      ၁
                    </span>
                    <span>ပိဋကတ်တော်နှင့် စိစစ်ပါ</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    မြတ်စွာဘုရား၏ <strong>မဟာပဒေသ (၄) ပါး</strong> ဖြင့် ပါဠိတော်၊ သုတ်၊ ဝိနည်း၊ အဘိဓမ္မာနှင့် သစ္စာ ၄ ပါး ကိုက်ညီမှု ရှိ/မရှိ တိုက်ဆိုင် စစ်ဆေးပါ။
                  </p>
                </div>

                {/* Guide Card 2 */}
                <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-300 space-y-3 relative shadow-sm">
                  <div className="font-bold text-blue-950 flex items-center gap-3 text-base sm:text-lg">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow shrink-0">
                      ၂
                    </span>
                    <span>ဝိနိစ္ဆယ စိစစ်ပါ</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    နိုင်ငံတော် သံဃမဟာနာယကအဖွဲ့၏ <strong>အဓမ္မဝါဒ/အဝိနယဝါဒ</strong> ဆုံးဖြတ်ချက်များ၊ ဂိုဏ်းပေါင်းစုံ စည်းလုံးရေး ညွှန်ကြားချက်များ ငြိစွန်းမှု ရှိ/မရှိ စစ်ဆေးပါ။
                  </p>
                </div>

                {/* Guide Card 3 */}
                <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-3 relative shadow-sm">
                  <div className="font-bold text-emerald-950 flex items-center gap-3 text-base sm:text-lg">
                    <span className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow shrink-0">
                      ၃
                    </span>
                    <span>အဆင့်ခွဲ၍ အတည်ပြုပါ</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    <strong>Class-A (စံပြုကျမ်း)</strong>၊ <strong>Class-B (အထောက်အကူပြု)</strong>၊ <strong>Class-C (သတိပြုရန်)</strong> ခွဲခြား၍ စာအုပ်အဆင့်နှင့် နိဂုံးချုပ် ဆုံးဖြတ်ချက် ထုတ်ပြန်ပါ။
                  </p>
                </div>
              </div>

              {/* Big Call to Action Button */}
              <div className="pt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('formTab')}
                  className="w-full sm:w-auto px-8 py-4 bg-maroon-700 hover:bg-maroon-800 text-white rounded-2xl text-base sm:text-lg font-bold transition flex items-center justify-center gap-3 shadow-lg border-2 border-gold-500"
                >
                  <i className="fa-solid fa-pen-to-square text-xl"></i>
                  <span>စိစစ်ရေး ဖောင် စတင် ဖြည့်စွက်မည် (Start Evaluation Form)</span>
                </button>
              </div>
            </div>

            {/* Pros & Cons Grid for Senior Readers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm sm:text-base">
              {/* Pros */}
              <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-300 space-y-3">
                <div className="font-bold text-emerald-950 flex items-center gap-2 text-base sm:text-lg border-b border-emerald-200 pb-2">
                  <i className="fa-solid fa-circle-check text-emerald-600 text-xl"></i>
                  <span>စနစ်၏ အားသာချက်များ (System Pros)</span>
                </div>
                <ul className="list-disc list-inside space-y-2 text-slate-800 leading-relaxed font-medium">
                  <li><strong>ပုဂ္ဂလဓိဋ္ဌာန် ကင်းခြင်း:</strong> စိစစ်သူ၏ ကိုယ်ပိုင်အကြိုက် မဟုတ်ဘဲ ပိဋကတ်တော် စံနှုန်းဖြင့် ဆုံးဖြတ်နိုင်သည်။</li>
                  <li><strong>ကျမ်းကိုး ခိုင်မာခြင်း:</strong> ပါဠိတော်၊ တွဲ၊ စာမျက်နှာ အကိုးအကား အတိအကျ ရရှိသည်။</li>
                  <li><strong>စာရေးသူအတွက် အကျိုးရှိခြင်း:</strong> မည်သည့် စာမျက်နှာကို ပြင်ရမည်ဟု တိကျစွာ လမ်းညွှန်နိုင်သည်။</li>
                  <li><strong>သာသနာရေး ညီညွတ်ခြင်း:</strong> သံဃမဟာနာယက ညွှန်ကြားလွှာများနှင့် ကိုက်ညီမှု ရရှိစေသည်။</li>
                </ul>
              </div>

              {/* Cons & Solutions */}
              <div className="bg-rose-50 p-6 rounded-2xl border-2 border-rose-300 space-y-3">
                <div className="font-bold text-rose-950 flex items-center gap-2 text-base sm:text-lg border-b border-rose-200 pb-2">
                  <i className="fa-solid fa-triangle-exclamation text-rose-600 text-xl"></i>
                  <span>သတိပြုရန်နှင့် ဖြေရှင်းနည်း (Limitations & Solutions)</span>
                </div>
                <ul className="list-disc list-inside space-y-2 text-slate-800 leading-relaxed font-medium">
                  <li><strong>ပိဋကတ် ဗဟုသုတ လိုအပ်ခြင်း:</strong> စိစစ်သူ ပညာရှင် ကိုယ်တိုင် ပိဋကတ် နှံ့စပ်ရန် လိုပါသည်။</li>
                  <li><strong>ဖြေရှင်းနည်း:</strong> အရေးကြီးသော စာအုပ်များကို <strong>စိစစ်ရေးအဖွဲ့ (Board Review)</strong> ဖြင့် တိုက်ဆိုင်ပါ။</li>
                  <li><strong>တင်းကြပ်လွန်းမှု မဖြစ်စေရန်:</strong> ခေတ်သုံး စကားလုံး သုံးထားသော်လည်း မူရင်းမှ မသွေဖည်ပါက <strong>Class-B</strong> အဖြစ် ခွင့်ပြုပါ။</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EVALUATION FORM */}
        {activeTab === 'formTab' && (
          <form onSubmit={(e) => e.preventDefault()} className="p-6 sm:p-10 space-y-8">
            {/* Section 1: General Book Info */}
            <section className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-300 space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-slate-300 pb-3">
                <span className="w-8 h-8 bg-maroon-700 text-white rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow">
                  ၁
                </span>
                <h2 className="text-base sm:text-lg font-bold text-maroon-900">
                  အထွေထွေ အချက်အလက်များ (General Info)
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm sm:text-base">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">စာအုပ်အမည် (Book Title):</label>
                  <input
                    type="text"
                    value={formData.bookTitle}
                    onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                    className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-maroon-700 focus:outline-none print-border-b font-medium text-base sm:text-lg"
                    placeholder="စာအုပ်အမည် ရေးသွင်းပါ"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">ရေးသားသူ (Author Name):</label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-maroon-700 focus:outline-none print-border-b font-medium text-base sm:text-lg"
                    placeholder="ဆရာတော်/စာရေးသူ အမည်"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">စိစစ်သူအမည် (Reviewer Name):</label>
                  <input
                    type="text"
                    value={formData.reviewerName}
                    onChange={(e) => handleReviewerNameChange(e.target.value)}
                    className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-maroon-700 focus:outline-none print-border-b font-medium text-base sm:text-lg"
                    placeholder="စိစစ်သူ ပညာရှင် အမည်"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">ထုတ်ဝေသည့် ခုနှစ်/အကြိမ် (Edition):</label>
                  <input
                    type="text"
                    value={formData.publishYear}
                    onChange={(e) => setFormData({ ...formData, publishYear: e.target.value })}
                    className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-maroon-700 focus:outline-none print-border-b font-medium text-base sm:text-lg"
                    placeholder="ဥပမာ- ပထမအကြိမ်၊ ၂၀၂၆"
                  />
                </div>
              </div>

              {/* Category Checkboxes */}
              <div>
                <label className="block font-bold text-slate-800 mb-2 text-sm sm:text-base">
                  စာအုပ်အမျိုးအစား (Category):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-sm sm:text-base">
                  {[
                    'လက်တွေ့တရားဘာဝနာ',
                    'ဘာသာပြန်/အဋ္ဌကထာ',
                    'သင်တန်း/သင်ရိုး',
                    'ဟောတရားကောက်နုတ်ချက်',
                    'အခြား',
                  ].map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-3 p-3 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer font-semibold shadow-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                        className="w-5 h-5 senior-input-scale text-maroon-700 rounded focus:ring-maroon-700"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 2: Mahāpadesa 4 Evaluation Table */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b-4 border-maroon-700 pb-2 gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-maroon-700 text-white rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow">
                    ၂
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-maroon-900">
                    မဟာပဒေသ ၄ ပါးဖြင့် စိစစ်ခြင်း (Canonical Consistency)
                  </h2>
                </div>
                <span className="text-xs sm:text-sm text-slate-700 font-bold bg-slate-100 px-3 py-1 rounded-lg border">
                  (သုတ်၊ ဝိနည်း၊ သစ္စာ၄ပါး၊ အဘိဓမ္မာ)
                </span>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm sm:text-base text-left border-collapse border-2 border-slate-300">
                  <thead className="bg-slate-100 text-slate-900 font-bold border-b-2 border-slate-300">
                    <tr>
                      <th className="p-3 border-2 border-slate-300 w-1/2">စိစစ်သည့် အချက်များ (Criteria)</th>
                      <th className="p-3 border-2 border-slate-300 text-center w-36">စိစစ်ချက်</th>
                      <th className="p-3 border-2 border-slate-300">မှတ်ချက် / ကျမ်းကိုး စာမျက်နှာ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-200 font-medium">
                    <tr className="hover:bg-slate-50 transition">
                      <td className="p-3 border-2 border-slate-300">
                        <div className="font-bold text-maroon-900 text-base sm:text-lg">
                          ၁။ သုတ္တေ ဩတာရေတဗ္ဗ (သုတ်နှင့် နှိုင်းယှဉ်ခြင်း)
                        </div>
                        <div className="text-xs sm:text-sm text-slate-700 font-medium">
                          ပါဠိတော်၊ အဋ္ဌကထာ၊ ဋီကာ ပါ အဓိပ္ပာယ်များနှင့် တိုက်ရိုက် ကိုက်ညီမှု။
                        </div>
                      </td>
                      <td className="p-3 border-2 border-slate-300 text-center">
                        <select
                          value={formData.mahapadesa.m1}
                          onChange={(e) => handleMahapadesaChange('m1', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-maroon-700 bg-white"
                        >
                          <option value="ကိုက်ညီ">✓ ကိုက်ညီ</option>
                          <option value="လွဲမှား">✗ လွဲမှား</option>
                          <option value="သံသယရှိ">? သံသယရှိ</option>
                        </select>
                      </td>
                      <td className="p-3 border-2 border-slate-300">
                        <input
                          type="text"
                          value={formData.mahapadesa.m1_note}
                          onChange={(e) => handleMahapadesaChange('m1_note', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg print-border-b text-sm sm:text-base"
                          placeholder="ကျမ်းကိုး စာမျက်နှာ"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 transition">
                      <td className="p-3 border-2 border-slate-300">
                        <div className="font-bold text-maroon-900 text-base sm:text-lg">
                          ၂။ ဝိနယေ သန္ဒဿေတဗ္ဗ (ဝိနည်းနှင့် တိုက်ဆိုင်ခြင်း)
                        </div>
                        <div className="text-xs sm:text-sm text-slate-700 font-medium">
                          ဝိနည်း သီလသိက္ခာပုဒ်များ၊ ပညတ်ချက်များနှင့် ဆန့်ကျင်မှု ရှိ/မရှိ။
                        </div>
                      </td>
                      <td className="p-3 border-2 border-slate-300 text-center">
                        <select
                          value={formData.mahapadesa.m2}
                          onChange={(e) => handleMahapadesaChange('m2', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-maroon-700 bg-white"
                        >
                          <option value="ကိုက်ညီ">✓ ကိုက်ညီ</option>
                          <option value="လွဲမှား">✗ လွဲမှား</option>
                          <option value="သံသယရှိ">? သံသယရှိ</option>
                        </select>
                      </td>
                      <td className="p-3 border-2 border-slate-300">
                        <input
                          type="text"
                          value={formData.mahapadesa.m2_note}
                          onChange={(e) => handleMahapadesaChange('m2_note', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg print-border-b text-sm sm:text-base"
                          placeholder="ကျမ်းကိုး စာမျက်နှာ"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 transition">
                      <td className="p-3 border-2 border-slate-300">
                        <div className="font-bold text-maroon-900 text-base sm:text-lg">
                          ၃။ သစ္စာနုလောမ (စတုရာရိယသစ္စာနှင့် လျော်ညီခြင်း)
                        </div>
                        <div className="text-xs sm:text-sm text-slate-700 font-medium">
                          ဒုက္ခ၊ သမုဒယ၊ နိရောဓ၊ မဂ္ဂ သစ္စာ ၄ ပါး သဘောတရားနှင့် ညီညွတ်မှု။
                        </div>
                      </td>
                      <td className="p-3 border-2 border-slate-300 text-center">
                        <select
                          value={formData.mahapadesa.m3}
                          onChange={(e) => handleMahapadesaChange('m3', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-maroon-700 bg-white"
                        >
                          <option value="ကိုက်ညီ">✓ ကိုက်ညီ</option>
                          <option value="လွဲမှား">✗ လွဲမှား</option>
                          <option value="သံသယရှိ">? သံသယရှိ</option>
                        </select>
                      </td>
                      <td className="p-3 border-2 border-slate-300">
                        <input
                          type="text"
                          value={formData.mahapadesa.m3_note}
                          onChange={(e) => handleMahapadesaChange('m3_note', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg print-border-b text-sm sm:text-base"
                          placeholder="ကျမ်းကိုး စာမျက်နှာ"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 transition">
                      <td className="p-3 border-2 border-slate-300">
                        <div className="font-bold text-maroon-900 text-base sm:text-lg">
                          ၄။ ဓမ္မတာ / ပရမတ္ထ (အဘိဓမ္မာနှင့် ပဋိစ္စသမုပ္ပါဒ်)
                        </div>
                        <div className="text-xs sm:text-sm text-slate-700 font-medium">
                          ရုပ်၊ နာမ်၊ ပရမတ္ထတရားများ အဓိပ္ပာယ် ကောက်ယူမှု တိကျမှု။
                        </div>
                      </td>
                      <td className="p-3 border-2 border-slate-300 text-center">
                        <select
                          value={formData.mahapadesa.m4}
                          onChange={(e) => handleMahapadesaChange('m4', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-maroon-700 bg-white"
                        >
                          <option value="ကိုက်ညီ">✓ ကိုက်ညီ</option>
                          <option value="လွဲမှား">✗ လွဲမှား</option>
                          <option value="သံသယရှိ">? သံသယရှိ</option>
                        </select>
                      </td>
                      <td className="p-3 border-2 border-slate-300">
                        <input
                          type="text"
                          value={formData.mahapadesa.m4_note}
                          onChange={(e) => handleMahapadesaChange('m4_note', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg print-border-b text-sm sm:text-base"
                          placeholder="ကျမ်းကိုး စာမျက်နှာ"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3: Legal & Ecclesiastical Compliance */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b-4 border-maroon-700 pb-2">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-maroon-700 text-white rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow">
                    ၃
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-maroon-900">
                    သာသနာရေးနှင့် ဝိနိစ္ဆယဆိုင်ရာ စိစစ်ခြင်း (Legal Compliance)
                  </h2>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm sm:text-base text-left border-collapse border-2 border-slate-300">
                  <thead className="bg-slate-100 text-slate-900 font-bold border-b-2 border-slate-300">
                    <tr>
                      <th className="p-3 border-2 border-slate-300 w-1/2">စိစစ်သည့် အကြောင်းအရာ</th>
                      <th className="p-3 border-2 border-slate-300 text-center w-36">အခြေအနေ</th>
                      <th className="p-3 border-2 border-slate-300">မှတ်ချက် / ညွှန်ကြားလွှာအမှတ်</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-200 font-medium">
                    <tr className="hover:bg-slate-50 transition">
                      <td className="p-3 border-2 border-slate-300">
                        <div className="font-bold text-slate-900 text-base sm:text-lg">
                          ၁။ အဓမ္မဝါဒနှင့် အဝိနယဝါဒ စိစစ်ခြင်း
                        </div>
                        <div className="text-xs sm:text-sm text-slate-700 font-medium">
                          တရားမဟုတ်သည်ကို တရားဟု၊ ဝိနည်းမဟုတ်သည်ကို ဝိနည်းဟု ဖော်ပြခြင်း။
                        </div>
                      </td>
                      <td className="p-3 border-2 border-slate-300 text-center">
                        <select
                          value={formData.legal.l1}
                          onChange={(e) => handleLegalChange('l1', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-maroon-700 bg-white"
                        >
                          <option value="ကင်းရှင်း">✓ ကင်းရှင်း</option>
                          <option value="ငြိစွန်း">✗ ငြိစွန်း</option>
                          <option value="သံသယရှိ">? သံသယရှိ</option>
                        </select>
                      </td>
                      <td className="p-3 border-2 border-slate-300">
                        <input
                          type="text"
                          value={formData.legal.l1_note}
                          onChange={(e) => handleLegalChange('l1_note', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg print-border-b text-sm sm:text-base"
                          placeholder="မှတ်ချက်"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 transition">
                      <td className="p-3 border-2 border-slate-300">
                        <div className="font-bold text-slate-900 text-base sm:text-lg">
                          ၂။ နိုင်ငံတော် သံဃမဟာနာယကအဖွဲ့ ဆုံးဖြတ်ချက်များ
                        </div>
                        <div className="text-xs sm:text-sm text-slate-700 font-medium">
                          ဆုံးဖြတ်ပြီးသော "အဓမ္မဝါဒ စာရင်းပါ" အယူအဆများ ပါဝင်နေခြင်း။
                        </div>
                      </td>
                      <td className="p-3 border-2 border-slate-300 text-center">
                        <select
                          value={formData.legal.l2}
                          onChange={(e) => handleLegalChange('l2', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-maroon-700 bg-white"
                        >
                          <option value="ကင်းရှင်း">✓ ကင်းရှင်း</option>
                          <option value="ငြိစွန်း">✗ ငြိစွန်း</option>
                          <option value="သံသယရှိ">? သံသယရှိ</option>
                        </select>
                      </td>
                      <td className="p-3 border-2 border-slate-300">
                        <input
                          type="text"
                          value={formData.legal.l2_note}
                          onChange={(e) => handleLegalChange('l2_note', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg print-border-b text-sm sm:text-base"
                          placeholder="ဝိနိစ္ဆယ အမှတ်"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 transition">
                      <td className="p-3 border-2 border-slate-300">
                        <div className="font-bold text-slate-900 text-base sm:text-lg">
                          ၃။ သံဃာ့ဘိန္ဒက / သံဃာ့သမဂ္ဂီ (Sangha Unity)
                        </div>
                        <div className="text-xs sm:text-sm text-slate-700 font-medium">
                          ဂိုဏ်းပေါင်းစုံ စည်းလုံးရေး ထိခိုက်စေသော သင်းခွဲ အသုံးအနှုန်းများ။
                        </div>
                      </td>
                      <td className="p-3 border-2 border-slate-300 text-center">
                        <select
                          value={formData.legal.l3}
                          onChange={(e) => handleLegalChange('l3', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-maroon-700 bg-white"
                        >
                          <option value="ကင်းရှင်း">✓ ကင်းရှင်း</option>
                          <option value="ငြိစွန်း">✗ ငြိစွန်း</option>
                          <option value="သံသယရှိ">? သံသယရှိ</option>
                        </select>
                      </td>
                      <td className="p-3 border-2 border-slate-300">
                        <input
                          type="text"
                          value={formData.legal.l3_note}
                          onChange={(e) => handleLegalChange('l3_note', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg print-border-b text-sm sm:text-base"
                          placeholder="မှတ်ချက်"
                        />
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50 transition">
                      <td className="p-3 border-2 border-slate-300">
                        <div className="font-bold text-slate-900 text-base sm:text-lg">
                          ၄။ မိစ္ဆာဒိဋ္ဌိ / ဒိဋ္ဌိ ၆၂ ပါး အယူလွဲများ
                        </div>
                        <div className="text-xs sm:text-sm text-slate-700 font-medium">
                          သဿတ၊ ဥစ္ဆေဒ စသည့် အယူလွဲများ ရောထွေးဖော်ပြထားခြင်း။
                        </div>
                      </td>
                      <td className="p-3 border-2 border-slate-300 text-center">
                        <select
                          value={formData.legal.l4}
                          onChange={(e) => handleLegalChange('l4', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-maroon-700 bg-white"
                        >
                          <option value="ကင်းရှင်း">✓ ကင်းရှင်း</option>
                          <option value="ငြိစွန်း">✗ ငြိစွန်း</option>
                          <option value="သံသယရှိ">? သံသယရှိ</option>
                        </select>
                      </td>
                      <td className="p-3 border-2 border-slate-300">
                        <input
                          type="text"
                          value={formData.legal.l4_note}
                          onChange={(e) => handleLegalChange('l4_note', e.target.value)}
                          className="w-full p-2 border-2 border-slate-300 rounded-lg print-border-b text-sm sm:text-base"
                          placeholder="မှတ်ချက်"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4: Citation & Pāḷi Integrity Check */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border-2 border-slate-300 text-sm sm:text-base">
              <div className="space-y-3">
                <span className="font-bold text-maroon-900 text-base sm:text-lg block border-b pb-1 border-slate-300">
                  ၄။ ကျမ်းကိုး ညွှန်းဆိုမှု တိကျမှု (Citation Accuracy):
                </span>
                <div className="space-y-3 pt-1">
                  {[
                    { label: '✓ တိကျသည် (ပါဠိတော်၊ တွဲ၊ စာမျက်နှာ မှန်ကန်)', val: 'တိကျသည်' },
                    { label: '? မပါရှိပါ (ကျမ်းကိုး ထည့်ပေးရန် လို)', val: 'မပါရှိ' },
                    { label: '✗ လွဲမှားသည် (ကျမ်းအမည်/အဓိပ္ပာယ် လွဲနေ)', val: 'လွဲမှားသည်' },
                  ].map((item) => (
                    <label
                      key={item.val}
                      className="flex items-center gap-3 cursor-pointer p-2 rounded-xl border-2 border-transparent hover:border-slate-300 hover:bg-white font-semibold"
                    >
                      <input
                        type="radio"
                        name="citation_status"
                        value={item.val}
                        checked={formData.citationStatus === item.val}
                        onChange={(e) => setFormData({ ...formData, citationStatus: e.target.value })}
                        className="w-5 h-5 senior-input-scale text-maroon-700 focus:ring-maroon-700"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="font-bold text-maroon-900 text-base sm:text-lg block border-b pb-1 border-slate-300">
                  ၅။ ပါဠိ အက္ခရာ/ပုဒ်ဖြတ် (Pāḷi Grammar):
                </span>
                <div className="space-y-3 pt-1">
                  {[
                    { label: '✓ မှန်ကန်သည်', val: 'မှန်ကန်သည်' },
                    { label: '✗ ပြင်ဆင်ရန် လိုအပ်သည်', val: 'ပြင်ဆင်ရန်လိုအပ်သည်' },
                  ].map((item) => (
                    <label
                      key={item.val}
                      className="flex items-center gap-3 cursor-pointer p-2 rounded-xl border-2 border-transparent hover:border-slate-300 hover:bg-white font-semibold"
                    >
                      <input
                        type="radio"
                        name="pali_grammar"
                        value={item.val}
                        checked={formData.paliGrammar === item.val}
                        onChange={(e) => setFormData({ ...formData, paliGrammar: e.target.value })}
                        className="w-5 h-5 senior-input-scale text-maroon-700 focus:ring-maroon-700"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.paliGrammarNote}
                  onChange={(e) => setFormData({ ...formData, paliGrammarNote: e.target.value })}
                  className="w-full mt-2 p-3 bg-white border-2 border-slate-300 rounded-xl print-border-b text-sm sm:text-base font-medium"
                  placeholder="ပြင်ဆင်ရန် ပါဠိပုဒ်များ ညွှန်းပါ"
                />
              </div>
            </section>

            {/* Section 5: Dynamic Correction Notes Table */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b-4 border-maroon-700 pb-2">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-maroon-700 text-white rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow">
                    ၅
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-maroon-900">
                    ပြင်ဆင်ဖြည့်စွပ်/ အကြံပြုချက် အသေးစိတ် (Edits & Notes)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={addCorrectionRow}
                  className="no-print px-4 py-2.5 bg-maroon-700 hover:bg-maroon-800 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-md"
                >
                  <i className="fa-solid fa-plus text-base"></i> တန်းအသစ်ထည့်
                </button>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm sm:text-base text-left border-collapse border-2 border-slate-300">
                  <thead className="bg-slate-100 text-slate-900 font-bold border-b-2 border-slate-300">
                    <tr>
                      <th className="p-3 border-2 border-slate-300 text-center w-12">စဉ်</th>
                      <th className="p-3 border-2 border-slate-300 w-32">စာမျက်နှာ</th>
                      <th className="p-3 border-2 border-slate-300 w-2/5">မူလရေးသားချက် / တွေ့ရှိချက်</th>
                      <th className="p-3 border-2 border-slate-300">ပြင်ဆင်ရန် အကြံပြုချက်</th>
                      <th className="p-3 border-2 border-slate-300 text-center w-12 no-print">ဖျက်</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-200 font-medium">
                    {formData.corrections.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition">
                        <td className="p-2 border-2 border-slate-300 text-center font-bold text-slate-700 text-base">
                          {idx + 1}
                        </td>
                        <td className="p-2 border-2 border-slate-300">
                          <input
                            type="text"
                            value={row.page}
                            onChange={(e) => updateCorrectionRow(row.id, 'page', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded text-sm sm:text-base font-bold print-border-b"
                            placeholder="စာ ၁၅"
                          />
                        </td>
                        <td className="p-2 border-2 border-slate-300">
                          <textarea
                            rows={1}
                            value={row.original}
                            onChange={(e) => updateCorrectionRow(row.id, 'original', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded text-sm sm:text-base font-medium print-border-b"
                            placeholder="တွေ့ရှိချက်..."
                          />
                        </td>
                        <td className="p-2 border-2 border-slate-300">
                          <textarea
                            rows={1}
                            value={row.edit}
                            onChange={(e) => updateCorrectionRow(row.id, 'edit', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded text-sm sm:text-base font-medium print-border-b"
                            placeholder="ပြင်ဆင်ရန် အကြံပြုချက်..."
                          />
                        </td>
                        <td className="p-2 border-2 border-slate-300 text-center no-print">
                          <button
                            type="button"
                            onClick={() => removeCorrectionRow(row.id)}
                            className="text-rose-600 hover:text-rose-800 p-2 text-base font-bold"
                            title="Delete row"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 6: Final Verdict & Classification */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b-4 border-maroon-700 pb-2">
                <span className="w-8 h-8 bg-maroon-700 text-white rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow">
                  ၆
                </span>
                <h2 className="text-base sm:text-lg font-bold text-maroon-900">
                  နိဂုံးချုပ် ဆုံးဖြတ်ချက် (Final Verdict)
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm sm:text-base">
                <div className="p-5 bg-slate-50 border-2 border-slate-300 rounded-2xl space-y-3">
                  <span className="block font-bold text-slate-900 text-base sm:text-lg border-b pb-1 border-slate-300">
                    ၁။ စာအုပ် အဆင့်သတ်မှတ်ချက် (Classification):
                  </span>
                  <div className="space-y-3 pt-1">
                    {[
                      {
                        val: 'Class-A',
                        title: 'Class-A (စံပြုကျမ်း):',
                        desc: 'ပါဠိတော်၊ အဋ္ဌကထာအတိုင်း တိကျစွာ ပြန်ဆိုထားသည်။',
                        color: 'text-emerald-900',
                      },
                      {
                        val: 'Class-B',
                        title: 'Class-B (အထောက်အကူပြု):',
                        desc: 'ခေတ်သုံးအသုံးအနှုန်းများ ပါသော်လည်း မူရင်းဓမ္မမသွေဖည်ပါ။',
                        color: 'text-amber-900',
                      },
                      {
                        val: 'Class-C',
                        title: 'Class-C (သတိပြုရန်):',
                        desc: 'ကိုယ်ပိုင်အယူအဆ / စိစစ်ရန် အချက်များ ပါဝင်သည်။',
                        color: 'text-rose-900',
                      },
                    ].map((item) => (
                      <label
                        key={item.val}
                        className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-white border-2 border-transparent hover:border-slate-300"
                      >
                        <input
                          type="radio"
                          name="book_class"
                          value={item.val}
                          checked={formData.bookClass === item.val}
                          onChange={(e) =>
                            setFormData({ ...formData, bookClass: e.target.value as any })
                          }
                          className="w-5 h-5 senior-input-scale text-maroon-700 focus:ring-maroon-700 mt-1"
                        />
                        <div>
                          <span className={`font-bold ${item.color} text-base`}>{item.title}</span>
                          <p className="text-xs sm:text-sm text-slate-700 font-medium">{item.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-slate-50 border-2 border-slate-300 rounded-2xl space-y-3">
                  <span className="block font-bold text-slate-900 text-base sm:text-lg border-b pb-1 border-slate-300">
                    ၂။ အယ်ဒီတာ ဆုံးဖြတ်ချက် (Decision):
                  </span>
                  <div className="space-y-3 pt-1">
                    {[
                      {
                        val: 'အတည်ပြုသည်',
                        title: '✓ အတည်ပြုသည် (Approved):',
                        desc: 'ထုတ်ဝေရန် သင့်တော်သည်။',
                        color: 'text-emerald-900',
                      },
                      {
                        val: 'စာရေးသူသို့ပြန်ပြရန်',
                        title: '? ပြန်ပြရန် (Referred):',
                        desc: 'ပြင်ဆင်ချက်ပြုလုပ်ပြီးမှ စိစစ်မည်။',
                        color: 'text-amber-900',
                      },
                      {
                        val: 'ပယ်ဖျက်သည်',
                        title: '✗ ပယ်ဖျက်သည် (Rejected):',
                        desc: 'ဝိနိစ္ဆယနှင့် ငြိစွန်းသဖြင့် မသင့်ပါ။',
                        color: 'text-rose-900',
                      },
                    ].map((item) => (
                      <label
                        key={item.val}
                        className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-white border-2 border-transparent hover:border-slate-300"
                      >
                        <input
                          type="radio"
                          name="final_verdict"
                          value={item.val}
                          checked={formData.finalVerdict === item.val}
                          onChange={(e) =>
                            setFormData({ ...formData, finalVerdict: e.target.value as any })
                          }
                          className="w-5 h-5 senior-input-scale text-maroon-700 focus:ring-maroon-700 mt-1"
                        />
                        <div>
                          <span className={`font-bold ${item.color} text-base`}>{item.title}</span>
                          <p className="text-xs sm:text-sm text-slate-700 font-medium">{item.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Signatures, Department, Date */}
            <section className="space-y-4 pt-2">
              <div>
                <label className="block font-bold text-slate-800 text-sm sm:text-base mb-1.5">
                  အခြား မှတ်ချက်များ (Additional Notes):
                </label>
                <textarea
                  rows={3}
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  className="w-full p-3 border-2 border-slate-300 rounded-xl text-sm sm:text-base font-medium focus:ring-2 focus:ring-maroon-700 print-border-b"
                  placeholder="အခြား ဖြည့်စွက်ချက်များ..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t-2 border-slate-300 text-sm sm:text-base font-medium">
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">စိစစ်သူ အမည်:</label>
                    <input
                      type="text"
                      value={formData.signReviewerName}
                      onChange={(e) => setFormData({ ...formData, signReviewerName: e.target.value })}
                      className="w-full p-2.5 border-2 border-slate-300 rounded-xl print-border-b font-bold"
                      placeholder="အမည် ရေးပါ"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">ရာထူး / ဌာန:</label>
                    <input
                      type="text"
                      value={formData.signDepartment}
                      onChange={(e) => setFormData({ ...formData, signDepartment: e.target.value })}
                      className="w-full p-2.5 border-2 border-slate-300 rounded-xl print-border-b"
                      placeholder="ဥပမာ- အဖွဲ့ဝင်၊ ဓမ္မစိစစ်ရေးအဖွဲ့"
                    />
                  </div>
                </div>

                <div className="space-y-3 flex flex-col justify-end">
                  <div className="border-b-2 border-slate-400 pb-2 text-center">
                    <span className="text-sm text-slate-500 italic font-bold">(စိစစ်သူ လက်မှတ်)</span>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">ရက်စွဲ (Date):</label>
                    <input
                      type="date"
                      value={formData.signDate}
                      onChange={(e) => setFormData({ ...formData, signDate: e.target.value })}
                      className="w-full p-2.5 border-2 border-slate-300 rounded-xl print-border-b font-bold"
                    />
                  </div>
                </div>
              </div>
            </section>
          </form>
        )}

        {/* Footer */}
        <footer className="bg-slate-100 p-4 border-t-2 border-slate-300 text-center text-xs sm:text-sm text-slate-700 font-bold">
          ဓမ္မစာအုပ် မှတ်ကျောက်တင် စိစစ်ရေးစနစ် • Canonical Evaluation Standards & Mahāpadesa Guidelines
        </footer>
      </main>

      {/* Notification Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-sm sm:text-base font-bold transition-all duration-300 z-50 flex items-center gap-3 border-2 border-gold-400 animate-bounce">
          <span className="text-xl">{toast.icon}</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

