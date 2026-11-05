import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  LayoutDashboard, 
  FileText, 
  Tag, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  Package, 
  TrendingUp, 
  Check, 
  RefreshCw,
  Info,
  Calendar,
  Layers,
  FileSpreadsheet,
  Award,
  Sparkles,
  Sliders,
  CheckSquare,
  XCircle,
  Database
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLotId, setSelectedLotId] = useState('LOT-FG-2026-1103-01');
  const [toastMessage, setToastMessage] = useState(null);

  // --- Page 2 State: Independent Popups for Brix and Pesticide (Raw Material / Incoming Lots) ---
  const [isBrixModalOpen, setIsBrixModalOpen] = useState(false);
  const [isPestModalOpen, setIsPestModalOpen] = useState(false);

  // Brix Form State
  const [brixLotId, setBrixLotId] = useState('LOT-RM-2026-1103-04');
  const [brixReceiveDate, setBrixReceiveDate] = useState('2026-11-03');
  const [brixValue, setBrixValue] = useState(5.2);
  const [tomatoColor, setTomatoColor] = useState('แดง 40%, เหลือง 30%, ส้ม 20%, น้ำตาล 10%');

  // Pesticide Form State
  const [pestLotId, setPestLotId] = useState('LOT-RM-2026-1103-04');
  const [pestReceiveDate, setPestReceiveDate] = useState('2026-11-03');
  const [pestOrganophosphate, setPestOrganophosphate] = useState('Passed');
  const [pestOrganochlorine, setPestOrganochlorine] = useState('Passed');

  // Incoming Raw Material Lots (Page 2 data)
  const [rawMaterialLots, setRawMaterialLots] = useState([
    {
      id: 'LOT-RM-2026-1103-01',
      receiveDate: '2026-11-03',
      brix: 5.4,
      color: 'แดง 45%, เหลือง 25%, ส้ม 20%, น้ำตาล 10%',
      organophosphate: 'Passed',
      organochlorine: 'Passed',
      pesticideStatus: 'Passed'
    },
    {
      id: 'LOT-RM-2026-1103-02',
      receiveDate: '2026-11-03',
      brix: 5.1,
      color: 'แดง 40%, เหลือง 30%, ส้ม 20%, น้ำตาล 10%',
      organophosphate: 'Passed',
      organochlorine: 'Passed',
      pesticideStatus: 'Passed'
    },
    {
      id: 'LOT-RM-2026-1103-03',
      receiveDate: '2026-11-03',
      brix: 4.8,
      color: 'แดง 30%, เหลือง 40%, ส้ม 20%, น้ำตาล 10%',
      organophosphate: 'Failed',
      organochlorine: 'Passed',
      pesticideStatus: 'Failed'
    }
  ]);

  // --- Page 3 State: Finish Good Inspection ---
  const [fgInspectLotId, setFgInspectLotId] = useState('LOT-FG-2026-1103-01');
  const [fgStatusModalOpen, setFgStatusModalOpen] = useState(false);
  const [fgFailModalOpen, setFgFailModalOpen] = useState(false);
  const [activeFgItemKey, setActiveFgItemKey] = useState(null);
  const [failReason, setFailReason] = useState('');
  const [failAction, setFailAction] = useState('');
  const [newFgLotIdInput, setNewFgLotIdInput] = useState('LOT-FG-2026-1103-02');

  // Finish Good Lots Data (Page 3 & Page 4)
  const [finishGoodLots, setFinishGoodLots] = useState([
    {
      id: 'LOT-FG-2026-1103-01',
      date: '2026-11-03',
      expireDate: '2026-11-10',
      netWeight: '140 กรัม',
      linkedRmLots: ['LOT-RM-2026-1103-01', 'LOT-RM-2026-1103-02'],
      qaLabInspector: 'น.ส. พิมพ์ใจ แล็บวิเคราะห์',
      qaFgInspector: 'นาย สมชาย สินค้าดี',
      qaManager: 'ดร. ประสิทธิ์ มั่นคง',
      store: '7-Eleven Distribution Center (DC บางบัวทอง)',
      shelfLife: '7 วัน',
      temperature: '15 °C',
      fgChecks: {
        item1: { name: 'สี (Color)', spec: 'สดใส สม่ำเสมอ ไม่ซีดจาง', method: 'ตรวจสอบด้วยตา (Visual Check)', result: 'ผลการตรวจ', remark: '' },
        item2: { name: 'ลักษณะผิว (Skin Texture)', spec: 'ผิวเต่งตึง ไม่มีรอยช้ำหรือรอยแตก', method: 'ตรวจสอบด้วยตา (Visual Check)', result: 'ผลการตรวจ', remark: '' },
        item3: { name: 'บรรจุภัณฑ์ (Packaging)', spec: 'กล่อง PET ใส สะอาด แข็งแรง', method: 'ตรวจสอบด้วยตา (Visual Check)', result: 'ผลการตรวจ', remark: '' },
        item4: { name: 'รอยซีล (Seal Integrity)', spec: 'ซีลปิดสนิท ไม่หลุดร่อน ไม่มีช่องว่าง', method: 'ตรวจสอบด้วยตา (Visual Check)', result: 'ผลการตรวจ', remark: '' },
        item5: { name: 'สัดส่วนสี แดง, เหลือง, ส้ม, น้ำตาล', spec: 'ครบถ้วนสมบูรณ์ (≥90%)', method: 'ตรวจสอบด้วยการนับจำนวน', result: 'ผลการตรวจ', remark: '' },
        item6: { name: 'น้ำหนักสุทธิ (ต่อกล่อง)', spec: '140 กรัม ± 3 กรัม', method: 'ตรวจสอบด้วยเครื่องชั่งดิจิตอล', result: 'ผลการตรวจ', remark: '' }
      }
    }
  ]);

  // Page 4: Official COA Lot Selector & Raw Material Picker State
  const [isCoaModalOpen, setIsCoaModalOpen] = useState(false);
  const [isRmSelectorModalOpen, setIsRmSelectorModalOpen] = useState(false);
  const [selectedRmForCoa, setSelectedRmForCoa] = useState(['LOT-RM-2026-1103-01', 'LOT-RM-2026-1103-02']);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Handlers for Page 2: Brix & Pesticide ---
  const handleSaveBrix = (e) => {
    e.preventDefault();
    const newRm = {
      id: brixLotId,
      receiveDate: brixReceiveDate,
      brix: parseFloat(brixValue),
      color: tomatoColor,
      organophosphate: '',
      organochlorine: '',
      pesticideStatus: 'รอผลการตรวจสอบ'
    };
    setRawMaterialLots([newRm, ...rawMaterialLots]);
    setIsBrixModalOpen(false);
    showToast(`บันทึกผลการตรวจความหวาน ล็อต ${brixLotId} เรียบร้อย`);
    setBrixLotId(`LOT-RM-2026-1103-0${rawMaterialLots.length + 2}`);
  };

  const handleSavePest = (e) => {
    e.preventDefault();
    const pestStatus = (pestOrganophosphate === 'Passed' && pestOrganochlorine === 'Passed') ? 'Passed' : ((pestOrganophosphate === 'Failed' || pestOrganochlorine === 'Failed') ? 'Failed' : 'รอผลการตรวจสอบ');
    const existingIndex = rawMaterialLots.findIndex(r => r.id === pestLotId);
    if (existingIndex >= 0) {
      const updated = [...rawMaterialLots];
      updated[existingIndex] = {
        ...updated[existingIndex],
        organophosphate: pestOrganophosphate,
        organochlorine: pestOrganochlorine,
        pesticideStatus: pestStatus
      };
      setRawMaterialLots(updated);
    } else {
      setRawMaterialLots([{
        id: pestLotId,
        receiveDate: pestReceiveDate,
        brix: 5.0,
        color: 'แดง 40%, เหลือง 30%, ส้ม 20%, น้ำตาล 10%',
        organophosphate: pestOrganophosphate,
        organochlorine: pestOrganochlorine,
        pesticideStatus: pestStatus
      }, ...rawMaterialLots]);
    }
    setIsPestModalOpen(false);
    showToast(`บันทึกผลตรวจ Pesticide ล็อต ${pestLotId} สำเร็จ (${pestStatus})`);
  };

  // --- Handlers for Page 3: Finish Good Inspection ---
  const handleCreateFgLot = (e) => {
    e.preventDefault();
    if (finishGoodLots.some(f => f.id === newFgLotIdInput)) {
      showToast('หมายเลขล็อตนี้มีอยู่แล้วในระบบ');
      return;
    }
    const newFg = {
      id: newFgLotIdInput,
      date: new Date().toISOString().split('T')[0],
      expireDate: '2026-11-10',
      netWeight: '140 กรัม',
      linkedRmLots: rawMaterialLots.slice(0, 3).map(r => r.id),
      qaLabInspector: 'น.ส. พิมพ์ใจ แล็บวิเคราะห์',
      qaFgInspector: 'นาย สมชาย สินค้าดี',
      qaManager: 'ดร. ประสิทธิ์ มั่นคง',
      store: '7-Eleven Distribution Center (DC บางบัวทอง)',
      shelfLife: '7 วัน',
      temperature: '15 °C',
      fgChecks: {
        item1: { name: 'สี (Color)', spec: 'สดใส สม่ำเสมอ ไม่ซีดจาง', method: 'ตรวจสอบด้วยตา (Visual Check)', result: 'ผลการตรวจ', remark: '' },
        item2: { name: 'ลักษณะผิว (Skin Texture)', spec: 'ผิวเต่งตึง ไม่มีรอยช้ำหรือรอยแตก', method: 'ตรวจสอบด้วยตา (Visual Check)', result: 'ผลการตรวจ', remark: '' },
        item3: { name: 'บรรจุภัณฑ์ (Packaging)', spec: 'กล่อง PET ใส สะอาด แข็งแรง', method: 'ตรวจสอบด้วยตา (Visual Check)', result: 'ผลการตรวจ', remark: '' },
        item4: { name: 'รอยซีล (Seal Integrity)', spec: 'ซีลปิดสนิท ไม่หลุดร่อน ไม่มีช่องว่าง', method: 'ตรวจสอบด้วยตา (Visual Check)', result: 'ผลการตรวจ', remark: '' },
        item5: { name: 'สัดส่วนสี แดง, เหลือง, ส้ม, น้ำตาล', spec: 'ครบถ้วนสมบูรณ์ (≥90%)', method: 'ตรวจสอบด้วยการนับจำนวน', result: 'ผลการตรวจ', remark: '' },
        item6: { name: 'น้ำหนักสุทธิ (ต่อกล่อง)', spec: '140 กรัม ± 3 กรัม', method: 'ตรวจสอบด้วยเครื่องชั่งดิจิตอล', result: 'ผลการตรวจ', remark: '' }
      }
    };
    setFinishGoodLots([newFg, ...finishGoodLots]);
    setFgInspectLotId(newFg.id);
    showToast(`สร้างล็อตสินค้า Finish Good ${newFg.id} สำเร็จ`);
    setNewFgLotIdInput(`LOT-FG-2026-1103-0${finishGoodLots.length + 2}`);
  };

  const handleUpdateFgResult = (status) => {
    if (status === 'Passed') {
      setFinishGoodLots(finishGoodLots.map(f => {
        if (f.id === fgInspectLotId) {
          const updatedChecks = { ...f.fgChecks };
          updatedChecks[activeFgItemKey] = { ...updatedChecks[activeFgItemKey], result: 'Passed', remark: '' };
          return { ...f, fgChecks: updatedChecks };
        }
        return f;
      }));
      setFgStatusModalOpen(false);
      showToast('บันทึกผลตรวจสอบผ่านเกณฑ์เรียบร้อย');
    } else {
      setFgStatusModalOpen(false);
      setFailReason('');
      setFailAction('');
      setFgFailModalOpen(true);
    }
  };

  const handleSaveFailRemark = (e) => {
    e.preventDefault();
    setFinishGoodLots(finishGoodLots.map(f => {
      if (f.id === fgInspectLotId) {
        const updatedChecks = { ...f.fgChecks };
        updatedChecks[activeFgItemKey] = { 
          ...updatedChecks[activeFgItemKey], 
          result: 'Failed', 
          remark: `สาเหตุ: ${failReason} | แก้ไข: ${failAction}` 
        };
        return { ...f, fgChecks: updatedChecks };
      }
      return f;
    }));
    setFgFailModalOpen(false);
    showToast('บันทึกหมายเหตุความไม่ผ่านเกณฑ์เรียบร้อย');
  };

  // Strict Overall Status Calculation: If any item is Failed or still 'ผลการตรวจ', overall is not Passed.
  const getFgOverallStatus = (fgLot) => {
    if (!fgLot || !fgLot.fgChecks) return 'Failed';
    const checks = Object.values(fgLot.fgChecks);
    const hasFailed = checks.some(c => c.result === 'Failed');
    const hasUnchecked = checks.some(c => c.result === 'ผลการตรวจ');
    if (hasFailed || hasUnchecked) return 'Failed';
    return 'Passed';
  };

  const currentFgLot = finishGoodLots.find(f => f.id === selectedLotId) || finishGoodLots[0];
  const activeInspectionFg = finishGoodLots.find(f => f.id === fgInspectLotId) || finishGoodLots[0];

  // Dashboard calculations
  const totalFgLots = finishGoodLots.length;
  const passedFgCount = finishGoodLots.filter(f => getFgOverallStatus(f) === 'Passed').length;
  const failedFgCount = totalFgLots - passedFgCount;
  const passedPestRmCount = rawMaterialLots.filter(r => r.pesticideStatus === 'Passed').length;
  const avgBrixVal = (rawMaterialLots.reduce((acc, curr) => acc + curr.brix, 0) / (rawMaterialLots.length || 1)).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 transition-all animate-bounce border border-emerald-500">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* --- POPUP 1: Brix & Color Modal (Page 2) --- */}
      {isBrixModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-teal-100 p-2.5 rounded-2xl text-teal-700">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">บันทึกผลตรวจความหวาน & สีมะเขือเทศ</h3>
                  <p className="text-xs text-slate-500">สำหรับล็อตสินค้ารับเข้า (Raw Material)</p>
                </div>
              </div>
              <button onClick={() => setIsBrixModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveBrix} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">หมายเลขล็อตสินค้ารับเข้า</label>
                <input
                  type="text"
                  value={brixLotId}
                  onChange={(e) => setBrixLotId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">วันที่รับเข้า</label>
                <input
                  type="date"
                  value={brixReceiveDate}
                  onChange={(e) => setBrixReceiveDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">ระดับความหวาน (Brix) [เกณฑ์ ≥ 5]</label>
                <input
                  type="number"
                  step="0.1"
                  value={brixValue}
                  onChange={(e) => setBrixValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">สีมะเขือเทศ (Tomato Color Breakdown)</label>
                <input
                  type="text"
                  value={tomatoColor}
                  onChange={(e) => setTomatoColor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  placeholder="เช่น แดง 40%, เหลือง 30%, ส้ม 20%, น้ำตาล 10%"
                  required
                />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsBrixModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 font-semibold">ยกเลิก</button>
                <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md">บันทึกผล Brix</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP 2: Pesticide Modal (Page 2) --- */}
      {isPestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-100 p-2.5 rounded-2xl text-emerald-700">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">บันทึกผลตรวจสารเคมี (Pesticide)</h3>
                  <p className="text-xs text-slate-500">สำหรับล็อตสินค้ารับเข้า (Raw Material)</p>
                </div>
              </div>
              <button onClick={() => setIsPestModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSavePest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">หมายเลขล็อตสินค้ารับเข้า</label>
                <input
                  type="text"
                  value={pestLotId}
                  onChange={(e) => setPestLotId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  1. Organophosphate & Carbamate
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPestOrganophosphate('Passed')}
                    className={`py-2.5 rounded-xl font-bold text-xs border ${pestOrganophosphate === 'Passed' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700'}`}
                  >
                    Passed (ผ่าน)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPestOrganophosphate('Failed')}
                    className={`py-2.5 rounded-xl font-bold text-xs border ${pestOrganophosphate === 'Failed' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-700'}`}
                  >
                    Failed (ไม่ผ่าน)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  2. Organochlorine & Pyrethroid
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPestOrganochlorine('Passed')}
                    className={`py-2.5 rounded-xl font-bold text-xs border ${pestOrganochlorine === 'Passed' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700'}`}
                  >
                    Passed (ผ่าน)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPestOrganochlorine('Failed')}
                    className={`py-2.5 rounded-xl font-bold text-xs border ${pestOrganochlorine === 'Failed' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-700'}`}
                  >
                    Failed (ไม่ผ่าน)
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsPestModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 font-semibold">ยกเลิก</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md">บันทึกผล Pesticide</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP 3: Finish Good Item Status Evaluation (Page 3) --- */}
      {fgStatusModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-6 text-center">
            <div className="bg-emerald-50 w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckSquare className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">เลือกผลการตรวจ (Passed / Failed)</h3>
              <p className="text-xs text-slate-500 mt-1">ประเมินผลการตรวจสอบหัวข้อนี้สำหรับสินค้าสำเร็จรูป</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleUpdateFgResult('Passed')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl shadow-md text-sm transition-all"
              >
                Passed (ผ่าน)
              </button>
              <button
                onClick={() => handleUpdateFgResult('Failed')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl shadow-md text-sm transition-all"
              >
                Failed (ไม่ผ่าน)
              </button>
            </div>
            <button onClick={() => setFgStatusModalOpen(false)} className="text-xs font-semibold text-slate-400 hover:text-slate-600">ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* --- POPUP 4: Finish Good Rejection Remark (Page 3) --- */}
      {fgFailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2.5 rounded-2xl text-red-700">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">บันทึกข้อบกพร่อง (Failed Remarks)</h3>
                  <p className="text-xs text-slate-500">ระบุสาเหตุที่ไม่ผ่านเกณฑ์และวิธีแก้ไข</p>
                </div>
              </div>
              <button onClick={() => setFgFailModalOpen(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveFailRemark} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">สาเหตุที่ไม่ผ่านเกณฑ์ (Reason)</label>
                <textarea
                  value={failReason}
                  onChange={(e) => setFailReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-semibold"
                  rows="3"
                  placeholder="เช่น สีไม่สม่ำเสมอ หรือน้ำหนักต่ำกว่าเกณฑ์..."
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">วิธีแก้ไข / การจัดการ (Corrective Action)</label>
                <input
                  type="text"
                  value={failAction}
                  onChange={(e) => setFailAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  placeholder="เช่น คัดแยกสินค้าออกจากไลน์ผลิต..."
                  required
                />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setFgFailModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">ยกเลิก</button>
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md">บันทึกผลไม่ผ่าน</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP 6: Raw Material Selector for COA (Page 4) --- */}
      {isRmSelectorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-teal-100 p-2.5 rounded-2xl text-teal-700">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">เลือก Lot วัตถุดิบ (Raw Material)</h3>
                  <p className="text-xs text-slate-500">เลือก 3-5 ล็อตสำหรับแสดงในใบ COA ทางการ</p>
                </div>
              </div>
              <button onClick={() => setIsRmSelectorModalOpen(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {rawMaterialLots.map(rm => {
                const isSelected = selectedRmForCoa.includes(rm.id);
                return (
                  <div
                    key={rm.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedRmForCoa(selectedRmForCoa.filter(id => id !== rm.id));
                      } else {
                        if (selectedRmForCoa.length < 5) {
                          setSelectedRmForCoa([...selectedRmForCoa, rm.id]);
                        } else {
                          showToast('เลือกได้สูงสุด 5 ล็อต');
                        }
                      }
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                      isSelected ? 'bg-teal-50 border-teal-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{rm.id} (รับเข้า: {rm.receiveDate})</p>
                      <p className="text-xs text-slate-500">Brix: {rm.brix} °Bx | Pesticide: {rm.pesticideStatus}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-xl ${isSelected ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {isSelected ? 'เลือกแล้ว' : 'เลือก'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setIsRmSelectorModalOpen(false)} className="bg-teal-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm w-full shadow-md">ยืนยันการเลือกวัตถุดิบ</button>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP 7: Finish Good Lot Selector for COA (Page 4) --- */}
      {isCoaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-100 p-2.5 rounded-2xl text-emerald-700">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">เลือก Lot สินค้า Finish Good สำหรับออก COA</h3>
                  <p className="text-xs text-slate-500">เลือกหมายเลขล็อตผลิตภัณฑ์สำเร็จรูปที่ต้องการแสดงผล</p>
                </div>
              </div>
              <button onClick={() => setIsCoaModalOpen(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {finishGoodLots.map(fg => {
                const isSelected = selectedLotId === fg.id;
                const overallStatus = getFgOverallStatus(fg);
                return (
                  <div
                    key={fg.id}
                    onClick={() => {
                      setSelectedLotId(fg.id);
                      setIsCoaModalOpen(false);
                      showToast(`เปลี่ยนการแสดงผล COA เป็นล็อต ${fg.id}`);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                      isSelected ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{fg.id}</p>
                      <p className="text-xs text-slate-500">วันที่ผลิต: {fg.date} | สถานะ: {overallStatus}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-xl ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {isSelected ? 'กำลังแสดง' : 'เลือก'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setIsCoaModalOpen(false)} className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm w-full shadow-md">ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-lg sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
              <ClipboardCheck className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">COA Pro (7-Eleven Retail Spec)</h1>
              <p className="text-xs text-emerald-200">ระบบตรวจสอบและออกใบรับรองผลวิเคราะห์มะเขือเทศคละสี 140g</p>
            </div>
          </div>
          <div className="bg-emerald-950 px-3.5 py-2 rounded-xl border border-emerald-700/50 text-xs flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-medium">CP ALL Retail Link: Active</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-[73px] z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-2 py-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
              activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>1. สรุปภาพรวม</span>
          </button>

          <button
            onClick={() => setActiveTab('labInput')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
              activeTab === 'labInput' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>2. Lab Data Input สินค้ารับเข้า</span>
          </button>

          <button
            onClick={() => setActiveTab('finishGood')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
              activeTab === 'finishGood' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. ผลการตรวจสินค้า Finish good</span>
          </button>

          <button
            onClick={() => setActiveTab('coa')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
              activeTab === 'coa' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>4. เอกสาร COA ทางการ (Official)</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0">
        
        {/* ================= 1. DASHBOARD VIEW (สรุปภาพรวม) ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">สรุปภาพรวม (Overview Dashboard)</h2>
              <p className="text-sm text-slate-600 mt-1">รายงานสรุปสถานะล็อตสินค้า ผลตรวจสอบกายภาพ และผลวิเคราะห์สารเคมี</p>
            </div>

            {/* 4 Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">1. จำนวน Lot ทั้งหมด</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{totalFgLots} <span className="text-sm font-normal text-slate-500">ล็อต</span></p>
                </div>
                <div className="bg-blue-50 p-3.5 rounded-2xl text-blue-600 shadow-inner">
                  <Package className="w-7 h-7" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">2. ผลการตรวจสอบ</p>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-700">ผ่าน</p>
                    <p className="text-xl font-black text-emerald-800">{passedFgCount}</p>
                  </div>
                  <div className="bg-red-50 p-2 rounded-xl border border-red-100">
                    <p className="text-[10px] font-bold text-red-700">ไม่ผ่าน/Pending</p>
                    <p className="text-xl font-black text-red-800">{failedFgCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">3. ผลตรวจ Pesticide</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <div>
                      <span className="text-2xl font-black text-emerald-700">{passedPestRmCount}</span>
                      <p className="text-[10px] text-slate-500 font-semibold">ผ่าน</p>
                    </div>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div>
                      <span className="text-2xl font-black text-slate-600">{rawMaterialLots.length - passedPestRmCount}</span>
                      <p className="text-[10px] text-slate-500 font-semibold">รอผล/ไม่ผ่าน</p>
                    </div>
                  </div>
                </div>
                <div className="bg-teal-50 p-3.5 rounded-2xl text-teal-600 shadow-inner">
                  <ShieldCheck className="w-7 h-7" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">4. ผลตรวจ Brix (เฉลี่ย)</p>
                  <p className="text-3xl font-black text-teal-700 mt-2">{avgBrixVal} <span className="text-sm font-normal text-slate-500">°Bx</span></p>
                </div>
                <div className="bg-amber-50 p-3.5 rounded-2xl text-amber-600 shadow-inner">
                  <Award className="w-7 h-7" />
                </div>
              </div>
            </div>

            {/* Finish Good Lots Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-8">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  <span>รายการล็อตสินค้าและผลตรวจวิเคราะห์ (Production Lots)</span>
                </h3>
                <span className="text-xs text-slate-500">ข้อมูลเชื่อมโยงอัตโนมัติจากผลการตรวจ Finish Good</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-600 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">หมายเลขล็อต (FG)</th>
                      <th className="py-3.5 px-4">วันที่ผลิต</th>
                      <th className="py-3.5 px-4">Pesticide (Raw Mat.)</th>
                      <th className="py-3.5 px-4">ผลตรวจสอบด้านกายภาพ</th>
                      <th className="py-3.5 px-4">สถานะภาพรวม</th>
                      <th className="py-3.5 px-4 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {finishGoodLots.map((fg) => {
                      const overall = getFgOverallStatus(fg);
                      const isPassed = overall === 'Passed';
                      return (
                        <tr key={fg.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{fg.id}</td>
                          <td className="py-3.5 px-4 text-slate-600">{fg.date}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              Passed
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              {isPassed ? 'Passed (ผ่าน)' : 'Pending / Failed'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {isPassed ? 'Approved (ผ่าน)' : 'Pending Review'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setSelectedLotId(fg.id);
                                setActiveTab('coa');
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
                            >
                              ดู COA
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. LAB DATA INPUT (Lab Data Input สินค้ารับเข้า) ================= */}
        {activeTab === 'labInput' && (
          <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl font-black text-slate-900">Lab Data Input สินค้ารับเข้า (Raw Material)</h2>
              <p className="text-sm text-slate-600 mt-1">แยกการตรวจ Brix และ Pesticide ออกจากกันอย่างชัดเจน พร้อมแสดง "รอผลการตรวจสอบ" หากยังไม่บันทึก</p>
            </div>

            {/* Table 1: Brix & Color Inspection */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                  <span>ตารางบันทึกผลการตรวจความหวาน (Brix) และสีมะเขือเทศ</span>
                </h3>
                <button
                  onClick={() => setIsBrixModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ ลงข้อมูล Brix & สี (Pop-up)</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase">
                      <th className="py-3 px-4">หมายเลขล็อต (Raw Material)</th>
                      <th className="py-3 px-4">วันที่รับเข้า</th>
                      <th className="py-3 px-4">ระดับความหวาน (Brix) [≥ 5]</th>
                      <th className="py-3 px-4">สีมะเขือเทศ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rawMaterialLots.map((rm) => (
                      <tr key={`brix-${rm.id}`} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{rm.id}</td>
                        <td className="py-3 px-4 text-slate-600">{rm.receiveDate}</td>
                        <td className="py-3 px-4 font-semibold text-teal-700">{rm.brix} °Bx</td>
                        <td className="py-3 px-4 text-slate-600 text-xs">{rm.color}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Pesticide Inspection */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>ตารางบันทึกผลการตรวจ Pesticide (สารเคมีตกค้าง)</span>
                </h3>
                <button
                  onClick={() => setIsPestModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ ลงข้อมูล Pesticide (Pop-up)</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase">
                      <th className="py-3 px-4">หมายเลขล็อต (Raw Material)</th>
                      <th className="py-3 px-4">Organophosphate & Carbamate</th>
                      <th className="py-3 px-4">Organochlorine & Pyrethroid</th>
                      <th className="py-3 px-4 text-center">ผลสรุป Pesticide</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rawMaterialLots.map((rm) => {
                      const pestRes = rm.pesticideStatus || 'รอผลการตรวจสอบ';
                      return (
                        <tr key={`pest-${rm.id}`} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">{rm.id}</td>
                          <td className="py-3 px-4 font-semibold text-xs text-slate-700">{rm.organophosphate || 'รอผลการตรวจสอบ'}</td>
                          <td className="py-3 px-4 font-semibold text-xs text-slate-700">{rm.organochlorine || 'รอผลการตรวจสอบ'}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              pestRes === 'Passed' ? 'bg-emerald-100 text-emerald-800' :
                              pestRes === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {pestRes}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= 3. FINISH GOOD INSPECTION (ผลการตรวจสินค้า Finish good) ================= */}
        {activeTab === 'finishGood' && (
          <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              
              {/* Header & Create FG Lot Form */}
              <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                    <Award className="w-6 h-6 text-emerald-600" />
                    <span>3. ผลการตรวจสินค้า Finish good (ผลิตภัณฑ์สำเร็จรูป)</span>
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">วิธีการตรวจสอบจำแนกตามเกณฑ์ และปุ่มบันทึกผลที่มุมขวาล่าง</p>
                </div>

                <form onSubmit={handleCreateFgLot} className="flex items-center space-x-2 w-full md:w-auto">
                  <input
                    type="text"
                    value={newFgLotIdInput}
                    onChange={(e) => setNewFgLotIdInput(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                    placeholder="LOT-FG-..."
                    required
                  />
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm">
                    + สร้างล็อต FG
                  </button>
                </form>
              </div>

              {/* Selector for active FG lot */}
              <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">เลือกล็อตสินค้า Finish Good ที่ต้องการตรวจ:</span>
                <select
                  value={fgInspectLotId}
                  onChange={(e) => setFgInspectLotId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm font-bold text-emerald-800"
                >
                  {finishGoodLots.map(f => (
                    <option key={f.id} value={f.id}>{f.id} ({f.date})</option>
                  ))}
                </select>
              </div>

              {/* 6 Items Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">หัวข้อการตรวจสอบด้านกายภาพ</th>
                      <th className="py-3.5 px-4">เกณฑ์กำหนด (Specification)</th>
                      <th className="py-3.5 px-4">วิธีการตรวจ (Method)</th>
                      <th className="py-3.5 px-4 text-center">ผลการตรวจ (Result)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {Object.entries(activeInspectionFg.fgChecks || {}).map(([key, check]) => {
                      const isUnchecked = check.result === 'ผลการตรวจ';
                      const isPassed = check.result === 'Passed';
                      return (
                        <tr 
                          key={key} 
                          onClick={() => {
                            setActiveFgItemKey(key);
                            setFgStatusModalOpen(true);
                          }}
                          className="hover:bg-emerald-50/50 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-900">{check.name}</td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs">{check.spec}</td>
                          <td className="py-3.5 px-4 text-slate-500 text-xs">{check.method}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                              isPassed ? 'bg-emerald-100 text-emerald-800' :
                              isUnchecked ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isPassed ? 'Passed (ผ่าน)' : isUnchecked ? 'ผลการตรวจ' : 'Failed (ไม่ผ่าน)'}
                            </span>
                            {check.remark && <p className="text-[11px] text-red-600 mt-1 font-medium">{check.remark}</p>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Bottom Right Save Button Popup trigger */}
              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-slate-400">* คลิกที่แถวตารางเพื่อเปลี่ยนผล Passed / Failed แต่ละข้อ</p>
                <button
                  onClick={() => {
                    showToast(`บันทึกผลตรวจสอบล็อต ${fgInspectLotId} เรียบร้อยแล้ว`);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg text-sm flex items-center space-x-2 transition-transform transform active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  <span>บันทึกผลการตรวจสอบ</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ================= 4. OFFICIAL COA DOCUMENT (เอกสาร COA ทางการ Official) ================= */}
        {activeTab === 'coa' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center print:hidden">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold text-slate-700">ล็อต Finish Good:</span>
                <span className="bg-emerald-50 text-emerald-800 font-black px-3.5 py-1.5 rounded-xl border border-emerald-200 text-sm">
                  {currentFgLot.id}
                </span>
                <button
                  onClick={() => setIsCoaModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  เลือก Lot สินค้า (Pop-up)
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsRmSelectorModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  เลือก Lot วัตถุดิบ Lab
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>ปริ้น / เซฟ PDF (A4)</span>
                </button>
              </div>
            </div>

            {/* A4 Paper COA */}
            <div className="bg-white rounded-3xl border border-slate-300 shadow-2xl p-8 sm:p-14 max-w-4xl mx-auto print:shadow-none print:border-none print:p-6 space-y-6">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-800 text-white p-3 rounded-2xl shadow-md">
                    <ShieldCheck className="w-8 h-8 text-emerald-200" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">บริษัท เฟรชโปร อินเตอร์ฟู้ดส์ จำกัด</h2>
                    <p className="text-xs text-slate-600">Fresh Pro Interfoods Co., Ltd.</p>
                    <p className="text-[11px] text-slate-500 mt-1">99/9 หมู่ 5 นิคมอุตสาหกรรมเกษตร บางบัวทอง นนทบุรี 11110</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-800 text-white text-xs font-black px-3.5 py-1.5 rounded-xl uppercase">7-Eleven Retail Spec</span>
                  <p className="text-xs font-bold text-slate-700 mt-2">CERTIFICATE OF ANALYSIS</p>
                  <p className="text-[11px] font-semibold text-slate-500">เลขที่: COA-{currentFgLot.id}</p>
                </div>
              </div>

              {/* General Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-sm">
                <div className="space-y-2">
                  <p><span className="font-bold text-slate-700">ชื่อผลิตภัณฑ์:</span> มะเขือเทศคละสี (Mixed Color Tomato)</p>
                  <p><span className="font-bold text-slate-700">น้ำหนักสุทธิ / บรรจุภัณฑ์:</span> {currentFgLot.netWeight} (กล่อง PET ใส)</p>
                  <p><span className="font-bold text-slate-700">หมายเลขล็อตสินค้า (FG):</span> <span className="font-black text-emerald-800">{currentFgLot.id}</span></p>
                  <p><span className="font-bold text-slate-700">วันที่ผลิต (MFG):</span> {currentFgLot.date}</p>
                  <p><span className="font-bold text-slate-700">วันหมดอายุ (EXP):</span> <span className="font-bold text-red-600">{currentFgLot.expireDate}</span></p>
                </div>
                <div className="space-y-2">
                  <p><span className="font-bold text-slate-700">ปลายทางจัดส่ง:</span> {currentFgLot.store}</p>
                  <p><span className="font-bold text-slate-700">อายุการเก็บรักษา:</span> {currentFgLot.shelfLife} (อุณหภูมิ {currentFgLot.temperature})</p>
                  <p><span className="font-bold text-slate-700">QR Traceability:</span> <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border">TR-711-{currentFgLot.id}</span></p>
                </div>
              </div>

              {/* Raw Material Origins (Selected lots) */}
              <div>
                <h3 className="font-bold text-slate-900 mb-2.5 text-xs uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>แหล่งที่มาวัตถุดิบและผลตรวจ Lab (เลือกล็อตวัตถุดิบได้)</span>
                  </span>
                  <button onClick={() => setIsRmSelectorModalOpen(true)} className="text-teal-700 hover:underline text-[11px] print:hidden">เปลี่ยนล็อตวัตถุดิบ</button>
                </h3>
                <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                  <thead>
                    <tr className="bg-slate-200 text-slate-700 font-bold uppercase">
                      <th className="border border-slate-300 py-2.5 px-3">Raw Material Lot</th>
                      <th className="border border-slate-300 py-2.5 px-3">วันที่รับเข้า</th>
                      <th className="border border-slate-300 py-2.5 px-3">ความหวาน (Brix)</th>
                      <th className="border border-slate-300 py-2.5 px-3">สีมะเขือเทศ</th>
                      <th className="border border-slate-300 py-2.5 px-3 text-center">ผลตรวจ Pesticide</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawMaterialLots
                      .filter(rm => selectedRmForCoa.includes(rm.id))
                      .map((rm) => (
                        <tr key={`rm-table-${rm.id}`}>
                          <td className="border border-slate-300 py-2 px-3 font-semibold">{rm.id}</td>
                          <td className="border border-slate-300 py-2 px-3">{rm.receiveDate}</td>
                          <td className="border border-slate-300 py-2 px-3 text-teal-700 font-bold">{rm.brix} °Bx</td>
                          <td className="border border-slate-300 py-2 px-3 text-slate-600">{rm.color}</td>
                          <td className="border border-slate-300 py-2 px-3 text-center font-bold text-emerald-700">{rm.pesticideStatus}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Finish Good Physical Inspection */}
              <div>
                <h3 className="font-bold text-slate-900 mb-2.5 text-xs uppercase tracking-wider flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                  <span>ผลการตรวจสินค้า Finish good (สำเร็จรูป)</span>
                </h3>
                <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                  <thead>
                    <tr className="bg-slate-200 text-slate-700 font-bold uppercase">
                      <th className="border border-slate-300 py-2.5 px-3">หัวข้อตรวจสอบด้านกายภาพ</th>
                      <th className="border border-slate-300 py-2.5 px-3">เกณฑ์กำหนด 7-Eleven</th>
                      <th className="border border-slate-300 py-2.5 px-3 text-center">ผลการตรวจสอบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(currentFgLot.fgChecks || {}).map(([key, check]) => (
                      <tr key={key}>
                        <td className="border border-slate-300 py-2 px-3 font-semibold">{check.name}</td>
                        <td className="border border-slate-300 py-2 px-3 text-slate-600">{check.spec}</td>
                        <td className="border border-slate-300 py-2 px-3 text-center font-bold text-emerald-700">
                          {check.result === 'Passed' ? 'Passed (ผ่าน)' : (check.result === 'ผลการตรวจ' ? 'รอผลตรวจ' : 'Failed (ไม่ผ่าน)')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Overall Conclusion (If any item failed or pending -> must not pass) */}
              {(() => {
                const isPassed = getFgOverallStatus(currentFgLot) === 'Passed';
                return (
                  <div className={`p-4 rounded-2xl border ${isPassed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="font-bold text-xs uppercase tracking-wider text-slate-900">สรุปผลการตรวจสอบ COA (Conclusion):</p>
                    <p className={`text-sm font-bold mt-1 ${isPassed ? 'text-emerald-800' : 'text-red-700'}`}>
                      {isPassed 
                        ? `✓ สินค้าล็อต ${currentFgLot.id} ผ่านการตรวจสอบครบถ้วนตามข้อกำหนดมาตรฐาน 7-Eleven พร้อมส่งจำหน่าย`
                        : `✕ ผลการตรวจสอบไม่ผ่านเกณฑ์ หรือมีรายการรอผลตรวจ ไม่สามารถส่งสินค้าขายเซเว่นได้ (Rejected)`}
                    </p>
                  </div>
                );
              })()}

              {/* Signatures */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
                <div className="space-y-4">
                  <div className="border-b border-dashed border-slate-400 pb-8"><p className="font-serif italic text-slate-700 font-bold">Pimjai Lab</p></div>
                  <div>
                    <p className="font-bold text-slate-900">({currentFgLot.qaLabInspector})</p>
                    <p className="text-slate-500 text-[11px]">1. ผู้บันทึกข้อมูล QC Lab</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-b border-dashed border-slate-400 pb-8"><p className="font-serif italic text-slate-700 font-bold">Somchai FG</p></div>
                  <div>
                    <p className="font-bold text-slate-900">({currentFgLot.qaFgInspector})</p>
                    <p className="text-slate-500 text-[11px]">2. ผู้บันทึกข้อมูล QC Finish Good</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-b border-dashed border-slate-400 pb-8"><p className="font-serif italic text-slate-700 font-bold">Dr. Prasit</p></div>
                  <div>
                    <p className="font-bold text-slate-900">({currentFgLot.qaManager})</p>
                    <p className="text-slate-500 text-[11px]">ผู้อนุมัติปล่อยสินค้า (QA Manager)</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      <footer className="bg-white border-t border-slate-200 py-4 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          COA Pro System (7-Eleven Retail Spec) • รองรับมาตรฐานการตรวจสอบย้อนกลับ CP ALL
        </div>
      </footer>
    </div>
  );
}