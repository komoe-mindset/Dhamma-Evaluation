import React, { useState, useRef, useEffect } from 'react';
import {
  saveEvaluationToCloud,
  subscribeEvaluationsFromCloud,
  deleteEvaluationFromCloud,
  SavedEvaluationRecord,
} from './firebase';

type FontScale = 'normal' | 'large' | 'xlarge';
type ViewMode = 'wizard' | 'full' | 'preview';

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
  l5: 'ကင်းရှင်း' | 'ငြိစွန်း' | 'သံသယရှိ';
  l5_note: string;
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
  bookTitle: 'အနတ္တလက္ခဏသုတ် တရားတော်နှင့် ဝိပဿနာကျင့်စဉ်',
  authorName: 'ဘဒ္ဒန္တ ဉာဏဝံသ (မဟာဂန္ထဝါစကပဏ္ဍိတ)',
  reviewerName: 'ဒေါက်တာ ဘဒ္ဒန္တ သီလဝံသ',
  publishYear: 'ပထမအကြိမ်၊ ၂၀၂၆',
  categories: ['လက်တွေ့တရားဘာဝနာ', 'ဘာသာပြန်/အဋ္ဌကထာ'],
  mahapadesa: {
    m1: 'ကိုက်ညီ',
    m1_note: 'သံယုတ္တနိကာယ် ခန္ဓဝဂ္ဂပါဠိတော် စာ-၆၇ နှင့် ကိုက်ညီသည်။',
    m2: 'ကိုက်ညီ',
    m2_note: 'ဝိနည်းသီလသိက္ခာပုဒ်များနှင့် ညီညွတ်သည်။',
    m3: 'ကိုက်ညီ',
    m3_note: 'စတုရာရိယသစ္စာ ဒေသနာတော်နှင့် လျော်ညီသည်။',
    m4: 'ကိုက်ညီ',
    m4_note: 'နာမ်ရုပ် ပရမတ္ထတရားများ ကောက်ယူမှု မှန်ကန်သည်။',
  },
  legal: {
    l1: 'ကင်းရှင်း',
    l1_note: 'အဓမ္မဝါဒ ဖော်ပြချက် မပါရှိပါ။',
    l2: 'ကင်းရှင်း',
    l2_note: 'မဟန အဖွဲ့၏ ဝိနိစ္ဆယ ဆုံးဖြတ်ချက်များနှင့် ညီညွတ်သည်။',
    l3: 'ကင်းရှင်း',
    l3_note: 'သံဃာ့ညီညွတ်ရေး ထိခိုက်မှု မရှိပါ။',
    l4: 'ကင်းရှင်း',
    l4_note: 'ဒိဋ္ဌိ ၆၂ ပါး အယူလွဲများ ကင်းရှင်းသည်။',
    l5: 'ကင်းရှင်း',
    l5_note: 'သာသနာရေး မူဝါဒများနှင့် ကိုက်ညီသည်။',
  },
  citationStatus: 'တိကျသည်',
  paliGrammar: 'မှန်ကန်သည်',
  paliGrammarNote: 'ပါဠိတော် အသံထွက်နှင့် အက္ခရာဝလိ တိကျမှန်ကန်သည်။',
  corrections: [
    {
      id: '1',
      page: 'စာ-၄၅',
      original: 'ခန္ဓာ ၅ ပါးသည် နိစ္စ သုခ ဖြစ်သည်',
      edit: 'ခန္ဓာ ၅ ပါးသည် အနိစ္စ ဒုက္ခ ဖြစ်သည် (ပြင်ရန်)',
    },
    {
      id: '2',
      page: 'စာ-၁၁၂',
      original: 'မဂ္ဂင် ၇ ပါး',
      edit: 'မဂ္ဂင် ၈ ပါး (အက္ခရာ အကျကျန် ပြင်ရန်)',
    },
    {
      id: '3',
      page: 'စာ-၁၈၉',
      original: 'သံယုတ္တနိကာယ် တွဲ-၂ စာ-၄၅',
      edit: 'သံယုတ္တနိကာယ် ခန္ဓဝဂ္ဂပါဠိတော် စာ-၆၇ သို့ ကျမ်းကိုး ပြင်ဆင်ရန်',
    },
  ],
  bookClass: 'Class-A',
  finalVerdict: 'အတည်ပြုသည်',
  additionalNotes:
    'ဤစာအုပ်သည် မဟာပဒေသ ၄ ပါး၊ သာသနာရေး ဝိနိစ္ဆယများနှင့် အပြည့်အဝ ကိုက်ညီပါသဖြင့် ပုံနှိပ်ထုတ်ဝေရန် အတည်ပြု စိစစ်ထောက်ခံပါသည်။',
  signReviewerName: 'ဒေါက်တာ ဘဒ္ဒန္တ သီလဝံသ',
  signDepartment: 'ဓမ္မစိစစ်ရေးအဖွဲ့ ပညာရှင်',
  signDate: new Date().toISOString().split('T')[0],
};

const STEP_LABELS = [
  { num: 1, title: '၁။ အထွေထွေ အချက်အလက်', desc: 'General Info' },
  { num: 2, title: '၂။ ပိဋကတ်တော်နှင့် ကိုက်ညီမှု', desc: 'Mahāpadesa 4' },
  { num: 3, title: '၃။ ဝိနိစ္ဆယနှင့် ဥပဒေရေးရာ', desc: 'Legal Compliance' },
  { num: 4, title: '၄။ ကျမ်းကိုး & ၅။ ပြင်ဆင်ချက်', desc: 'Citations & Edits' },
  { num: 5, title: '၆။ နိဂုံးချုပ် & ၇။ လက်မှတ်', desc: 'Final Verdict' },
];

export default function App() {
  const [fontScale, setFontScale] = useState<FontScale>('large');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [viewMode, setViewMode] = useState<ViewMode>('wizard');
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormDataState>(initialFormState);
  const [toast, setToast] = useState<{ show: boolean; msg: string; icon: string }>({
    show: false,
    msg: '',
    icon: '✅',
  });

  // Firebase Cloud State
  const [savedRecords, setSavedRecords] = useState<SavedEvaluationRecord[]>([]);
  const [showCloudDrawer, setShowCloudDrawer] = useState<boolean>(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState<boolean>(false);
  const [isLoadingCloudRecords, setIsLoadingCloudRecords] = useState<boolean>(false);
  const [currentCloudRecordId, setCurrentCloudRecordId] = useState<string | null>(null);
  const [cloudSearchQuery, setCloudSearchQuery] = useState<string>('');

  // Subscribe to Cloud evaluations on drawer open
  useEffect(() => {
    if (showCloudDrawer) {
      setIsLoadingCloudRecords(true);
      const unsubscribe = subscribeEvaluationsFromCloud(
        (records) => {
          setSavedRecords(records);
          setIsLoadingCloudRecords(false);
        },
        () => {
          setIsLoadingCloudRecords(false);
        }
      );
      return () => {
        if (typeof unsubscribe === 'function') (unsubscribe as () => void)();
      };
    }
  }, [showCloudDrawer]);

  const handleSaveToCloud = async () => {
    setIsSavingToCloud(true);
    try {
      const recordId = await saveEvaluationToCloud(formData, currentCloudRecordId || undefined);
      setCurrentCloudRecordId(recordId);
      showToast('Cloud သို့ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ (Saved to Cloud)', '☁️');
    } catch {
      showToast('Cloud သို့ သိမ်းဆည်းရာတွင် အမှားရှိပါသည်', '⚠️');
    } finally {
      setIsSavingToCloud(false);
    }
  };

  const handleLoadCloudRecord = (record: SavedEvaluationRecord) => {
    setFormData({
      ...initialFormState,
      bookTitle: record.bookTitle || '',
      authorName: record.authorName || '',
      reviewerName: record.reviewerName || '',
      publishYear: record.publishYear || '',
      categories: record.categories || [],
      mahapadesa: { ...initialFormState.mahapadesa, ...(record.mahapadesa as any) },
      legal: { ...initialFormState.legal, ...(record.legal as any) },
      additionalNotes: record.overallNotes || '',
      signReviewerName: record.reviewerName || '',
    });
    setCurrentCloudRecordId(record.id);
    setShowCloudDrawer(false);
    showToast(`"${record.bookTitle || 'စိစစ်ချက်'}" ကို ပြန်လည်ဖွင့်လိုက်ပါပြီ`, '📂');
  };

  const handleDeleteCloudRecord = async (recordId: string, title: string) => {
    if (window.confirm(`"${title}" စိစစ်ချက်ကို Cloud မှ ပျက်ပစ်ရန် သေချာပါသလား။`)) {
      await deleteEvaluationFromCloud(recordId);
      showToast('မှတ်တမ်းကို ပျက်ပစ်ပြီးပါပြီ', '🗑️');
    }
  };

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
        [key]: value as any,
      },
    }));
  };

  const handleLegalChange = (key: keyof LegalState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      legal: {
        ...prev.legal,
        [key]: value as any,
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
    setFormData((prev) => ({
      ...prev,
      mahapadesa: {
        m1: 'ကိုက်ညီ',
        m1_note: prev.mahapadesa.m1_note || 'သံယုတ္တနိကာယ် ပါဠိတော်နှင့် ကိုက်ညီသည်။',
        m2: 'ကိုက်ညီ',
        m2_note: prev.mahapadesa.m2_note || 'ဝိနည်းသီလသိက္ခာပုဒ်များနှင့် ညီညွတ်သည်။',
        m3: 'ကိုက်ညီ',
        m3_note: prev.mahapadesa.m3_note || 'စတုရာရိယသစ္စာ ဒေသနာတော်နှင့် လျော်ညီသည်။',
        m4: 'ကိုက်ညီ',
        m4_note: prev.mahapadesa.m4_note || 'ပရမတ္ထတရားများ ကောက်ယူမှု မှန်ကန်သည်။',
      },
      legal: {
        l1: 'ကင်းရှင်း',
        l1_note: prev.legal.l1_note || 'အဓမ္မဝါဒ ကင်းရှင်းသည်။',
        l2: 'ကင်းရှင်း',
        l2_note: prev.legal.l2_note || 'မဟန ဝိနိစ္ဆယ ဆုံးဖြတ်ချက်များနှင့် ညီညွတ်သည်။',
        l3: 'ကင်းရှင်း',
        l3_note: prev.legal.l3_note || 'သံဃာ့ညီညွတ်ရေး ထိခိုက်မှု မရှိပါ။',
        l4: 'ကင်းရှင်း',
        l4_note: prev.legal.l4_note || 'ဒိဋ္ဌိ ၆၂ ပါး အယူလွဲများ ကင်းရှင်းသည်။',
        l5: 'ကင်းရှင်း',
        l5_note: prev.legal.l5_note || 'သာသနာရေး မူဝါဒများနှင့် ကိုက်ညီသည်။',
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
        bookTitle: '',
        authorName: '',
        reviewerName: '',
        signReviewerName: '',
        additionalNotes: '',
        corrections: [{ id: '1', page: '', original: '', edit: '' }],
        signDate: new Date().toISOString().split('T')[0],
      });
      setCurrentStep(1);
      showToast('ဖောင်ကို မူလအတိုင်း ပြန်စပြီးပါပြီ', '🔄');
    }
  };

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
      legal.l4 === 'ကင်းရှင်း' &&
      legal.l5 === 'ကင်းရှင်း';

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
    <div className={`min-h-screen py-6 px-3 sm:px-6 lg:px-8 font-scale-${fontScale}`}>
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-center gap-3 animate-bounce no-print">
          <span className="text-xl">{toast.icon}</span>
          <span className="font-bold text-sm sm:text-base">{toast.msg}</span>
        </div>
      )}

      {/* Top Action Toolbar & Controls */}
      <div className="max-w-6xl mx-auto mb-6 no-print space-y-3">
        <div className="bg-white rounded-2xl shadow-md border-2 border-slate-300 p-4 sm:p-5 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-800 via-red-900 to-red-950 text-amber-300 flex items-center justify-center font-bold text-2xl shadow-md shrink-0 border border-amber-500/80">
              📜
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                ဓမ္မစာအုပ် မှတ်ကျောက်တင် စိစစ်ရေးစနစ်
              </h1>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                Dhamma Book Review & Evaluation Workspace
              </p>
            </div>
          </div>

          {/* 3 Clean Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 w-full lg:w-auto">
            {/* [1] Form Fill */}
            <button
              type="button"
              onClick={() => setViewMode('wizard')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm ${
                viewMode === 'wizard' || viewMode === 'full'
                  ? 'bg-red-900 text-amber-300 ring-2 ring-red-950 shadow-md border border-amber-500/50'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
              }`}
            >
              <i className="fa-solid fa-pen-to-square text-amber-400"></i>
              <span>ဖောင်ဖြည့်မည် (Form Fill)</span>
            </button>

            {/* [2] PDF Live Preview */}
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm ${
                viewMode === 'preview'
                  ? 'bg-amber-800 text-white ring-2 ring-amber-400 shadow-md border border-amber-500'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
              }`}
            >
              <i className="fa-solid fa-eye text-amber-500"></i>
              <span>စာရွက်စာတမ်း ကြည့်မည် (PDF Live Preview)</span>
            </button>

            {/* [3] Print PDF */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md bg-red-900 hover:bg-red-950 text-white border border-amber-500/80 active:scale-95"
            >
              <i className="fa-solid fa-print text-amber-300"></i>
              <span>PDF / ပုံနှိပ်ထုတ်မည် (Print PDF)</span>
            </button>
          </div>
        </div>

        {/* Utility Sub-bar for Form Fill mode */}
        {(viewMode === 'wizard' || viewMode === 'full') && (
          <div className="bg-slate-100/90 rounded-xl border border-slate-300 p-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('wizard')}
                className={`px-3 py-1 font-bold rounded-md transition ${
                  viewMode === 'wizard'
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <i className="fa-solid fa-list-check mr-1"></i> အဆင့်အလိုက် (Wizard)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('full')}
                className={`px-3 py-1 font-bold rounded-md transition ${
                  viewMode === 'full'
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <i className="fa-solid fa-file-lines mr-1"></i> စာမျက်နှာအပြည့် (Full Form)
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Cloud Save Button */}
              <button
                type="button"
                onClick={handleSaveToCloud}
                disabled={isSavingToCloud}
                className="px-3 py-1.5 bg-red-900 hover:bg-red-950 disabled:opacity-70 text-amber-300 border border-amber-500/80 rounded-lg font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
                title="Save current evaluation to Firebase Cloud"
              >
                {isSavingToCloud ? (
                  <i className="fa-solid fa-circle-notch fa-spin text-amber-300"></i>
                ) : (
                  <i className="fa-solid fa-cloud-arrow-up text-amber-300"></i>
                )}
                <span>Cloud သို့ သိမ်းမည်</span>
              </button>

              {/* Cloud Saved Records Button */}
              <button
                type="button"
                onClick={() => setShowCloudDrawer(true)}
                className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-bold transition flex items-center gap-1.5 shadow-sm"
                title="View saved records in Cloud"
              >
                <i className="fa-solid fa-folder-open text-amber-300"></i>
                <span>မှတ်တမ်းများ ({savedRecords.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <i className="fa-solid fa-book-open text-amber-400"></i> လမ်းညွှန်ချက်
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200 rounded-lg font-bold transition flex items-center gap-1"
                title="Reset Form"
              >
                <i className="fa-solid fa-rotate-left"></i>
                <span className="hidden sm:inline">ပြန်စမည်</span>
              </button>
            </div>
          </div>
        )}

        {/* Stepper Tabs (Wizard Mode) */}
        {viewMode === 'wizard' && (
          <div className="bg-white rounded-2xl border-2 border-slate-300 p-3 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {STEP_LABELS.map((step) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => setCurrentStep(step.num)}
                    className={`p-2.5 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                      isActive
                        ? 'bg-red-900 text-white border-red-950 shadow-md'
                        : isCompleted
                        ? 'bg-emerald-50 border-emerald-400 text-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                          isActive
                            ? 'bg-amber-400 text-slate-900'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-300 text-slate-800'
                        }`}
                      >
                        {isCompleted ? '✓' : step.num}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-semibold ${
                          isActive ? 'text-amber-300' : 'text-slate-500'
                        }`}
                      >
                        Step {step.num}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm leading-tight">
                        {step.title}
                      </div>
                      <div
                        className={`text-[10px] font-medium mt-0.5 ${
                          isActive ? 'text-slate-200' : 'text-slate-500'
                        }`}
                      >
                        {step.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ON-SCREEN EDITING/VIEWING CONTAINER (Hidden during Print) */}
      <main className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl border-2 border-slate-300 no-print overflow-hidden">
        {/* Header Banner */}
        <header className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-white p-6 sm:p-8 text-center relative border-b-8 border-amber-500">
          <div className="text-3xl text-amber-300 mb-1 flex items-center justify-center">
            📜
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide">
            ဓမ္မစာအုပ် မှတ်ကျောက်တင် စိစစ်ရေးစနစ်
          </h1>
          <p className="text-sm sm:text-base text-amber-300 font-medium mt-1">
            Official Dhamma Book Canonical Evaluation Workspace (ဝိနိစ္ဆယနှင့် ပိဋကတ်တော် စိစစ်ရေး)
          </p>

          {/* Live Status Badge */}
          <div className="mt-4 inline-flex items-center gap-2.5 bg-black/40 backdrop-blur px-5 py-2 rounded-full border-2 border-amber-400/50 text-sm sm:text-base">
            <span className="text-slate-200 font-medium">အဆင့်သတ်မှတ်ချက်:</span>
            <span className={badgeInfo.badgeClass}>{badgeInfo.text}</span>
          </div>
        </header>

        {/* View Mode: Live Preview Page */}
        {viewMode === 'preview' ? (
          <div className="p-6 sm:p-10 space-y-6 bg-slate-100">
            <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <h3 className="font-bold text-base text-amber-950">
                    A4 ရလဒ် စာရွက်စာတမ်း တိုက်ရိုက် ကြည့်ရှုခြင်း (A4 Live Document Preview)
                  </h3>
                  <p className="text-xs text-slate-600">
                    အောက်ပါ စာရွက်စာတမ်းသည် ပုံနှိပ်ထုတ်ယူမည့် စာရွက်စာတမ်း ပုံစံအတိုင်း အချိန်နှင့်တပြေးညီ ပြသထားခြင်း ဖြစ်ပါသည်။
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-red-900 hover:bg-red-950 text-white rounded-xl text-xs sm:text-sm font-bold shadow transition flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-print"></i> PDF ထုတ်ယူမည်
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('wizard')}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
                >
                  <i className="fa-solid fa-pen-to-square"></i> ပြန်လည်ပြင်ဆင်မည်
                </button>
              </div>
            </div>

            {/* Render Modern A4 Document Frame inside Preview View Mode */}
            <div className="bg-[#faf8f5] p-8 sm:p-12 rounded-2xl border-2 border-slate-300 shadow-2xl ring-1 ring-slate-900/10 max-w-4xl mx-auto space-y-6 text-slate-900 font-serif leading-relaxed">
              {/* Document Header */}
              <div className="border-b-4 border-slate-900 pb-4 text-center space-y-1">
                <div className="text-3xl text-amber-900 flex justify-center">📜</div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-slate-950">
                  ဓမ္မစာအုပ် မှတ်ကျောက်တင် စိစစ်ရေး ဆုံးဖြတ်ချက်လွှာ
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 font-semibold">
                  Canonical Dhamma Book Evaluation Report (မဟာပဒေသ ၄ ပါးနှင့် ဝိနိစ္ဆယ စံနှုန်းများ)
                </p>
              </div>

              {/* Section 1 */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm sm:text-base text-red-950 border-b-2 border-slate-400 pb-1 flex items-center justify-between">
                  <span>၁။ အထွေထွေ အချက်အလက်များ (General Information)</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm bg-white p-3.5 rounded-xl border border-slate-300 shadow-sm">
                  <div><strong className="text-slate-700">စာအုပ်အမည်:</strong> <span className="font-bold text-slate-900">{formData.bookTitle || '-'}</span></div>
                  <div><strong className="text-slate-700">ရေးသားသူ:</strong> <span className="font-bold text-slate-900">{formData.authorName || '-'}</span></div>
                  <div><strong className="text-slate-700">စိစစ်သူအမည်:</strong> <span className="font-bold text-slate-900">{formData.reviewerName || '-'}</span></div>
                  <div><strong className="text-slate-700">ထုတ်ဝေသည့် ကြိမ်ရေ:</strong> <span className="font-bold text-slate-900">{formData.publishYear || '-'}</span></div>
                  <div className="col-span-2">
                    <strong className="text-slate-700">စာအုပ်အမျိုးအစား:</strong> <span className="font-bold text-slate-900">{formData.categories.join(', ') || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm sm:text-base text-red-950 border-b-2 border-slate-400 pb-1">
                  ၂။ မဟာပဒေသ ၄ ပါးဖြင့် စိစစ်ခြင်း (Canonical Consistency)
                </h3>
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-300 shadow-sm">
                  <table className="w-full text-xs sm:text-sm border-collapse">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2.5 border-r border-slate-300 text-left">စိစစ်ချက် မဟာပဒေသ</th>
                        <th className="p-2.5 border-r border-slate-300 text-center w-28">ရလဒ်</th>
                        <th className="p-2.5 text-left">မှတ်ချက် / စာမျက်နှာ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[
                        { title: '၁။ သုတ္တေ ဩတာရေတဗ္ဗ (သုတ်နှင့် နှိုင်းယှဉ်ခြင်း)', val: formData.mahapadesa.m1, note: formData.mahapadesa.m1_note },
                        { title: '၂။ ဝိနယေ သန္ဒဿေတဗ္ဗ (ဝိနည်းနှင့် တိုက်ဆိုင်ခြင်း)', val: formData.mahapadesa.m2, note: formData.mahapadesa.m2_note },
                        { title: '၃။ သစ္စာနုလောမ (စတုရာရိယသစ္စာနှင့် လျော်ညီခြင်း)', val: formData.mahapadesa.m3, note: formData.mahapadesa.m3_note },
                        { title: '၄။ ဓမ္မတာ / ပရမတ္ထ (အဘိဓမ္မာနှင့် ပဋိစ္စသမုပ္ပါဒ်)', val: formData.mahapadesa.m4, note: formData.mahapadesa.m4_note },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 border-r border-slate-200 font-semibold">{item.title}</td>
                          <td className="p-2.5 border-r border-slate-200 text-center font-bold">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              item.val === 'ကိုက်ညီ' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              item.val === 'လွဲမှား' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                              'bg-amber-100 text-amber-800 border-amber-300'
                            }`}>
                              {item.val === 'ကိုက်ညီ' ? '✓ ကိုက်ညီ' : item.val === 'လွဲမှား' ? '✗ လွဲမှား' : '? သံသယရှိ'}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-800">{item.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm sm:text-base text-red-950 border-b-2 border-slate-400 pb-1">
                  ၃။ သာသနာရေးနှင့် ဝိနိစ္ဆယဆိုင်ရာ စိစစ်ချက် (Ecclesiastical Compliance)
                </h3>
                <div className="overflow-x-auto bg-white rounded-xl border border-slate-300 shadow-sm">
                  <table className="w-full text-xs sm:text-sm border-collapse">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2.5 border-r border-slate-300 text-left">ဝိနိစ္ဆယ စိစစ်ချက်အရာ</th>
                        <th className="p-2.5 border-r border-slate-300 text-center w-28">အခြေအနေ</th>
                        <th className="p-2.5 text-left">မှတ်ချက်</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[
                        { title: '၁။ အဓမ္မဝါဒနှင့် အဝိနယဝါဒ စိစစ်ခြင်း', val: formData.legal.l1, note: formData.legal.l1_note },
                        { title: '၂။ နိုင်ငံတော် သံဃမဟာနာယကအဖွဲ့ ဝိနိစ္ဆယများ', val: formData.legal.l2, note: formData.legal.l2_note },
                        { title: '၃။ သံဃာ့ဘိန္ဒက / သံဃာ့သမဂ္ဂီ (သံဃာ့ညီညွတ်ရေး)', val: formData.legal.l3, note: formData.legal.l3_note },
                        { title: '၄။ မိစ္ဆာဒိဋ္ဌိ / ဒိဋ္ဌိ ၆၂ ပါး အယူလွဲများ', val: formData.legal.l4, note: formData.legal.l4_note },
                        { title: '၅။ သာသနာရေး မူဝါဒဆိုင်ရာ စိစစ်ချက်များ', val: formData.legal.l5, note: formData.legal.l5_note },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 border-r border-slate-200 font-medium">{item.title}</td>
                          <td className="p-2.5 border-r border-slate-200 text-center font-bold">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              item.val === 'ကင်းရှင်း' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              item.val === 'ငြိစွန်း' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                              'bg-amber-100 text-amber-800 border-amber-300'
                            }`}>
                              {item.val === 'ကင်းရှင်း' ? '✓ ကင်းရှင်း' : item.val === 'ငြိစွန်း' ? '✗ ငြိစွန်း' : '? သံသယရှိ'}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-800">{item.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm sm:text-base text-red-950 border-b border-slate-400 pb-1">
                  ၄။ ကျမ်းကိုး စိစစ်ချက်နှင့် ပါဠိ သဒ္ဒါ (Citations & Pāḷi)
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm bg-slate-50 p-3 rounded-lg border border-slate-300">
                  <div><strong>ကျမ်းကိုး ညွှန်းဆိုမှု:</strong> {formData.citationStatus}</div>
                  <div><strong>ပါဠိသဒ္ဒါ / အက္ခရာဝလိ:</strong> {formData.paliGrammar}</div>
                  <div className="col-span-2"><strong>မှတ်ချက်:</strong> {formData.paliGrammarNote || '-'}</div>
                </div>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm sm:text-base text-red-950 border-b border-slate-400 pb-1">
                  ၅။ ပြင်ဆင်ဖြည့်စွပ်/အကြံပြုချက် အသေးစိတ် (Corrections)
                </h3>
                <table className="w-full text-xs sm:text-sm border-collapse border border-slate-400">
                  <thead className="bg-slate-100 font-bold">
                    <tr>
                      <th className="p-2 border border-slate-400 w-12 text-center">စဉ်</th>
                      <th className="p-2 border border-slate-400 w-24 text-center">စာမျက်နှာ</th>
                      <th className="p-2 border border-slate-400 text-left">မူလ စာသား</th>
                      <th className="p-2 border border-slate-400 text-left">ပြင်ဆင်ချက် / အကြံပြုချက်</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.corrections.map((row, idx) => (
                      <tr key={row.id}>
                        <td className="p-2 border border-slate-400 text-center font-bold">{idx + 1}</td>
                        <td className="p-2 border border-slate-400 text-center">{row.page || '-'}</td>
                        <td className="p-2 border border-slate-400">{row.original || '-'}</td>
                        <td className="p-2 border border-slate-400">{row.edit || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section 6 & 7 */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm sm:text-base text-red-950 border-b border-slate-400 pb-1">
                  ၆။ နိဂုံးချုပ် ဆုံးဖြတ်ချက်နှင့် ၇။ စိစစ်သူ လက်မှတ်
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-300 space-y-2">
                    <div>
                      <span className="text-xs text-slate-500 font-bold block">ကျမ်းအဆင့်:</span>
                      <span className="font-bold text-base text-red-950">{formData.bookClass}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold block">နိဂုံးချုပ် အတည်ပြုချက်:</span>
                      <span className="font-bold text-base text-emerald-700">{formData.finalVerdict}</span>
                    </div>
                    <div className="text-xs text-slate-700">
                      <strong>အကြံပြုချက်:</strong> {formData.additionalNotes || '-'}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-300 space-y-3 text-right flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-slate-500 font-bold mb-6">စိစစ်သူ၏ လက်မှတ် (Signature):</div>
                      <div className="border-b border-slate-400 w-48 ml-auto mb-1"></div>
                      <div className="font-bold text-sm">{formData.signReviewerName || '-'}</div>
                      <div className="text-xs text-slate-600">{formData.signDepartment || '-'}</div>
                    </div>
                    <div className="text-xs text-slate-500">
                      ရက်စွဲ: {formData.signDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Editable Form view (Wizard or Full) */
          <form onSubmit={(e) => e.preventDefault()} className="p-6 sm:p-10 space-y-8">
            {/* STEP 1: GENERAL BOOK INFO */}
            {(viewMode === 'full' || currentStep === 1) && (
              <section className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-300 space-y-5">
                <div className="flex items-center gap-3 border-b-2 border-slate-300 pb-3">
                  <span className="w-8 h-8 bg-red-900 text-white rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow border border-amber-500">
                    ၁
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-red-950">
                    ၁။ အထွေထွေ အချက်အလက်များ (General Book Information)
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm sm:text-base">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      စာအုပ်အမည် (Book Title):
                    </label>
                    <input
                      type="text"
                      value={formData.bookTitle}
                      onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                      className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-red-900 focus:outline-none font-medium text-base sm:text-lg"
                      placeholder="စာအုပ်အမည် ရေးသွင်းပါ"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      ရေးသားသူ (Author Name):
                    </label>
                    <input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                      className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-red-900 focus:outline-none font-medium text-base sm:text-lg"
                      placeholder="ဆရာတော်/စာရေးသူ အမည်"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      စိစစ်သူအမည် (Reviewer Name):
                    </label>
                    <input
                      type="text"
                      value={formData.reviewerName}
                      onChange={(e) => handleReviewerNameChange(e.target.value)}
                      className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-red-900 focus:outline-none font-medium text-base sm:text-lg"
                      placeholder="စိစစ်သူ ပညာရှင် အမည်"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      ထုတ်ဝေသည့် ခုနှစ်/အကြိမ် (Edition):
                    </label>
                    <input
                      type="text"
                      value={formData.publishYear}
                      onChange={(e) => setFormData({ ...formData, publishYear: e.target.value })}
                      className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-red-900 focus:outline-none font-medium text-base sm:text-lg"
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
                          className="w-5 h-5 senior-input-scale text-red-900 rounded focus:ring-red-900"
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* STEP 2: MAHAPADESA 4 */}
            {(viewMode === 'full' || currentStep === 2) && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b-4 border-red-900 pb-2 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-red-900 text-white rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow border border-amber-500">
                      ၂
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-red-950">
                      ၂။ မဟာပဒေသ ၄ ပါးဖြင့် စိစစ်ခြင်း (Canonical Consistency)
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
                          <div className="font-bold text-red-950 text-base sm:text-lg">
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
                            className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-red-900 bg-white"
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
                            className="w-full p-2 border-2 border-slate-300 rounded-lg text-sm sm:text-base"
                            placeholder="ကျမ်းကိုး စာမျက်နှာ"
                          />
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition">
                        <td className="p-3 border-2 border-slate-300">
                          <div className="font-bold text-red-950 text-base sm:text-lg">
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
                            className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-red-900 bg-white"
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
                            className="w-full p-2 border-2 border-slate-300 rounded-lg text-sm sm:text-base"
                            placeholder="ကျမ်းကိုး စာမျက်နှာ"
                          />
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition">
                        <td className="p-3 border-2 border-slate-300">
                          <div className="font-bold text-red-950 text-base sm:text-lg">
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
                            className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-red-900 bg-white"
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
                            className="w-full p-2 border-2 border-slate-300 rounded-lg text-sm sm:text-base"
                            placeholder="ကျမ်းကိုး စာမျက်နှာ"
                          />
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition">
                        <td className="p-3 border-2 border-slate-300">
                          <div className="font-bold text-red-950 text-base sm:text-lg">
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
                            className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-red-900 bg-white"
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
                            className="w-full p-2 border-2 border-slate-300 rounded-lg text-sm sm:text-base"
                            placeholder="ကျမ်းကိုး စာမျက်နှာ"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* STEP 3: LEGAL & ECCLESIASTICAL COMPLIANCE (5 Rows) */}
            {(viewMode === 'full' || currentStep === 3) && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b-4 border-red-900 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-red-900 text-white rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow border border-amber-500">
                      ၃
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-red-950">
                      ၃။ သာသနာရေးနှင့် ဝိနိစ္ဆယဆိုင်ရာ စိစစ်ခြင်း (Legal & Ecclesiastical Compliance)
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
                            className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-red-900 bg-white"
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
                            className="w-full p-2 border-2 border-slate-300 rounded-lg text-sm sm:text-base"
                            placeholder="မှတ်ချက်"
                          />
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition">
                        <td className="p-3 border-2 border-slate-300">
                          <div className="font-bold text-slate-900 text-base sm:text-lg">
                            ၂။ နိုင်ငံတော် သံဃမဟာနာယကအဖွဲ့ ဝိနိစ္ဆယ/ညွှန်ကြားလွှာများ
                          </div>
                          <div className="text-xs sm:text-sm text-slate-700 font-medium">
                            ဆုံးဖြတ်ပြီးသော "အဓမ္မဝါဒ စာရင်းပါ" အယူအဆများ ပါဝင်နေခြင်း။
                          </div>
                        </td>
                        <td className="p-3 border-2 border-slate-300 text-center">
                          <select
                            value={formData.legal.l2}
                            onChange={(e) => handleLegalChange('l2', e.target.value)}
                            className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-red-900 bg-white"
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
                            className="w-full p-2 border-2 border-slate-300 rounded-lg text-sm sm:text-base"
                            placeholder="ဝိနိစ္ဆယ အမှတ်"
                          />
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition">
                        <td className="p-3 border-2 border-slate-300">
                          <div className="font-bold text-slate-900 text-base sm:text-lg">
                            ၃။ သံဃာ့ဘိန္ဒက / သံဃာ့သမဂ္ဂီ (သံဃာ့ညီညွတ်ရေး)
                          </div>
                          <div className="text-xs sm:text-sm text-slate-700 font-medium">
                            ဂိုဏ်းပေါင်းစုံ စည်းလုံးရေး ထိခိုက်စေသော သင်းခွဲ အသုံးအနှုန်းများ။
                          </div>
                        </td>
                        <td className="p-3 border-2 border-slate-300 text-center">
                          <select
                            value={formData.legal.l3}
                            onChange={(e) => handleLegalChange('l3', e.target.value)}
                            className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-red-900 bg-white"
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
                            className="w-full p-2 border-2 border-slate-300 rounded-lg text-sm sm:text-base"
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
                            className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-red-900 bg-white"
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
                            className="w-full p-2 border-2 border-slate-300 rounded-lg text-sm sm:text-base"
                            placeholder="မှတ်ချက်"
                          />
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50 transition">
                        <td className="p-3 border-2 border-slate-300">
                          <div className="font-bold text-slate-900 text-base sm:text-lg">
                            ၅။ သာသနာရေးနှင့် ယဉ်ကျေးမှု ဝန်ကြီးဌာန မူဝါဒများ
                          </div>
                          <div className="text-xs sm:text-sm text-slate-700 font-medium">
                            တရားဝင် ပုံနှိပ်ထုတ်ဝေခွင့် ဥပဒေနှင့် ညွှန်ကြားချက်များ ကိုက်ညီမှု။
                          </div>
                        </td>
                        <td className="p-3 border-2 border-slate-300 text-center">
                          <select
                            value={formData.legal.l5}
                            onChange={(e) => handleLegalChange('l5', e.target.value)}
                            className="w-full p-2 border-2 border-slate-300 rounded-lg font-bold text-base focus:ring-2 focus:ring-red-900 bg-white"
                          >
                            <option value="ကင်းရှင်း">✓ ကင်းရှင်း</option>
                            <option value="ငြိစွန်း">✗ ငြိစွန်း</option>
                            <option value="သံသယရှိ">? သံသယရှိ</option>
                          </select>
                        </td>
                        <td className="p-3 border-2 border-slate-300">
                          <input
                            type="text"
                            value={formData.legal.l5_note}
                            onChange={(e) => handleLegalChange('l5_note', e.target.value)}
                            className="w-full p-2 border-2 border-slate-300 rounded-lg text-sm sm:text-base"
                            placeholder="မှတ်ချက်"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* STEP 4: CITATIONS & DYNAMIC CORRECTIONS TABLE */}
            {(viewMode === 'full' || currentStep === 4) && (
              <div className="space-y-8">
                {/* Section 4: Citation & Pali Grammar */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border-2 border-slate-300 text-sm sm:text-base">
                  <div className="space-y-3">
                    <span className="font-bold text-red-950 text-base sm:text-lg block border-b pb-1 border-slate-300">
                      ၄။ ကျမ်းကိုး ညွှန်းဆိုမှု တိကျမှု (Citation Accuracy):
                    </span>
                    <div className="space-y-3 pt-1">
                      {[
                        { val: 'တိကျသည်', label: '✓ တိကျသည် (ပါဠိတော်၊ တွဲ၊ စာမျက်နှာ မှန်ကန်)' },
                        { val: 'မပါရှိ', label: '? မပါရှိပါ (ကျမ်းကိုး ထည့်ပေးရန် လို)' },
                        { val: 'လွဲမှားသည်', label: '✗ လွဲမှားသည် (ကျမ်းအမည်/အဓိပ္ပာယ် လွဲနေ)' },
                      ].map((opt) => (
                        <label
                          key={opt.val}
                          className="flex items-center gap-3 font-semibold cursor-pointer p-2.5 bg-white border border-slate-200 rounded-xl"
                        >
                          <input
                            type="radio"
                            name="citationStatus"
                            value={opt.val}
                            checked={formData.citationStatus === opt.val}
                            onChange={(e) => setFormData({ ...formData, citationStatus: e.target.value })}
                            className="w-5 h-5 senior-input-scale text-red-900 focus:ring-red-900"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="font-bold text-red-950 text-base sm:text-lg block border-b pb-1 border-slate-300">
                      ပါဠိသဒ္ဒါ / အက္ခရာဝလိ စိစစ်ချက် (Pāḷi & Grammar):
                    </span>
                    <div className="space-y-3 pt-1">
                      {[
                        { val: 'မှန်ကန်သည်', label: '✓ မှန်ကန်သည် (သဒ္ဒါ၊ အက္ခရာ တိကျ)' },
                        { val: 'ပြင်ဆင်ရန်ပါရှိ', label: '⚠️ ပြင်ဆင်ရန် အက္ခရာအချို့ ပါဝင်' },
                      ].map((opt) => (
                        <label
                          key={opt.val}
                          className="flex items-center gap-3 font-semibold cursor-pointer p-2.5 bg-white border border-slate-200 rounded-xl"
                        >
                          <input
                            type="radio"
                            name="paliGrammar"
                            value={opt.val}
                            checked={formData.paliGrammar === opt.val}
                            onChange={(e) => setFormData({ ...formData, paliGrammar: e.target.value })}
                            className="w-5 h-5 senior-input-scale text-red-900 focus:ring-red-900"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                      <input
                        type="text"
                        value={formData.paliGrammarNote}
                        onChange={(e) => setFormData({ ...formData, paliGrammarNote: e.target.value })}
                        className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-xl text-sm"
                        placeholder="ပါဠိ သဒ္ဒါ ပြင်ဆင်ရန် အချက်များ"
                      />
                    </div>
                  </div>
                </section>

                {/* Section 5: Dynamic Corrections Table */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b-4 border-red-900 pb-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-red-900 text-white rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow border border-amber-500">
                        ၅
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-red-950">
                        ၅။ ပြင်ဆင်ဖြည့်စွပ်/အကြံပြုချက် အသေးစိတ် ဇယား (Detailed Corrections)
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={addCorrectionRow}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow"
                    >
                      <i className="fa-solid fa-plus"></i> စာကြောင်းအသစ် တိုးမည်
                    </button>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm sm:text-base text-left border-collapse border-2 border-slate-300">
                      <thead className="bg-slate-100 text-slate-900 font-bold border-b-2 border-slate-300">
                        <tr>
                          <th className="p-3 border-2 border-slate-300 w-12 text-center">စဉ်</th>
                          <th className="p-3 border-2 border-slate-300 w-28 text-center">စာမျက်နှာ</th>
                          <th className="p-3 border-2 border-slate-300 w-2/5">မူလ စာသား/အသုံးအနှုန်း</th>
                          <th className="p-3 border-2 border-slate-300">ပြင်ဆင်ဖြည့်စွပ်ရန် အကြံပြုချက်</th>
                          <th className="p-3 border-2 border-slate-300 w-16 text-center">ဖျက်</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-slate-200 font-medium">
                        {formData.corrections.map((row, idx) => (
                          <tr key={row.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 border-2 border-slate-300 text-center font-bold text-slate-800">
                              {idx + 1}
                            </td>
                            <td className="p-3 border-2 border-slate-300 text-center">
                              <input
                                type="text"
                                value={row.page}
                                onChange={(e) => updateCorrectionRow(row.id, 'page', e.target.value)}
                                className="w-full p-2 border-2 border-slate-300 rounded-lg text-center font-bold"
                                placeholder="စာ-၁၂"
                              />
                            </td>
                            <td className="p-3 border-2 border-slate-300">
                              <textarea
                                rows={2}
                                value={row.original}
                                onChange={(e) => updateCorrectionRow(row.id, 'original', e.target.value)}
                                className="w-full p-2 border-2 border-slate-300 rounded-lg text-sm sm:text-base"
                                placeholder="မူလ ရေးသားထားချက်"
                              />
                            </td>
                            <td className="p-3 border-2 border-slate-300">
                              <textarea
                                rows={2}
                                value={row.edit}
                                onChange={(e) => updateCorrectionRow(row.id, 'edit', e.target.value)}
                                className="w-full p-2 border-2 border-slate-300 rounded-lg text-sm sm:text-base font-semibold text-slate-900"
                                placeholder="ပြင်ဆင်ရန် လမ်းညွှန်ချက်"
                              />
                            </td>
                            <td className="p-3 border-2 border-slate-300 text-center">
                              {formData.corrections.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeCorrectionRow(row.id)}
                                  className="w-8 h-8 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg transition font-bold"
                                  title="Remove row"
                                >
                                  ✕
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}

            {/* STEP 5: FINAL VERDICT & SIGN-OFF */}
            {(viewMode === 'full' || currentStep === 5) && (
              <div className="space-y-8">
                {/* Section 6: Book Classification & Final Decision */}
                <section className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-300 space-y-6">
                  <div className="flex items-center gap-3 border-b-2 border-slate-300 pb-3">
                    <span className="w-8 h-8 bg-red-900 text-white rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow border border-amber-500">
                      ၆
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-red-950">
                      ၆။ အယ်ဒီတာ/ပညာရှင်၏ နိဂုံးချုပ် ဆုံးဖြတ်ချက် (Final Verdict)
                    </h2>
                  </div>

                  {/* Classification Radio Options */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-3 text-base">
                      ကျမ်း အဆင့်သတ်မှတ်ချက် (Book Classification):
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm sm:text-base">
                      {[
                        {
                          classVal: 'Class-A',
                          badge: 'bg-emerald-700 text-white',
                          title: 'Class-A (စံပြုကျမ်း)',
                          desc: 'ပိဋကတ်တော်၊ ဝိနိစ္ဆယများနှင့် ၁၀၀% ကိုက်ညီသည်။ ပုံနှိပ်ထုတ်ဝေရန် အပြည့်အဝ ထောက်ခံသည်။',
                        },
                        {
                          classVal: 'Class-B',
                          badge: 'bg-amber-600 text-white',
                          title: 'Class-B (ပြင်ဆင်ချက်ပါ စံကျမ်း)',
                          desc: 'အသေးစား ပြင်ဆင်ချက်အချို့ ပါရှိသော်လည်း မူရင်း တရားဓမ္မ မသွေဖည်ပါ။ ပြင်ဆင်ပြီး ထုတ်ဝေနိုင်သည်။',
                        },
                        {
                          classVal: 'Class-C',
                          badge: 'bg-rose-700 text-white',
                          title: 'Class-C (စိစစ်ရန်/ပယ်ဖျက်ကျမ်း)',
                          desc: 'ဝိနိစ္ဆယ ငြိစွန်းမှု သို့မဟုတ် တရားဓမ္မ လွဲမှားချက် ပါဝင်သဖြင့် ပယ်ဖျက်/ပြန်လည်စိစစ်ရန် လိုသည်။',
                        },
                      ].map((item) => (
                        <label
                          key={item.classVal}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                            formData.bookClass === item.classVal
                              ? 'bg-white border-red-900 shadow-md ring-2 ring-red-900/20'
                              : 'bg-white border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${item.badge}`}>
                                {item.classVal}
                              </span>
                              <input
                                type="radio"
                                name="bookClass"
                                value={item.classVal}
                                checked={formData.bookClass === item.classVal}
                                onChange={(e) => setFormData({ ...formData, bookClass: e.target.value as any })}
                                className="w-5 h-5 senior-input-scale text-red-900 focus:ring-red-900"
                              />
                            </div>
                            <div className="font-bold text-slate-900 text-base">{item.title}</div>
                            <div className="text-xs text-slate-600 mt-1">{item.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Final Decision Radio Options */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-2 text-base">
                      နိဂုံးချုပ် ဆုံးဖြတ်ချက် (Final Approval):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { val: 'အတည်ပြုသည်', label: '✓ အတည်ပြုသည် (Approved)' },
                        { val: 'စာရေးသူသို့ပြန်ပြရန်', label: '⚠️ စာရေးသူသို့ ပြန်ပြရန် (Needs Revision)' },
                        { val: 'ပယ်ဖျက်သည်', label: '✗ ပယ်ဖျက်သည် (Rejected)' },
                      ].map((ver) => (
                        <label
                          key={ver.val}
                          className="flex items-center gap-3 p-3 bg-white border-2 border-slate-300 rounded-xl font-bold cursor-pointer hover:bg-slate-100"
                        >
                          <input
                            type="radio"
                            name="finalVerdict"
                            value={ver.val}
                            checked={formData.finalVerdict === ver.val}
                            onChange={(e) => setFormData({ ...formData, finalVerdict: e.target.value as any })}
                            className="w-5 h-5 senior-input-scale text-red-900 focus:ring-red-900"
                          />
                          <span>{ver.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Section 7: Official Sign-Off Box */}
                <section className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-300 space-y-5">
                  <div className="flex items-center gap-3 border-b-2 border-slate-300 pb-3">
                    <span className="w-8 h-8 bg-red-900 text-white rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow border border-amber-500">
                      ၇
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-red-950">
                      ၇။ အခြားထည့်သွင်းဖြည့်စွပ်ချက်များနှင့် စိစစ်သူ လက်မှတ် (Official Sign-off)
                    </h2>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5">
                      အခြား ထည့်သွင်းဖြည့်စွပ် လိုသောအချက်များ / အနှစ်ချုပ် အကြံပြုချက်:
                    </label>
                    <textarea
                      rows={3}
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                      className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-red-900 focus:outline-none text-base"
                      placeholder="နိဂုံးချုပ် မှတ်ချက် ရေးသားပါ"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">စိစစ်သူ အမည်:</label>
                      <input
                        type="text"
                        value={formData.signReviewerName}
                        onChange={(e) => setFormData({ ...formData, signReviewerName: e.target.value })}
                        className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">ရာထူး / အဖွဲ့အစည်း:</label>
                      <input
                        type="text"
                        value={formData.signDepartment}
                        onChange={(e) => setFormData({ ...formData, signDepartment: e.target.value })}
                        className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">ရက်စွဲ:</label>
                      <input
                        type="date"
                        value={formData.signDate}
                        onChange={(e) => setFormData({ ...formData, signDate: e.target.value })}
                        className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                </section>

                {/* Direct Preview Link Card inside Step 5 */}
                <div className="bg-amber-100/90 border-2 border-amber-400 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📄</span>
                    <div>
                      <h4 className="font-bold text-base text-amber-950">
                        ရလဒ် စာရွက်စာတမ်း ကြည့်မည် (Live A4 Preview)
                      </h4>
                      <p className="text-xs text-slate-700">
                        စိစစ်ချက် ၇ ချက်စလုံး ပြည့်စုံစွာ ပါဝင်သော A4 Document Preview ကို တိုက်ရိုက် ကြည့်ရှုပါ သို့မဟုတ် ပုံနှိပ်ပါ
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow transition flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-eye"></i> Preview ကြည့်မည်
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2.5 bg-red-900 hover:bg-red-950 text-white rounded-xl text-xs sm:text-sm font-bold shadow transition flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-print"></i> PDF/Print
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons (Wizard Mode) */}
            {viewMode === 'wizard' && (
              <div className="flex items-center justify-between pt-6 border-t-2 border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                  className={`px-5 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 transition ${
                    currentStep === 1
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                >
                  <i className="fa-solid fa-arrow-left"></i> ရှေ့သို့ (Previous)
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                    className="px-6 py-3 bg-red-900 hover:bg-red-950 text-white rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-md transition"
                  >
                    နောက်သို့ (Next Step) <i className="fa-solid fa-arrow-right"></i>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-md transition"
                  >
                    <i className="fa-solid fa-eye"></i> ရလဒ်ကြည့်မည် (Preview)
                  </button>
                )}
              </div>
            )}
          </form>
        )}

        {/* Footer */}
        <footer className="bg-slate-100 p-4 border-t-2 border-slate-300 text-center text-xs sm:text-sm text-slate-700 font-bold no-print">
          ဓမ္မစာအုပ် မှတ်ကျောက်တင် စိစစ်ရေးစနစ် • Canonical Evaluation Standards & Mahāpadesa Guidelines
        </footer>
      </main>

      {/* COMPLETE PDF PRINT TEMPLATE (@media print only block) */}
      <div className="print-only font-serif p-4 space-y-4">
        {/* Print Header Banner */}
        <div className="print-header-banner text-center space-y-1">
          <div className="text-2xl text-black font-bold flex justify-center">📜</div>
          <h1 className="text-xl font-bold text-black tracking-wide">
            ဓမ္မစာအုပ် မှတ်ကျောက်တင် စိစစ်ရေး ဆုံးဖြတ်ချက်လွှာ
          </h1>
          <p className="text-xs text-black font-semibold">
            Official Dhamma Book Canonical Evaluation Form (ဝိနိစ္ဆယနှင့် ပိဋကတ်တော် စိစစ်ရေး)
          </p>
        </div>

        {/* SECTION 1: GENERAL INFO */}
        <div className="space-y-1">
          <h2 className="font-bold text-sm text-black border-b border-black pb-0.5">
            ၁။ အထွေထွေ အချက်အလက်များ (General Book Information)
          </h2>
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="w-1/2"><strong>စာအုပ်အမည်:</strong> {formData.bookTitle || '-'}</td>
                <td className="w-1/2"><strong>ရေးသားသူ:</strong> {formData.authorName || '-'}</td>
              </tr>
              <tr>
                <td><strong>စိစစ်သူအမည်:</strong> {formData.reviewerName || '-'}</td>
                <td><strong>ထုတ်ဝေသည့် ခုနှစ်/အကြိမ်:</strong> {formData.publishYear || '-'}</td>
              </tr>
              <tr>
                <td colSpan={2}>
                  <strong>စာအုပ်အမျိုးအစား:</strong> {formData.categories.join(', ') || '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 2: MAHAPADESA 4 */}
        <div className="space-y-1">
          <h2 className="font-bold text-sm text-black border-b border-black pb-0.5">
            ၂။ မဟာပဒေသ ၄ ပါးဖြင့် စိစစ်ခြင်း (Canonical Consistency)
          </h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="text-left">စိစစ်ချက် မဟာပဒေသ</th>
                <th className="text-center w-24">ရလဒ်</th>
                <th className="text-left">မှတ်ချက် / ကျမ်းကိုး စာမျက်နှာ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold">၁။ သုတ္တေ ဩတာရေတဗ္ဗ (သုတ်နှင့် နှိုင်းယှဉ်ခြင်း)</td>
                <td className="text-center font-bold">{formData.mahapadesa.m1}</td>
                <td>{formData.mahapadesa.m1_note || '-'}</td>
              </tr>
              <tr>
                <td className="font-semibold">၂။ ဝိနယေ သန္ဒဿေတဗ္ဗ (ဝိနည်းနှင့် တိုက်ဆိုင်ခြင်း)</td>
                <td className="text-center font-bold">{formData.mahapadesa.m2}</td>
                <td>{formData.mahapadesa.m2_note || '-'}</td>
              </tr>
              <tr>
                <td className="font-semibold">၃။ သစ္စာနုလောမ (စတုရာရိယသစ္စာနှင့် လျော်ညီခြင်း)</td>
                <td className="text-center font-bold">{formData.mahapadesa.m3}</td>
                <td>{formData.mahapadesa.m3_note || '-'}</td>
              </tr>
              <tr>
                <td className="font-semibold">၄။ ဓမ္မတာ / ပရမတ္ထ (အဘိဓမ္မာနှင့် ပဋိစ္စသမုပ္ပါဒ်)</td>
                <td className="text-center font-bold">{formData.mahapadesa.m4}</td>
                <td>{formData.mahapadesa.m4_note || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 3: LEGAL & ECCLESIASTICAL COMPLIANCE (5 Rows) */}
        <div className="space-y-1">
          <h2 className="font-bold text-sm text-black border-b border-black pb-0.5">
            ၃။ သာသနာရေးနှင့် ဝိနိစ္ဆယဆိုင်ရာ စိစစ်ချက် (Ecclesiastical & Legal Compliance)
          </h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="text-left">ဝိနိစ္ဆယ စိစစ်ချက်အကြောင်းအရာ</th>
                <th className="text-center w-24">အခြေအနေ</th>
                <th className="text-left">မှတ်ချက် / ညွှန်ကြားလွှာအမှတ်</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>၁။ အဓမ္မဝါဒနှင့် အဝိနယဝါဒ စိစစ်ခြင်း</td>
                <td className="text-center font-bold">{formData.legal.l1}</td>
                <td>{formData.legal.l1_note || '-'}</td>
              </tr>
              <tr>
                <td>၂။ နိုင်ငံတော် သံဃမဟာနာယကအဖွဲ့ ဝိနိစ္ဆယများ</td>
                <td className="text-center font-bold">{formData.legal.l2}</td>
                <td>{formData.legal.l2_note || '-'}</td>
              </tr>
              <tr>
                <td>၃။ သံဃာ့ဘိန္ဒက / သံဃာ့သမဂ္ဂီ (သံဃာ့ညီညွတ်ရေး)</td>
                <td className="text-center font-bold">{formData.legal.l3}</td>
                <td>{formData.legal.l3_note || '-'}</td>
              </tr>
              <tr>
                <td>၄။ မိစ္ဆာဒိဋ္ဌိ / ဒိဋ္ဌိ ၆၂ ပါး အယူလွဲများ</td>
                <td className="text-center font-bold">{formData.legal.l4}</td>
                <td>{formData.legal.l4_note || '-'}</td>
              </tr>
              <tr>
                <td>၅။ သာသနာရေးနှင့် ယဉ်ကျေးမှု ဝန်ကြီးဌာန မူဝါဒများ</td>
                <td className="text-center font-bold">{formData.legal.l5}</td>
                <td>{formData.legal.l5_note || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 4: CITATION & PALI GRAMMAR */}
        <div className="space-y-1">
          <h2 className="font-bold text-sm text-black border-b border-black pb-0.5">
            ၄။ ကျမ်းကိုး စိစစ်ချက်နှင့် ပါဠိ သဒ္ဒါ (Citation Integrity & Pāḷi)
          </h2>
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="w-1/2"><strong>ကျမ်းကိုး ညွှန်းဆိုမှု:</strong> {formData.citationStatus}</td>
                <td className="w-1/2"><strong>ပါဠိသဒ္ဒါ / အက္ခရာဝလိ:</strong> {formData.paliGrammar}</td>
              </tr>
              <tr>
                <td colSpan={2}><strong>ပါဠိသဒ္ဒါ မှတ်ချက်:</strong> {formData.paliGrammarNote || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 5: CORRECTIONS TABLE */}
        <div className="space-y-1">
          <h2 className="font-bold text-sm text-black border-b border-black pb-0.5">
            ၅။ ပြင်ဆင်ဖြည့်စွပ်/အကြံပြုချက် အသေးစိတ် ဇယား (Detailed Corrections Table)
          </h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="w-10 text-center">စဉ်</th>
                <th className="w-20 text-center">စာမျက်နှာ</th>
                <th className="text-left">မူလ စာသား/အသုံးအနှုန်း</th>
                <th className="text-left">ပြင်ဆင်ဖြည့်စွပ်ရန် အကြံပြုချက်</th>
              </tr>
            </thead>
            <tbody>
              {formData.corrections.map((row, idx) => (
                <tr key={row.id}>
                  <td className="text-center font-bold">{idx + 1}</td>
                  <td className="text-center">{row.page || '-'}</td>
                  <td>{row.original || '-'}</td>
                  <td>{row.edit || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION 6 & 7: FINAL VERDICT & SIGN-OFF */}
        <div className="space-y-2 pt-2">
          <h2 className="font-bold text-sm text-black border-b border-black pb-0.5">
            ၆။ နိဂုံးချုပ် ဆုံးဖြတ်ချက် & ၇။ စိစစ်သူ လက်မှတ်
          </h2>
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="w-1/2 align-top">
                  <div className="space-y-1">
                    <div><strong>ကျမ်း အဆင့်သတ်မှတ်ချက်:</strong> {formData.bookClass}</div>
                    <div><strong>နိဂုံးချုပ် ဆုံးဖြတ်ချက်:</strong> {formData.finalVerdict}</div>
                    <div><strong>အကြံပြုချက်:</strong> {formData.additionalNotes || '-'}</div>
                  </div>
                </td>
                <td className="w-1/2 align-top text-right">
                  <div className="space-y-3 pt-2">
                    <div><strong>စိစစ်သူ လက်မှတ်:</strong> ______________________</div>
                    <div><strong>အမည်:</strong> {formData.signReviewerName || '-'}</div>
                    <div><strong>ရာထူး/ဌာန:</strong> {formData.signDepartment || '-'}</div>
                    <div><strong>ရက်စွဲ:</strong> {formData.signDate}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SOP Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border-2 border-amber-400 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg sm:text-xl text-red-950 flex items-center gap-2">
                <span>📜</span> ဓမ္မစာအုပ် စိစစ်ရေး လုပ်ငန်းစဉ် လမ်းညွှန် (SOP Guide)
              </h3>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-300">
                <strong className="text-amber-950 block mb-1">မဟာပဒေသ ၄ ပါး စိစစ်ခြင်း စံနှုန်း:</strong>
                ပါဠိတော်၊ အဋ္ဌကထာ၊ ဋီကာ တို့တွင် ပါဝင်သော ပါဠိအဋ္ဌာနုလောမ စိစစ်ချက်များအတိုင်း တိကျစွာ တိုက်ဆိုင်ရမည်။
              </div>

              <div className="space-y-2">
                <strong className="text-slate-900 block">စိစစ်ရေး အဆင့် ၅ ဆင့်:</strong>
                <ol className="list-decimal list-inside space-y-1.5 pl-2">
                  <li><strong>အထွေထွေ အချက်အလက်:</strong> စာအုပ်အမည်၊ ရေးသားသူ၊ စိစစ်သူနှင့် အမျိုးအစားများကို ဖြည့်သွင်းပါ။</li>
                  <li><strong>မဟာပဒေသ ၄ ပါး:</strong> သုတ်၊ ဝိနည်း၊ သစ္စာ၄ပါး၊ ပရမတ္ထတရားများနှင့် တိုက်ဆိုင်စိစစ်ပါ။</li>
                  <li><strong>ဝိနိစ္ဆယ စိစစ်ချက်:</strong> အဓမ္မဝါဒ ကင်းရှင်းရေးနှင့် သံဃမဟာနာယကအဖွဲ့ ဝိနိစ္ဆယများကို တိုက်ဆိုင်ပါ။</li>
                  <li><strong>ကျမ်းကိုးနှင့် ပြင်ဆင်ချက်:</strong> ကျမ်းကိုး တိကျမှု စိစစ်ပြီး ပြင်ဆင်ရန် စာကြောင်းများကို ဇယားတွင် ထည့်ပါ။</li>
                  <li><strong>နိဂုံးချုပ် ဆုံးဖြတ်ချက်:</strong> Class-A, B, C အဆင့် သတ်မှတ်ပြီး အတည်ပြုချက်နှင့် လက်မှတ် ထည့်သွင်းပါ။</li>
                </ol>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-300 text-emerald-950">
                <strong>ပုံနှိပ်ထုတ်ယူခြင်း:</strong> "ရလဒ် စာရွက်စာတမ်း ကြည့်မည် (Preview)" သို့မဟုတ် "PDF/ပုံနှိပ်" ခလုတ်ကို နှိပ်၍ သန့်ရှင်းသပ်ရပ်သော A4 စာရွက်စာတမ်း ထုတ်ယူနိုင်ပါသည်။
              </div>
            </div>

            <div className="text-right border-t pt-3">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2.5 bg-red-900 hover:bg-red-950 text-white font-bold rounded-xl text-xs sm:text-sm shadow"
              >
                နားလည်ပါပြီ (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Records Drawer / Modal */}
      {showCloudDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end no-print">
          <div className="bg-white w-full max-w-md sm:max-w-lg h-full p-5 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden border-l-4 border-amber-500">
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-xl bg-red-900 text-amber-300 flex items-center justify-center font-bold text-xl shadow-md border border-amber-500/50">
                    ☁️
                  </span>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                      သိမ်းဆည်းထားသော စိစစ်ချက်များ
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Firebase Firestore Records ({savedRecords.length})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCloudDrawer(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar */}
              <div className="mt-4 relative">
                <input
                  type="text"
                  placeholder="စာအုပ်အမည်၊ ရေးသားသူ သို့မဟုတ် စိစစ်သူဖြင့် ရှာရန်..."
                  value={cloudSearchQuery}
                  onChange={(e) => setCloudSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
              </div>
            </div>

            {/* Records List Container */}
            <div className="my-4 flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {isLoadingCloudRecords ? (
                <div className="text-center py-12 text-slate-500 space-y-3">
                  <i className="fa-solid fa-circle-notch fa-spin text-2xl text-amber-600"></i>
                  <p className="text-xs font-medium">Cloud မှ မှတ်တမ်းများ ရယူနေပါသည်...</p>
                </div>
              ) : savedRecords.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-2">
                  <i className="fa-solid fa-cloud-sun text-3xl text-slate-300"></i>
                  <p className="text-xs font-bold text-slate-700">သိမ်းဆည်းထားသော မှတ်တမ်း မရှိသေးပါ</p>
                  <p className="text-[11px] text-slate-500">
                    "Cloud သို့ သိမ်းမည်" ခလုတ်ကို နှိပ်၍ လက်ရှိ စိစစ်ချက်ကို Cloud ပေါ်တွင် အမြဲတမ်း သိမ်းဆည်းနိုင်ပါသည်။
                  </p>
                </div>
              ) : (
                savedRecords
                  .filter(
                    (rec) =>
                      rec.bookTitle?.toLowerCase().includes(cloudSearchQuery.toLowerCase()) ||
                      rec.authorName?.toLowerCase().includes(cloudSearchQuery.toLowerCase()) ||
                      rec.reviewerName?.toLowerCase().includes(cloudSearchQuery.toLowerCase())
                  )
                  .map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 rounded-2xl transition space-y-2 group shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-red-950 line-clamp-2">
                          {rec.bookTitle || 'ခေါင်းစဉ်မရှိ စာအုပ်'}
                        </h4>
                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {rec.verdict === 'approved' || rec.verdict === 'အတည်ပြုသည်'
                            ? 'အတည်ပြုပြီး'
                            : 'စိစစ်ဆဲ'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-0.5 font-medium">
                        <div>
                          <span className="text-slate-400">ရေးသားသူ:</span> {rec.authorName || '-'}
                        </div>
                        <div>
                          <span className="text-slate-400">စိစစ်သူ:</span> {rec.reviewerName || '-'}
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1">
                          <i className="fa-regular fa-clock mr-1"></i>
                          {rec.savedAt || 'မသိရှိရပါ'}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => handleLoadCloudRecord(rec)}
                          className="px-3 py-1 bg-red-900 hover:bg-red-950 text-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <i className="fa-solid fa-folder-open text-xs"></i> ဖွင့်ကြည့်မည် (Load)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCloudRecord(rec.id, rec.bookTitle)}
                          className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition"
                          title="Delete Record"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Firebase Live Sync
              </span>
              <button
                type="button"
                onClick={() => setShowCloudDrawer(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl"
              >
                ပိတ်မည် (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
