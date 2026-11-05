import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  LayoutDashboard, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  Printer, 
  ShieldCheck, 
  Package, 
  Award, 
  Sliders, 
  CheckSquare, 
  Database,
  Layers,
  ArrowRight,
  Sparkles,
  QrCode,
  Calendar,
  Check,
  Building2,
  Clock,
  Thermometer,
  Scale,
  Download,
  Plus,
  Minus,
  Palette,
  Eye,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

interface RawMaterialLot {
  id: string;
  receiveDate: string;
  testDate: string; // วันที่ตรวจ Lab
  brix: number;
  color: string;
  organophosphate: string;
  organochlorine: string;
  pesticideStatus: 'Passed' | 'Failed' | 'รอผลการตรวจสอบ';
}

interface FgCheckItem {
  name: string;
  spec: string;
  method: string;
  result: 'Passed' | 'Failed' | 'ผลการตรวจ';
  remark?: string;
  detail?: string;
}

interface FinishGoodLot {
  id: string;
  date: string;
  expireDate: string;
  netWeight: string;
  linkedRmLots: string[];
  qaLabInspector: string;
  qaFgInspector: string;
  qaManager: string;
  store: string;
  shelfLife: string;
  temperature: string;
  customerName: string; // ชื่อคู่ค้า / ลูกค้า
  distributionCenter: string; // ศูนย์กระจายสินค้า (DC)
  poNumber: string; // เลขที่ใบสั่งซื้อ (PO No.)
  releaseDate: string; // วันที่ตรวจปล่อย
  inspectionTime: string; // เวลาตรวจ
  // ข้อมูลตรวจสอบเฉพาะทาง
  colorBreakdown: { [colorName: string]: number }; // สัดส่วนสี 3-5 สี รวม 100% (บังคับมีเขียว + แดง/ชมพู)
  boxWeights: number[]; // ผลสุ่มตรวจน้ำหนัก 10-20 กล่อง
  orderQty: number; // ยอดสั่งซื้อ
  actualQty: number; // ยอดบรรจุจริง
  basketCount: number; // จำนวนตะกร้า
  measuredTemp: number; // อุณหภูมิห้องขณะตรวจ (°C)
  fgChecks: {
    item1: FgCheckItem;
    item2: FgCheckItem;
    item3: FgCheckItem;
    item4: FgCheckItem;
    item5: FgCheckItem;
    item6: FgCheckItem;
    item7: FgCheckItem;
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'labInput' | 'finishGood' | 'coa'>('dashboard');
  const [selectedLotId, setSelectedLotId] = useState<string>('LOT-FG-2026-1103-01');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 6 Tomato Colors Spec: แดง, ช็อคโกแลต, เขียว, เหลือง, ส้ม, ชมพู
  const TOMATO_COLOR_PALETTE = [
    { name: 'แดง', dot: 'bg-red-500', hex: '#ef4444', badge: 'bg-red-50 text-red-700 border-red-200' },
    { name: 'ช็อคโกแลต', dot: 'bg-[#5c2c16]', hex: '#5c2c16', badge: 'bg-[#5c2c16]/10 text-[#5c2c16] border-[#5c2c16]/20' },
    { name: 'เขียว', dot: 'bg-emerald-500', hex: '#22c55e', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'เหลือง', dot: 'bg-amber-400', hex: '#eab308', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
    { name: 'ส้ม', dot: 'bg-orange-500', hex: '#f97316', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
    { name: 'ชมพู', dot: 'bg-pink-500', hex: '#ec4899', badge: 'bg-pink-50 text-pink-700 border-pink-200' },
  ];

  // --- Page 1 State: Overview & Summary Print Modal ---
  const [isSummaryPrintModalOpen, setIsSummaryPrintModalOpen] = useState(false);
  const [prodLotFilter, setProdLotFilter] = useState<'all' | 'passed' | 'pending' | 'failed'>('all');

  // --- Page 2 State: Independent Popups for Brix and Pesticide ---
  const [isBrixModalOpen, setIsBrixModalOpen] = useState(false);
  const [isPestModalOpen, setIsPestModalOpen] = useState(false);

  // Brix Form State - เลือก 1 สี โดยไม่ต้องมี % บอก
  const [brixLotId, setBrixLotId] = useState('LOT-RM-2026-1103-08');
  const [brixReceiveDate, setBrixReceiveDate] = useState('2026-11-03');
  const [brixValue, setBrixValue] = useState<number | string>(6.2);
  const [selectedSingleColor, setSelectedSingleColor] = useState<string>('แดง');

  // Pesticide Form State: วันที่ตรวจ Lab (ลบวันที่รับเข้าออก) และกดเลือก Passed/Failed เอง
  const [pestLotId, setPestLotId] = useState('LOT-RM-2026-1103-08');
  const [pestTestDate, setPestTestDate] = useState('2026-11-03');
  const [pestOrganophosphate, setPestOrganophosphate] = useState<'Passed' | 'Failed' | null>(null);
  const [pestOrganochlorine, setPestOrganochlorine] = useState<'Passed' | 'Failed' | null>(null);

  // Incoming Raw Material Lots (Page 2 data) พร้อมวันที่ตรวจ Lab
  const [rawMaterialLots, setRawMaterialLots] = useState<RawMaterialLot[]>([
    {
      id: 'LOT-RM-2026-1103-01',
      receiveDate: '2026-11-03',
      testDate: '2026-11-03',
      brix: 6.4,
      color: 'แดง',
      organophosphate: 'Passed',
      organochlorine: 'Passed',
      pesticideStatus: 'Passed'
    },
    {
      id: 'LOT-RM-2026-1103-02',
      receiveDate: '2026-11-03',
      testDate: '2026-11-03',
      brix: 6.2,
      color: 'ช็อคโกแลต',
      organophosphate: 'Passed',
      organochlorine: 'Passed',
      pesticideStatus: 'Passed'
    },
    {
      id: 'LOT-RM-2026-1103-03',
      receiveDate: '2026-11-03',
      testDate: '2026-11-03',
      brix: 6.5,
      color: 'เหลือง',
      organophosphate: 'Passed',
      organochlorine: 'Passed',
      pesticideStatus: 'Passed'
    },
    {
      id: 'LOT-RM-2026-1103-04',
      receiveDate: '2026-11-03',
      testDate: '2026-11-03',
      brix: 6.1,
      color: 'ส้ม',
      organophosphate: 'Passed',
      organochlorine: 'Passed',
      pesticideStatus: 'Passed'
    },
    {
      id: 'LOT-RM-2026-1103-05',
      receiveDate: '2026-11-03',
      testDate: '2026-11-03',
      brix: 6.3,
      color: 'ชมพู',
      organophosphate: 'Passed',
      organochlorine: 'Passed',
      pesticideStatus: 'Passed'
    },
    {
      id: 'LOT-RM-2026-1103-06',
      receiveDate: '2026-11-03',
      testDate: '2026-11-03',
      brix: 6.0,
      color: 'เขียว',
      organophosphate: '',
      organochlorine: '',
      pesticideStatus: 'รอผลการตรวจสอบ'
    },
    {
      id: 'LOT-RM-2026-1103-07',
      receiveDate: '2026-11-03',
      testDate: '2026-11-03',
      brix: 5.4,
      color: 'แดง',
      organophosphate: 'Failed',
      organochlorine: 'Passed',
      pesticideStatus: 'Failed'
    }
  ]);

  // --- Page 3 State: Finish Good Inspection & Modals ---
  const [fgInspectLotId, setFgInspectLotId] = useState('LOT-FG-2026-1103-01');
  const [fgStatusModalOpen, setFgStatusModalOpen] = useState(false);
  const [fgFailModalOpen, setFgFailModalOpen] = useState(false);
  const [isNewFgModalOpen, setIsNewFgModalOpen] = useState(false);
  const [activeFgItemKey, setActiveFgItemKey] = useState<keyof FinishGoodLot['fgChecks'] | null>(null);
  const [failReason, setFailReason] = useState('');
  const [failAction, setFailAction] = useState('');

  // Page 3: Color Mix Modal State (ผสมสีครบ 3-5 สายพันธุ์ รวม 100% บังคับเขียวคู่แดง/ชมพู)
  const [isColorMixModalOpen, setIsColorMixModalOpen] = useState(false);
  const [tempColorMix, setTempColorMix] = useState<{ [colorName: string]: number }>({
    'แดง': 40,
    'เขียว': 30,
    'ช็อคโกแลต': 30
  });

  // Page 3: Net Weight Sampling Modal State (สุ่มตรวจ 10-20 กล่อง)
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [tempBoxWeights, setTempBoxWeights] = useState<number[]>([
    142.5, 141.0, 143.2, 140.5, 142.8, 141.5, 143.0, 140.8, 142.0, 141.8
  ]);

  // Page 3: Finish Good Overview Print Modal State (ภาพรวมสรุปการตรวจทุก Lot)
  const [isFgOverviewPrintModalOpen, setIsFgOverviewPrintModalOpen] = useState(false);

  // ข้อมูลสำหรับลงข้อมูลล็อตสินค้าสำเร็จรูป
  const [newFgLotIdInput, setNewFgLotIdInput] = useState('LOT-FG-2026-1103-03');
  const [newFgMfgDate, setNewFgMfgDate] = useState('2026-11-03');
  const [newFgExpDate, setNewFgExpDate] = useState('2026-11-09');
  const [newFgCustomerInput, setNewFgCustomerInput] = useState('บริษัท ซีพี ออลล์ จำกัด (มหาชน) / 7-Eleven');
  const [newFgDcInput, setNewFgDcInput] = useState('7-Eleven Distribution Center (DC บางบัวทอง)');
  const [newFgPoInput, setNewFgPoInput] = useState('PO-7E-20261103-088');
  const [newFgReleaseDateInput, setNewFgReleaseDateInput] = useState('2026-11-03');
  const [newFgInspectionTimeInput, setNewFgInspectionTimeInput] = useState('09:30 น.');

  // Finish Good Lots Data (Page 3 & Page 4) - 7 เกณฑ์มาตรฐานพร้อมข้อมูลเฉพาะทาง
  const [finishGoodLots, setFinishGoodLots] = useState<FinishGoodLot[]>([
    {
      id: 'LOT-FG-2026-1103-01',
      date: '2026-11-03',
      expireDate: '2026-11-09',
      netWeight: '140 กรัม',
      linkedRmLots: ['LOT-RM-2026-1103-01', 'LOT-RM-2026-1103-02', 'LOT-RM-2026-1103-03'],
      qaLabInspector: 'น.ส. พิมพ์ใจ แล็บวิเคราะห์',
      qaFgInspector: 'นาย สมชาย สินค้าดี',
      qaManager: 'ดร. ประสิทธิ์ มั่นคง',
      store: '7-Eleven Distribution Center (DC บางบัวทอง)',
      shelfLife: '6 วัน',
      temperature: '2–6 °C',
      customerName: 'บริษัท ซีพี ออลล์ จำกัด (มหาชน) / 7-Eleven',
      distributionCenter: '7-Eleven Distribution Center (DC บางบัวทอง)',
      poNumber: 'PO-7E-20261103-088',
      releaseDate: '2026-11-03',
      inspectionTime: '09:30 น.',
      colorBreakdown: { 'แดง': 40, 'เขียว': 30, 'ช็อคโกแลต': 30 },
      boxWeights: [142.5, 141.0, 143.2, 140.5, 142.8, 141.5, 143.0, 140.8, 142.0, 141.8],
      orderQty: 1200,
      actualQty: 1200,
      basketCount: 60,
      measuredTemp: 3.8,
      fgChecks: {
        item1: { name: 'การปิดผนึกฝากล่อง', spec: 'ฝากล่อง PET ปิดสนิทครบทุกมุม ไม่ฉีกขาด', method: 'ตรวจสอบด้วยสายตาและสัมผัส (Visual & Tactile Check)', result: 'Passed', remark: '' },
        item2: { name: 'ลักษณะทางกายภาพของสินค้า', spec: 'ผลสด ผิวเรียบตึงเงางาม ไม่มีสิ่งแปลกปลอม ไม่พบผลช้ำ หรือเชื้อรา', method: 'ตรวจสอบด้วยตา 100% (Visual Inspection)', result: 'Passed', remark: '' },
        item3: { name: 'การผสมสีครบ 3–5 สายพันธุ์รวม 100% (บังคับมีสีเขียวคู่กับสีแดง/ชมพู)', spec: '3–5 สี รวม 100% และต้องมีสีเขียวคู่กับสีแดงหรือชมพู', method: 'ตรวจสอบและสุ่มนับสัดส่วนสี (Color Mix Audit)', result: 'Passed', remark: '', detail: '3 สี: แดง 40%, เขียว 30%, ช็อคโกแลต 30% (รวม 100%)' },
        item4: { name: 'ฉลากระบุวันผลิต–วันหมดอายุ และข้อความบังคับบนฉลาก', spec: 'อายุสินค้า 6 วันนับจากการผลิต และระบุ “ล้างก่อนรับประทาน” ชัดเจน', method: 'ตรวจสอบฉลากและบาร์โค้ด (Label Audit)', result: 'Passed', remark: '' },
        item5: { name: 'น้ำหนักสุทธิ (140 กรัม)', spec: 'สุ่ม 10–20 กล่อง ค่าเฉลี่ย ≥ 140g และไม่มีกล่องใดต่ำกว่า 140g', method: 'ตรวจสอบด้วยเครื่องชั่งดิจิตอล (Digital Scale)', result: 'Passed', remark: '', detail: 'เฉลี่ย 141.9g (สุ่ม 10 กล่อง, ต่ำสุด 140.5g)' },
        item6: { name: 'จำนวนสินค้าตรงตามใบสั่งซื้อ', spec: 'ยอดบรรจุจริงตรงตามยอดสั่งซื้อ PO และระบุจำนวนตะกร้าขนส่ง', method: 'ตรวจนับจำนวนกล่องเทียบใบสั่งซื้อ PO (Count Verification)', result: 'Passed', remark: '', detail: 'สั่ง 1,200 บรรจุจริง 1,200 กล่อง (60 ตะกร้า)' },
        item7: { name: 'อุณหภูมิห้องขณะตรวจตามเกณฑ์ 2–6 °C', spec: '2.0 °C ถึง 6.0 °C ตลอดการตรวจปล่อยสินค้า', method: 'วัดด้วย Infrared / Digital Thermometer', result: 'Passed', remark: '', detail: 'วัดได้ 3.8 °C (ผ่านเกณฑ์ 2–6 °C)' },
      }
    },
    {
      id: 'LOT-FG-2026-1103-02',
      date: '2026-11-03',
      expireDate: '2026-11-09',
      netWeight: '140 กรัม',
      linkedRmLots: ['LOT-RM-2026-1103-03', 'LOT-RM-2026-1103-04', 'LOT-RM-2026-1103-05'],
      qaLabInspector: 'น.ส. พิมพ์ใจ แล็บวิเคราะห์',
      qaFgInspector: 'นาย สมชาย สินค้าดี',
      qaManager: 'ดร. ประสิทธิ์ มั่นคง',
      store: '7-Eleven Distribution Center (DC บางบัวทอง)',
      shelfLife: '6 วัน',
      temperature: '2–6 °C',
      customerName: 'บริษัท ซีพี ออลล์ จำกัด (มหาชน) / 7-Eleven',
      distributionCenter: '7-Eleven Distribution Center (DC บางบัวทอง)',
      poNumber: 'PO-7E-20261103-089',
      releaseDate: '2026-11-03',
      inspectionTime: '10:15 น.',
      colorBreakdown: { 'ชมพู': 35, 'เขียว': 35, 'เหลือง': 30 },
      boxWeights: [141.5, 140.5, 142.0, 141.2, 140.8, 143.0, 141.5, 142.2, 140.9, 141.8],
      orderQty: 1000,
      actualQty: 1000,
      basketCount: 50,
      measuredTemp: 4.2,
      fgChecks: {
        item1: { name: 'การปิดผนึกฝากล่อง', spec: 'ฝากล่อง PET ปิดสนิทครบทุกมุม ไม่ฉีกขาด', method: 'ตรวจสอบด้วยสายตาและสัมผัส (Visual & Tactile Check)', result: 'ผลการตรวจ', remark: '' },
        item2: { name: 'ลักษณะทางกายภาพของสินค้า', spec: 'ผลสด ผิวเรียบตึงเงางาม ไม่มีสิ่งแปลกปลอม ไม่พบผลช้ำ หรือเชื้อรา', method: 'ตรวจสอบด้วยตา 100% (Visual Inspection)', result: 'ผลการตรวจ', remark: '' },
        item3: { name: 'การผสมสีครบ 3–5 สายพันธุ์รวม 100% (บังคับมีสีเขียวคู่กับสีแดง/ชมพู)', spec: '3–5 สี รวม 100% และต้องมีสีเขียวคู่กับสีแดงหรือชมพู', method: 'ตรวจสอบและสุ่มนับสัดส่วนสี (Color Mix Audit)', result: 'ผลการตรวจ', remark: '', detail: '3 สี: ชมพู 35%, เขียว 35%, เหลือง 30% (รวม 100%)' },
        item4: { name: 'ฉลากระบุวันผลิต–วันหมดอายุ และข้อความบังคับบนฉลาก', spec: 'อายุสินค้า 6 วันนับจากการผลิต และระบุ “ล้างก่อนรับประทาน” ชัดเจน', method: 'ตรวจสอบฉลากและบาร์โค้ด (Label Audit)', result: 'ผลการตรวจ', remark: '' },
        item5: { name: 'น้ำหนักสุทธิ (140 กรัม)', spec: 'สุ่ม 10–20 กล่อง ค่าเฉลี่ย ≥ 140g และไม่มีกล่องใดต่ำกว่า 140g', method: 'ตรวจสอบด้วยเครื่องชั่งดิจิตอล (Digital Scale)', result: 'ผลการตรวจ', remark: '', detail: 'เฉลี่ย 141.5g (สุ่ม 10 กล่อง, ต่ำสุด 140.5g)' },
        item6: { name: 'จำนวนสินค้าตรงตามใบสั่งซื้อ', spec: 'ยอดบรรจุจริงตรงตามยอดสั่งซื้อ PO และระบุจำนวนตะกร้าขนส่ง', method: 'ตรวจนับจำนวนกล่องเทียบใบสั่งซื้อ PO (Count Verification)', result: 'ผลการตรวจ', remark: '', detail: 'สั่ง 1,000 บรรจุจริง 1,000 กล่อง (50 ตะกร้า)' },
        item7: { name: 'อุณหภูมิห้องขณะตรวจตามเกณฑ์ 2–6 °C', spec: '2.0 °C ถึง 6.0 °C ตลอดการตรวจปล่อยสินค้า', method: 'วัดด้วย Infrared / Digital Thermometer', result: 'ผลการตรวจ', remark: '', detail: 'วัดได้ 4.2 °C (ผ่านเกณฑ์ 2–6 °C)' },
      }
    }
  ]);

  // Page 4: Official COA Lot Selector & Raw Material Picker State (เริ่มต้น 3 ล็อต ตามข้อกำหนดบังคับ 3-5 ล็อต)
  const [isCoaModalOpen, setIsCoaModalOpen] = useState(false);
  const [isRmSelectorModalOpen, setIsRmSelectorModalOpen] = useState(false);
  const [isCoaPrintModalOpen, setIsCoaPrintModalOpen] = useState(false);
  const [isCoaPdfModalOpen, setIsCoaPdfModalOpen] = useState(false);
  const [selectedRmForCoa, setSelectedRmForCoa] = useState<string[]>([
    'LOT-RM-2026-1103-01',
    'LOT-RM-2026-1103-02',
    'LOT-RM-2026-1103-03'
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Handlers for Page 2: Brix & Pesticide ---
  const handleSaveBrix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSingleColor) {
      showToast('กรุณาเลือกสีมะเขือเทศ 1 สี');
      return;
    }
    const parsedBrix = parseFloat(String(brixValue)) || 0;
    const existingIndex = rawMaterialLots.findIndex(r => r.id === brixLotId);
    if (existingIndex >= 0) {
      const updated = [...rawMaterialLots];
      updated[existingIndex] = {
        ...updated[existingIndex],
        receiveDate: brixReceiveDate,
        brix: parsedBrix,
        color: selectedSingleColor
      };
      setRawMaterialLots(updated);
      showToast(`อัปเดตผลตรวจ Brix (${parsedBrix} °Bx) และสี (${selectedSingleColor}) สำเร็จ`);
    } else {
      const newRm: RawMaterialLot = {
        id: brixLotId,
        receiveDate: brixReceiveDate,
        testDate: '-',
        brix: parsedBrix,
        color: selectedSingleColor,
        organophosphate: '',
        organochlorine: '',
        pesticideStatus: 'รอผลการตรวจสอบ'
      };
      setRawMaterialLots([newRm, ...rawMaterialLots]);
      showToast(`บันทึกผลตรวจความหวาน & สี ล็อต ${brixLotId} สำเร็จ`);
    }
    setIsBrixModalOpen(false);
    setBrixLotId(`LOT-RM-2026-1103-0${rawMaterialLots.length + 2}`);
  };

  const handleOpenPestModal = () => {
    const pendingLots = rawMaterialLots.filter(r => r.pesticideStatus === 'รอผลการตรวจสอบ' || !r.organophosphate);
    if (pendingLots.length > 0) {
      setPestLotId(pendingLots[0].id);
    } else {
      setPestLotId(`LOT-RM-2026-1103-0${rawMaterialLots.length + 1}`);
    }
    setPestOrganophosphate(null);
    setPestOrganochlorine(null);
    setIsPestModalOpen(true);
  };

  const handleSavePest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pestOrganophosphate || !pestOrganochlorine) {
      showToast('กรุณากดเลือกผลตรวจ (Passed หรือ Failed) ให้ครบทั้ง 2 รายการ');
      return;
    }
    const finalStatus: 'Passed' | 'Failed' = 
      (pestOrganophosphate === 'Passed' && pestOrganochlorine === 'Passed') ? 'Passed' : 'Failed';

    const existingIndex = rawMaterialLots.findIndex(r => r.id === pestLotId);
    if (existingIndex >= 0) {
      const updated = [...rawMaterialLots];
      updated[existingIndex] = {
        ...updated[existingIndex],
        testDate: pestTestDate,
        organophosphate: pestOrganophosphate,
        organochlorine: pestOrganochlorine,
        pesticideStatus: finalStatus
      };
      setRawMaterialLots(updated);
    } else {
      setRawMaterialLots([{
        id: pestLotId,
        receiveDate: pestTestDate,
        testDate: pestTestDate,
        brix: 6.2,
        color: 'แดง',
        organophosphate: pestOrganophosphate,
        organochlorine: pestOrganochlorine,
        pesticideStatus: finalStatus
      }, ...rawMaterialLots]);
    }
    setIsPestModalOpen(false);
    setPestOrganophosphate(null);
    setPestOrganochlorine(null);
    showToast(`บันทึกผลตรวจ Pesticide ล็อต ${pestLotId} (วันที่ตรวจ: ${pestTestDate}): ${finalStatus}`);
  };

  // --- Handlers for Page 3: Color Mix, Weight Sampling, Order Quantities, Temperature ---
  const validateColorMix = (breakdown: { [color: string]: number }) => {
    const selectedColors = Object.keys(breakdown).filter(c => (Number(breakdown[c]) || 0) > 0);
    const count = selectedColors.length;
    const isCountValid = count >= 3 && count <= 5;
    const total = Math.round(selectedColors.reduce((sum, c) => sum + (Number(breakdown[c]) || 0), 0));
    const isTotal100 = total === 100;
    const hasGreen = selectedColors.includes('เขียว');
    const hasRedOrPink = selectedColors.includes('แดง') || selectedColors.includes('ชมพู');
    const hasMandatoryColors = hasGreen && hasRedOrPink;
    const isValid = isCountValid && isTotal100 && hasMandatoryColors;

    return {
      selectedColors,
      count,
      isCountValid,
      total,
      isTotal100,
      hasGreen,
      hasRedOrPink,
      hasMandatoryColors,
      isValid
    };
  };

  const handleSaveColorMix = () => {
    const validation = validateColorMix(tempColorMix);
    const detailText = validation.selectedColors.map(c => `${c} ${tempColorMix[c]}%`).join(', ') + ` (รวม ${validation.total}%)`;

    setFinishGoodLots(finishGoodLots.map(f => {
      if (f.id === fgInspectLotId) {
        const updatedChecks = { ...f.fgChecks };
        if (validation.isValid) {
          updatedChecks.item3 = {
            ...updatedChecks.item3,
            result: 'Passed',
            detail: `${validation.count} สี: ${detailText}`,
            remark: ''
          };
        } else {
          let errReason = '';
          if (!validation.isCountValid) errReason += `ต้องมี 3-5 สี (มี ${validation.count} สี); `;
          if (!validation.isTotal100) errReason += `สัดส่วนรวมต้องได้ 100% (รวมได้ ${validation.total}%); `;
          if (!validation.hasMandatoryColors) errReason += 'ต้องมีสีเขียวคู่กับสีแดงหรือชมพู; ';
          updatedChecks.item3 = {
            ...updatedChecks.item3,
            result: 'Failed',
            detail: `${validation.count} สี: ${detailText}`,
            remark: `ไม่ผ่านเกณฑ์: ${errReason}`
          };
        }
        return {
          ...f,
          colorBreakdown: tempColorMix,
          fgChecks: updatedChecks
        };
      }
      return f;
    }));

    setIsColorMixModalOpen(false);
    if (validation.isValid) {
      showToast('บันทึกสัดส่วนสีครบถ้วนตามเกณฑ์ 3-5 สายพันธุ์รวม 100% แล้ว (Passed)');
    } else {
      showToast('บันทึกสัดส่วนสีแล้ว (ยังไม่ผ่านเกณฑ์มาตรฐาน กรุณาตรวจสอบ)');
    }
  };

  const handleSaveBoxWeights = () => {
    if (tempBoxWeights.length < 10) {
      showToast('ต้องสุ่มชั่งน้ำหนักอย่างน้อย 10 กล่อง (10 - 20 กล่อง)');
      return;
    }
    const sum = tempBoxWeights.reduce((acc, w) => acc + (Number(w) || 0), 0);
    const avg = Number((sum / tempBoxWeights.length).toFixed(1));
    const min = Math.min(...tempBoxWeights);
    const underweightIndices = tempBoxWeights
      .map((w, idx) => ({ idx: idx + 1, weight: w }))
      .filter(item => item.weight < 140.0);
    const hasUnderweight = underweightIndices.length > 0;

    setFinishGoodLots(finishGoodLots.map(f => {
      if (f.id === fgInspectLotId) {
        const updatedChecks = { ...f.fgChecks };
        if (hasUnderweight) {
          const underweightStr = underweightIndices.map(u => `กล่อง #${u.idx} (${u.weight}g)`).join(', ');
          updatedChecks.item5 = {
            ...updatedChecks.item5,
            result: 'Failed',
            detail: `เฉลี่ย ${avg}g (สุ่ม ${tempBoxWeights.length} กล่อง, ต่ำสุด ${min}g)`,
            remark: `พบกล่องต่ำกว่า 140g: ${underweightStr} [ต้อง HOLD สินค้าเพื่อแก้ไข/คัดแยก หรือ REJECT]`
          };
        } else {
          updatedChecks.item5 = {
            ...updatedChecks.item5,
            result: 'Passed',
            detail: `เฉลี่ย ${avg}g (สุ่ม ${tempBoxWeights.length} กล่อง, ต่ำสุด ${min}g ผ่านเกณฑ์)`,
            remark: ''
          };
        }
        return {
          ...f,
          boxWeights: tempBoxWeights,
          fgChecks: updatedChecks
        };
      }
      return f;
    }));

    setIsWeightModalOpen(false);
    if (hasUnderweight) {
      showToast('⚠️ ตรวจพบกล่องต่ำกว่า 140g: ระบบทำการ HOLD / FAILED ทันทีตามเกณฑ์');
    } else {
      showToast(`บันทึกผลชั่งน้ำหนักเรียบร้อย (เฉลี่ย ${avg}g ผ่านเกณฑ์)`);
    }
  };

  const handleUpdateOrderQuantities = (order: number, actual: number, baskets: number) => {
    setFinishGoodLots(finishGoodLots.map(f => {
      if (f.id === fgInspectLotId) {
        const isMatched = actual >= order && order > 0;
        const updatedChecks = { ...f.fgChecks };
        updatedChecks.item6 = {
          ...updatedChecks.item6,
          result: isMatched ? 'Passed' : 'Failed',
          detail: `สั่ง ${order.toLocaleString()} บรรจุจริง ${actual.toLocaleString()} กล่อง (${baskets} ตะกร้า)`,
          remark: isMatched ? '' : `ยอดบรรจุจริง (${actual}) ไม่ตรงตามยอดสั่งซื้อ (${order})`
        };
        return {
          ...f,
          orderQty: order,
          actualQty: actual,
          basketCount: baskets,
          fgChecks: updatedChecks
        };
      }
      return f;
    }));
  };

  const handleUpdateMeasuredTemp = (tempVal: number) => {
    setFinishGoodLots(finishGoodLots.map(f => {
      if (f.id === fgInspectLotId) {
        const isInRange = tempVal >= 2.0 && tempVal <= 6.0;
        const updatedChecks = { ...f.fgChecks };
        updatedChecks.item7 = {
          ...updatedChecks.item7,
          result: isInRange ? 'Passed' : 'Failed',
          detail: `วัดได้ ${tempVal} °C (${isInRange ? 'ผ่านเกณฑ์ 2–6 °C' : 'นอกเกณฑ์ควบคุม'})`,
          remark: isInRange ? '' : `อุณหภูมิห้อง ${tempVal} °C อยู่นอกเกณฑ์มาตรฐาน (2.0 - 6.0 °C)`
        };
        return {
          ...f,
          measuredTemp: tempVal,
          fgChecks: updatedChecks
        };
      }
      return f;
    }));
  };

  // Helper for digital JSON download of COA
  const handleDownloadCoaJson = (fgLot?: FinishGoodLot) => {
    if (!fgLot) return;
    const exportData = {
      documentType: 'CERTIFICATE OF ANALYSIS (COA)',
      retailSpecification: '7-Eleven Retail Spec (CP ALL)',
      certificateNo: `COA-${fgLot.id}`,
      issueDate: new Date().toISOString(),
      productName: 'มะเขือเทศคละสี (Mixed Color Tomato 140g)',
      lotId: fgLot.id,
      mfgDate: fgLot.date,
      expDate: fgLot.expireDate,
      customer: fgLot.customerName,
      distributionCenter: fgLot.distributionCenter,
      poNumber: fgLot.poNumber,
      standards: 'GHPs, HACCP, GAP',
      rawMaterialLots: rawMaterialLots.filter(r => selectedRmForCoa.includes(r.id)),
      finishGoodChecks: fgLot.fgChecks,
      colorBreakdown: fgLot.colorBreakdown,
      boxWeightsSample: fgLot.boxWeights,
      orderQuantities: {
        poOrderQty: fgLot.orderQty,
        actualPackedQty: fgLot.actualQty,
        basketCount: fgLot.basketCount
      },
      measuredTemperature: `${fgLot.measuredTemp} °C`,
      overallStatus: getFgOverallStatus(fgLot),
      qrTraceabilityCode: `TR-711-${fgLot.id}`,
      signatures: {
        qcLab: fgLot.qaLabInspector,
        qcFinishGood: fgLot.qaFgInspector,
        qaManager: fgLot.qaManager
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `COA-${fgLot.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`ดาวน์โหลดไฟล์ข้อมูล COA-${fgLot.id}.json สำเร็จ`);
  };

  // --- Handlers for Page 3: Finish Good Inspection & Creation ---
  const handleCreateFgLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (finishGoodLots.some(f => f.id === newFgLotIdInput)) {
      showToast('หมายเลขล็อตนี้มีอยู่แล้วในระบบ');
      return;
    }
    const newFg: FinishGoodLot = {
      id: newFgLotIdInput,
      date: newFgMfgDate,
      expireDate: newFgExpDate,
      netWeight: '140 กรัม',
      linkedRmLots: rawMaterialLots.slice(0, 3).map(r => r.id),
      qaLabInspector: 'น.ส. พิมพ์ใจ แล็บวิเคราะห์',
      qaFgInspector: 'นาย สมชาย สินค้าดี',
      qaManager: 'ดร. ประสิทธิ์ มั่นคง',
      store: newFgDcInput,
      shelfLife: '6 วัน',
      temperature: '2–6 °C',
      customerName: newFgCustomerInput,
      distributionCenter: newFgDcInput,
      poNumber: newFgPoInput,
      releaseDate: newFgReleaseDateInput,
      inspectionTime: newFgInspectionTimeInput,
      colorBreakdown: { 'แดง': 40, 'เขียว': 30, 'เหลือง': 30 },
      boxWeights: [142.0, 141.5, 142.8, 140.5, 143.0, 141.2, 142.4, 140.8, 141.9, 141.5],
      orderQty: 1000,
      actualQty: 1000,
      basketCount: 50,
      measuredTemp: 3.5,
      fgChecks: {
        item1: { name: 'การปิดผนึกฝากล่อง', spec: 'ฝากล่อง PET ปิดสนิทครบทุกมุม ไม่ฉีกขาด', method: 'ตรวจสอบด้วยสายตาและสัมผัส (Visual & Tactile Check)', result: 'ผลการตรวจ', remark: '' },
        item2: { name: 'ลักษณะทางกายภาพของสินค้า', spec: 'ผลสด ผิวเรียบตึงเงางาม ไม่มีสิ่งแปลกปลอม ไม่พบผลช้ำ หรือเชื้อรา', method: 'ตรวจสอบด้วยตา 100% (Visual Inspection)', result: 'ผลการตรวจ', remark: '' },
        item3: { name: 'การผสมสีครบ 3–5 สายพันธุ์รวม 100% (บังคับมีสีเขียวคู่กับสีแดง/ชมพู)', spec: '3–5 สี รวม 100% และต้องมีสีเขียวคู่กับสีแดงหรือชมพู', method: 'ตรวจสอบและสุ่มนับสัดส่วนสี (Color Mix Audit)', result: 'ผลการตรวจ', remark: '', detail: '3 สี: แดง 40%, เขียว 30%, เหลือง 30% (รวม 100%)' },
        item4: { name: 'ฉลากระบุวันผลิต–วันหมดอายุ และข้อความบังคับบนฉลาก', spec: 'อายุสินค้า 6 วันนับจากการผลิต และระบุ “ล้างก่อนรับประทาน” ชัดเจน', method: 'ตรวจสอบฉลากและบาร์โค้ด (Label Audit)', result: 'ผลการตรวจ', remark: '' },
        item5: { name: 'น้ำหนักสุทธิ (140 กรัม)', spec: 'สุ่ม 10–20 กล่อง ค่าเฉลี่ย ≥ 140g และไม่มีกล่องใดต่ำกว่า 140g', method: 'ตรวจสอบด้วยเครื่องชั่งดิจิตอล (Digital Scale)', result: 'ผลการตรวจ', remark: '', detail: 'เฉลี่ย 141.8g (สุ่ม 10 กล่อง, ต่ำสุด 140.5g)' },
        item6: { name: 'จำนวนสินค้าตรงตามใบสั่งซื้อ', spec: 'ยอดบรรจุจริงตรงตามยอดสั่งซื้อ PO และระบุจำนวนตะกร้าขนส่ง', method: 'ตรวจนับจำนวนกล่องเทียบใบสั่งซื้อ PO (Count Verification)', result: 'ผลการตรวจ', remark: '', detail: 'สั่ง 1,000 บรรจุจริง 1,000 กล่อง (50 ตะกร้า)' },
        item7: { name: 'อุณหภูมิห้องขณะตรวจตามเกณฑ์ 2–6 °C', spec: '2.0 °C ถึง 6.0 °C ตลอดการตรวจปล่อยสินค้า', method: 'วัดด้วย Infrared / Digital Thermometer', result: 'ผลการตรวจ', remark: '', detail: 'วัดได้ 3.5 °C (ผ่านเกณฑ์ 2–6 °C)' },
      }
    };
    setFinishGoodLots([newFg, ...finishGoodLots]);
    setFgInspectLotId(newFg.id);
    setIsNewFgModalOpen(false);
    showToast(`สร้างล็อตสินค้า Finish Good ${newFg.id} สำเร็จ`);
    setNewFgLotIdInput(`LOT-FG-2026-1103-0${finishGoodLots.length + 3}`);
  };

  const handleUpdateActiveFgField = (field: keyof FinishGoodLot, val: any) => {
    setFinishGoodLots(finishGoodLots.map(f => {
      if (f.id === fgInspectLotId) {
        if (field === 'date') {
          try {
            const d = new Date(val);
            d.setDate(d.getDate() + 6);
            const exp = d.toISOString().split('T')[0];
            return { ...f, date: val, expireDate: exp };
          } catch {
            return { ...f, [field]: val };
          }
        }
        return { ...f, [field]: val };
      }
      return f;
    }));
  };

  const handleSetFgItemResult = (itemKey: keyof FinishGoodLot['fgChecks'], result: 'Passed' | 'Failed') => {
    if (result === 'Passed') {
      setFinishGoodLots(finishGoodLots.map(f => {
        if (f.id === fgInspectLotId) {
          const updatedChecks = { ...f.fgChecks };
          updatedChecks[itemKey] = { ...updatedChecks[itemKey], result: 'Passed', remark: '' };
          return { ...f, fgChecks: updatedChecks };
        }
        return f;
      }));
      showToast('บันทึกผลตรวจสอบ: Passed');
    } else {
      setActiveFgItemKey(itemKey);
      setFailReason('');
      setFailAction('');
      setFgFailModalOpen(true);
    }
  };

  const handleUpdateFgResult = (status: 'Passed' | 'Failed') => {
    if (!activeFgItemKey) return;
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

  const handleSaveFailRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFgItemKey) return;
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

  // Overall Status Calculation: Returns 'Passed' | 'Pending' | 'Failed'
  const getFgOverallStatus = (fgLot?: FinishGoodLot): 'Passed' | 'Pending' | 'Failed' => {
    if (!fgLot || !fgLot.fgChecks) return 'Failed';
    const checks = Object.values(fgLot.fgChecks);
    const hasFailed = checks.some(c => c.result === 'Failed');
    const hasUnchecked = checks.some(c => c.result === 'ผลการตรวจ');
    if (hasFailed) return 'Failed';
    if (hasUnchecked) return 'Pending';
    return 'Passed';
  };

  const currentFgLot = finishGoodLots.find(f => f.id === selectedLotId) || finishGoodLots[0];
  const activeInspectionFg = finishGoodLots.find(f => f.id === fgInspectLotId) || finishGoodLots[0];

  // Dashboard calculations
  const totalFgLots = finishGoodLots.length;
  const passedFgCount = finishGoodLots.filter(f => getFgOverallStatus(f) === 'Passed').length;
  const pendingFgCount = finishGoodLots.filter(f => getFgOverallStatus(f) === 'Pending').length;
  const failedFgCount = finishGoodLots.filter(f => getFgOverallStatus(f) === 'Failed').length;

  const passedPestRmCount = rawMaterialLots.filter(r => r.pesticideStatus === 'Passed').length;
  const pendingPestRmCount = rawMaterialLots.filter(r => r.pesticideStatus === 'รอผลการตรวจสอบ' || !r.pesticideStatus).length;
  const failedPestRmCount = rawMaterialLots.filter(r => r.pesticideStatus === 'Failed').length;

  const avgBrixVal = (rawMaterialLots.reduce((acc, curr) => acc + curr.brix, 0) / (rawMaterialLots.length || 1)).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 transition-all animate-bounce border border-emerald-500/50">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="font-medium text-sm tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* --- POPUP 1: Brix & Color Modal (Page 2) --- */}
      {isBrixModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
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
              <button 
                type="button"
                onClick={() => setIsBrixModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBrix} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">หมายเลขล็อตรับเข้า (Lot ID)</label>
                  <input
                    type="text"
                    value={brixLotId}
                    onChange={(e) => setBrixLotId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">วันที่รับเข้า</label>
                  <input
                    type="date"
                    value={brixReceiveDate}
                    onChange={(e) => setBrixReceiveDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  ระดับความหวาน (Brix) <span className="text-teal-700 font-semibold">[เกณฑ์มาตรฐาน 7-11 ≥ 6.0 °Bx]</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={brixValue}
                    onChange={(e) => setBrixValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">°Bx</span>
                </div>
              </div>

              {/* Tomato Single Color Selector: เลือก 1 สี โดยไม่ต้องมี % บอก */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                      สีกายภาพมะเขือเทศ (Tomato Color)
                    </label>
                    <p className="text-[11px] text-slate-500">เลือก 1 สีหลักของล็อตรับเข้านี้</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-300 text-slate-800 shadow-2xs">
                    สีที่เลือก: <strong className="text-teal-700">{selectedSingleColor}</strong>
                  </span>
                </div>

                {/* 6 Color Options - Single Pick */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TOMATO_COLOR_PALETTE.map((c) => {
                    const isSelected = selectedSingleColor === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedSingleColor(c.name)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-teal-50/70 border-teal-600 ring-2 ring-teal-500/30 shadow-xs' 
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className={`w-4 h-4 rounded-full ${c.dot} shadow-xs shrink-0`}></span>
                          <span className={`text-xs font-bold ${isSelected ? 'text-teal-950 font-black' : 'text-slate-700'}`}>
                            {c.name}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="text-teal-700 text-xs font-black">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsBrixModalOpen(false)} 
                  className="px-4 py-2 text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all cursor-pointer"
                >
                  บันทึกผล Brix & สี
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP 2: Pesticide Modal (Page 2) - กดเลือกผลได้เอง ไม่ต้องเลือกผ่านไว้รอ --- */}
      {isPestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-100 p-2.5 rounded-2xl text-emerald-700">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">บันทึกผลตรวจสารเคมี (Pesticide)</h3>
                  <p className="text-xs text-slate-500">เลือกผลตรวจได้อิสระ: ผ่าน, รอผล หรือไม่ผ่าน</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsPestModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  หมายเลขล็อตสินค้ารับเข้า (เลือกล็อตที่ยังไม่ลงผล)
                </label>
                {(() => {
                  const pendingLots = rawMaterialLots.filter(r => r.pesticideStatus === 'รอผลการตรวจสอบ' || !r.organophosphate);
                  if (pendingLots.length > 0) {
                    return (
                      <select
                        value={pestLotId}
                        onChange={(e) => setPestLotId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        required
                      >
                        <option value="">-- เลือกล็อตที่ยังไม่ได้ลงผลตรวจ ({pendingLots.length} ล็อต) --</option>
                        {pendingLots.map(rm => (
                          <option key={rm.id} value={rm.id}>
                            {rm.id} (รับเข้า: {rm.receiveDate} • Brix: {rm.brix}°Bx • สี{rm.color})
                          </option>
                        ))}
                      </select>
                    );
                  }
                  return (
                    <div className="space-y-1.5">
                      <p className="text-xs text-slate-600 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                        ✓ ล็อตในระบบได้รับการลงผลตรวจครบแล้ว หากต้องการระบุล็อตใหม่ สามารถกรอกได้ด้านล่าง:
                      </p>
                      <input
                        type="text"
                        value={pestLotId}
                        onChange={(e) => setPestLotId(e.target.value)}
                        placeholder="LOT-RM-2026-..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">วันที่ตรวจ Lab</label>
                <input
                  type="date"
                  value={pestTestDate}
                  onChange={(e) => setPestTestDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* 1. Organophosphate & Carbamate */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    1. Organophosphate & Carbamate
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pestOrganophosphate === 'Passed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    pestOrganophosphate === 'Failed' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {pestOrganophosphate === 'Passed' ? 'Passed (ผ่าน)' : pestOrganophosphate === 'Failed' ? 'Failed (ไม่ผ่าน)' : 'ยังไม่ได้เลือก'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPestOrganophosphate('Passed')}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      pestOrganophosphate === 'Passed' 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    Passed
                  </button>
                  <button
                    type="button"
                    onClick={() => setPestOrganophosphate('Failed')}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      pestOrganophosphate === 'Failed' 
                        ? 'bg-red-600 text-white border-red-600 shadow-xs ring-2 ring-red-300' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    Failed
                  </button>
                </div>
              </div>

              {/* 2. Organochlorine & Pyrethroid */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Organochlorine & Pyrethroid
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pestOrganochlorine === 'Passed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    pestOrganochlorine === 'Failed' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {pestOrganochlorine === 'Passed' ? 'Passed (ผ่าน)' : pestOrganochlorine === 'Failed' ? 'Failed (ไม่ผ่าน)' : 'ยังไม่ได้เลือก'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPestOrganochlorine('Passed')}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      pestOrganochlorine === 'Passed' 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    Passed
                  </button>
                  <button
                    type="button"
                    onClick={() => setPestOrganochlorine('Failed')}
                    className={`py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      pestOrganochlorine === 'Failed' 
                        ? 'bg-red-600 text-white border-red-600 shadow-xs ring-2 ring-red-300' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    Failed
                  </button>
                </div>
              </div>

              {/* Status preview banner */}
              <div className="p-3 rounded-2xl border bg-slate-50 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">ผลสรุปการประเมิน:</span>
                <span className={`px-2.5 py-1 rounded-full font-bold ${
                  (pestOrganophosphate === 'Failed' || pestOrganochlorine === 'Failed') ? 'bg-red-100 text-red-800 border border-red-200' :
                  (pestOrganophosphate === 'Passed' && pestOrganochlorine === 'Passed') ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {(pestOrganophosphate === 'Failed' || pestOrganochlorine === 'Failed') ? 'Failed (ไม่ผ่านเกณฑ์)' :
                   (pestOrganophosphate === 'Passed' && pestOrganochlorine === 'Passed') ? 'Passed (ผ่านเกณฑ์ 0 ตกค้าง)' :
                   'กรุณากดเลือกผลตรวจทั้ง 2 รายการ'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsPestModalOpen(false)} 
                  className="px-4 py-2 text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all cursor-pointer"
                >
                  บันทึกผล Pesticide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP 2.3: สุ่มตรวจสัดส่วนสี (ฟิกสีแดงและเขียวตลอด รวม 3-5 สี รวม 100%) --- */}
      {isColorMixModalOpen && (() => {
        const validation = validateColorMix(tempColorMix);

        const handleToggleColor = (colorName: string) => {
          if (colorName === 'แดง' || colorName === 'เขียว') {
            showToast('สีแดงและสีเขียวเป็นสีเกณฑ์บังคับ 7-Eleven ไม่สามารถนำออกได้');
            return;
          }
          const updated = { ...tempColorMix };
          if (updated[colorName] && updated[colorName] > 0) {
            const activeCount = Object.keys(updated).filter(k => (updated[k] || 0) > 0).length;
            if (activeCount <= 3) {
              showToast('ต้องมีอย่างน้อย 3 สี (รวมเขียวและแดง) ไม่สามารถลดจำนวนสีได้อีก');
              return;
            }
            delete updated[colorName];
          } else {
            const activeCount = Object.keys(updated).filter(k => (updated[k] || 0) > 0).length;
            if (activeCount >= 5) {
              showToast('กำหนดให้เลือกผสมสีได้สูงสุด 5 สีเท่านั้น (รวมเขียวและแดง)');
              return;
            }
            updated[colorName] = 10;
          }
          
          // Ensure green and red are always preserved
          if (!updated['แดง'] || updated['แดง'] <= 0) updated['แดง'] = 20;
          if (!updated['เขียว'] || updated['เขียว'] <= 0) updated['เขียว'] = 20;

          // Auto redistribute evenly across selected colors
          const keys = Object.keys(updated).filter(k => (updated[k] || 0) > 0);
          if (keys.length > 0) {
            const base = Math.floor(100 / keys.length);
            const remainder = 100 - base * keys.length;
            keys.forEach((k, idx) => {
              updated[k] = idx === 0 ? base + remainder : base;
            });
          }
          setTempColorMix(updated);
        };

        const handleAdjustPercent = (colorName: string, delta: number) => {
          const currentVal = Number(tempColorMix[colorName]) || 0;
          const nextVal = Math.max(0, Math.min(100, currentVal + delta));
          setTempColorMix({ ...tempColorMix, [colorName]: nextVal });
        };

        const handleSetDirectPercent = (colorName: string, val: string) => {
          const num = Math.max(0, Math.min(100, parseInt(val) || 0));
          setTempColorMix({ ...tempColorMix, [colorName]: num });
        };

        const handleAutoBalance = () => {
          const updated = { ...tempColorMix };
          if (!updated['แดง'] || updated['แดง'] <= 0) updated['แดง'] = 25;
          if (!updated['เขียว'] || updated['เขียว'] <= 0) updated['เขียว'] = 25;

          const keys = Object.keys(updated).filter(k => (updated[k] || 0) > 0);
          if (keys.length === 0) return;
          const base = Math.floor(100 / keys.length);
          const remainder = 100 - base * keys.length;
          keys.forEach((k, idx) => {
            updated[k] = idx === 0 ? base + remainder : base;
          });
          setTempColorMix(updated);
          showToast('เฉลี่ยสัดส่วนเปอร์เซ็นต์รวม 100% อัตโนมัติแล้ว');
        };

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            {/* Embossed & Dimensional Container with light gray background (นูนขึ้น มีมิติ ไม่ใส่สีเขียว) */}
            <div className="bg-slate-50 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border-2 border-slate-300 ring-1 ring-slate-400/20 space-y-5 max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-100 p-2.5 rounded-2xl text-slate-800 border border-slate-300 shadow-sm">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">สุ่มตรวจสัดส่วนสี</h3>
                    <p className="text-xs text-slate-500">เกณฑ์ 7-Eleven: ครบ 3–5 สายพันธุ์ รวม 100% (ฟิกสีแดงและเขียวตลอด)</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsColorMixModalOpen(false)} 
                  className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Status Validation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                  validation.isCountValid ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  <span className="font-bold text-[10px] uppercase text-slate-500">1. จำนวนสี (3-5 สี)</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base font-black text-slate-900">{validation.count} สี</span>
                    <span className="font-bold text-[11px]">{validation.isCountValid ? '✓ ครบเกณฑ์' : '✕ ต้องมี 3-5 สี'}</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                  validation.isTotal100 ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  <span className="font-bold text-[10px] uppercase text-slate-500">2. สัดส่วนรวม (100%)</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base font-black text-slate-900">{validation.total}%</span>
                    <span className="font-bold text-[11px]">{validation.isTotal100 ? '✓ ครบ 100%' : `ขาด/เกิน ${validation.total - 100}%`}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-slate-50 border-slate-300 text-slate-800 flex flex-col justify-between">
                  <span className="font-bold text-[10px] uppercase text-slate-500">3. สีบังคับ (แดง + เขียว)</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-slate-900">แดง ✓ | เขียว ✓</span>
                    <span className="font-bold text-[11px] text-slate-600">ฟิกตลอด</span>
                  </div>
                </div>
              </div>

              {/* Color Selector Buttons */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    เลือกสีกายภาพ (แดง & เขียว ฟิกตลอด • เลือกสีอื่นเพิ่มได้รวม 3–5 สี):
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoBalance}
                    className="text-[11px] font-bold text-slate-700 hover:text-slate-900 flex items-center space-x-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 transition-all shadow-xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>เฉลี่ย % ให้เท่ากัน</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {TOMATO_COLOR_PALETTE.map(c => {
                    const isFixed = c.name === 'แดง' || c.name === 'เขียว';
                    const isSelected = isFixed || (tempColorMix[c.name] || 0) > 0;
                    return (
                      <button
                        key={`palette-${c.name}`}
                        type="button"
                        onClick={() => handleToggleColor(c.name)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center space-y-1 ${
                          isFixed
                            ? 'bg-slate-100 border-slate-400 shadow-xs ring-1 ring-slate-400'
                            : isSelected 
                            ? 'bg-slate-50 border-slate-400 shadow-sm ring-1 ring-slate-300' 
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${c.dot} shadow-xs`}></span>
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-slate-900 font-black' : 'text-slate-600'}`}>
                          {c.name}
                        </span>
                        {isFixed ? (
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">🔒 บังคับ</span>
                        ) : isSelected ? (
                          <span className="text-[10px] font-black text-slate-800">✓ เลือก</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">+ เพิ่ม</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Percentage breakdown adjuster table */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  ปรับสัดส่วนเปอร์เซ็นต์ (%) แต่ละสี (ผลรวมต้องได้ 100%):
                </label>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 max-h-52 overflow-y-auto">
                  {Object.keys(tempColorMix).filter(c => (tempColorMix[c] || 0) > 0).map(colorName => {
                    const colorItem = TOMATO_COLOR_PALETTE.find(item => item.name === colorName);
                    const val = tempColorMix[colorName] || 0;
                    const isFixed = colorName === 'แดง' || colorName === 'เขียว';
                    return (
                      <div key={colorName} className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                        <div className="flex items-center space-x-2 w-36 shrink-0">
                          <span className={`w-3.5 h-3.5 rounded-full ${colorItem?.dot || 'bg-slate-400'}`}></span>
                          <span className="text-xs font-bold text-slate-800">{colorName}</span>
                          {isFixed && <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">บังคับ</span>}
                        </div>

                        {/* +/- Buttons & Input */}
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustPercent(colorName, -5)}
                            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer border border-slate-300 shadow-xs"
                            title="-5%"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustPercent(colorName, -1)}
                            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer border border-slate-300 shadow-xs"
                            title="-1%"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <div className="relative w-16">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={val}
                              onChange={(e) => handleSetDirectPercent(colorName, e.target.value)}
                              className="w-full text-center font-black text-sm bg-slate-50 border border-slate-300 rounded-lg py-1 px-1 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            />
                            <span className="absolute right-1.5 top-1 text-[11px] font-bold text-slate-400 pointer-events-none">%</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAdjustPercent(colorName, 1)}
                            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer border border-slate-300 shadow-xs"
                            title="+1%"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustPercent(colorName, 5)}
                            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer border border-slate-300 shadow-xs"
                            title="+5%"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">
                  {validation.isValid ? '✓ สัดส่วนสีถูกต้องครบถ้วนตามมาตรฐาน' : '⚠️ ตรวจสอบจำนวนสี และผลรวม 100%'}
                </span>
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setIsColorMixModalOpen(false)} 
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSaveColorMix}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    บันทึกสัดส่วนสี
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- POPUP 2.4: บันทึกผลสุ่มชั่งน้ำหนักสุทธิ 10–20 กล่อง (Net Weight Sampling) --- */}
      {isWeightModalOpen && (() => {
        const sum = tempBoxWeights.reduce((acc, w) => acc + (Number(w) || 0), 0);
        const avg = Number((sum / (tempBoxWeights.length || 1)).toFixed(1));
        const min = tempBoxWeights.length > 0 ? Math.min(...tempBoxWeights) : 0;
        const underweightBoxes = tempBoxWeights
          .map((w, idx) => ({ box: idx + 1, weight: w }))
          .filter(item => item.weight < 140.0);
        const hasUnderweight = underweightBoxes.length > 0;
        const isPassed = !hasUnderweight && avg >= 140.0;

        const handleSetBoxWeight = (index: number, val: string) => {
          const num = parseFloat(val) || 0;
          const updated = [...tempBoxWeights];
          updated[index] = num;
          setTempBoxWeights(updated);
        };

        const handleAddBox = () => {
          if (tempBoxWeights.length < 20) {
            setTempBoxWeights([...tempBoxWeights, 142.0]);
          }
        };

        const handleRemoveBox = () => {
          if (tempBoxWeights.length > 10) {
            setTempBoxWeights(tempBoxWeights.slice(0, tempBoxWeights.length - 1));
          }
        };

        const handleFillStandardWeights = () => {
          const standardList = [142.5, 141.0, 143.2, 140.5, 142.8, 141.5, 143.0, 140.8, 142.0, 141.8, 142.2, 143.5, 141.9, 142.4, 141.6, 142.7, 141.1, 142.9, 143.1, 142.0];
          setTempBoxWeights(standardList.slice(0, tempBoxWeights.length));
          showToast('กรอกตัวอย่างมาตรฐานผ่านเกณฑ์ (140.5 - 143.5g) เรียบร้อย');
        };

        const handleSimulateUnderweight = () => {
          const simulated = [...tempBoxWeights];
          simulated[3] = 138.5; // Simulate box 4 underweight
          setTempBoxWeights(simulated);
          showToast('จำลองกล่องที่ 4 น้ำหนัก 138.5g (< 140g) เพื่อทดสอบเกณฑ์ Hold/Reject');
        };

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            {/* Embossed & Dimensional Container with light gray background (นูนขึ้น มีมิติ ไม่ใส่สีเขียว) */}
            <div className="bg-slate-50 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border-2 border-slate-300 ring-1 ring-slate-400/20 space-y-5 max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-slate-100 p-2.5 rounded-2xl text-slate-800 border border-slate-300 shadow-sm">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">สุ่มตรวจน้ำหนักสุทธิ 10–20 กล่อง (Net Weight)</h3>
                    <p className="text-xs text-slate-500">เกณฑ์ 7-Eleven: ไม่น้อยกว่า 140 กรัม/แพ็ค • หากกล่องใด &lt; 140g ต้อง HOLD เพื่อแก้ไขหรือ REJECT</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsWeightModalOpen(false)} 
                  className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Metric Summary Bar - Neutral & Clean */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500">จำนวนกล่องที่สุ่ม</span>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{tempBoxWeights.length} กล่อง</p>
                  <span className="text-[10px] text-slate-400">เกณฑ์สุ่ม 10–20 กล่อง</span>
                </div>
                <div className={`p-3 rounded-2xl border ${avg >= 140 ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'}`}>
                  <span className="text-[10px] font-bold uppercase text-slate-500">น้ำหนักเฉลี่ย</span>
                  <p className={`text-xl font-black mt-0.5 ${avg >= 140 ? 'text-slate-900' : 'text-red-700'}`}>{avg} g</p>
                  <span className="text-[10px] font-medium text-slate-500">เกณฑ์เฉลี่ย ≥ 140.0 g</span>
                </div>
                <div className={`p-3 rounded-2xl border ${min >= 140 ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'}`}>
                  <span className="text-[10px] font-bold uppercase text-slate-500">ค่าน้ำหนักต่ำสุด</span>
                  <p className={`text-xl font-black mt-0.5 ${min >= 140 ? 'text-slate-900' : 'text-red-700'}`}>{min} g</p>
                  <span className={`text-[10px] font-semibold ${min >= 140 ? 'text-slate-600' : 'text-red-700 font-black'}`}>
                    {min >= 140 ? '✓ ไม่มีตกเกณฑ์' : '✕ พบกล่อง < 140g'}
                  </span>
                </div>
              </div>

              {/* Warning Callout if Underweight Detected */}
              {hasUnderweight && (
                <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-start space-x-3 text-red-900 animate-fadeIn">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-sm text-red-900">
                      ตรวจพบกล่องน้ำหนักต่ำกว่าเกณฑ์ 140 กรัม!
                    </p>
                    <p className="text-xs text-red-800 mt-1">
                      พบกล่องที่ไม่ได้มาตรฐาน: {underweightBoxes.map(b => `กล่อง #${b.box} (${b.weight}g)`).join(', ')}
                    </p>
                    <p className="text-[11px] font-bold text-red-700 mt-1">
                      ข้อกำหนด 7-Eleven: สินค้าล็อตนี้ต้องถูกสั่ง HOLD เพื่อแก้ไข/คัดแยกใหม่ทันที หรือ REJECT ไม่อนุมัติปล่อยสินค้า
                    </p>
                  </div>
                </div>
              )}

              {/* Controls bar */}
              <div className="flex flex-wrap justify-between items-center gap-2 pt-1">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAddBox}
                    disabled={tempBoxWeights.length >= 20}
                    className="bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs cursor-pointer"
                  >
                    + เพิ่มกล่อง (สูงสุด 20)
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveBox}
                    disabled={tempBoxWeights.length <= 10}
                    className="bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs cursor-pointer"
                  >
                    - ลดกล่อง (ขั้นต่ำ 10)
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleFillStandardWeights}
                    className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 transition-all cursor-pointer shadow-xs"
                  >
                    เติมค่ามาตรฐาน (141-143g)
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateUnderweight}
                    className="text-[11px] font-bold text-red-700 hover:text-red-800 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 cursor-pointer shadow-xs"
                  >
                    ทดสอบกรณีตกเกณฑ์ (&lt;140g)
                  </button>
                </div>
              </div>

              {/* Grid of box weight inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 max-h-56 overflow-y-auto">
                {tempBoxWeights.map((w, idx) => {
                  const isUnder = w < 140.0;
                  return (
                    <div 
                      key={`box-${idx}`} 
                      className={`p-2 rounded-xl border ${
                        isUnder 
                          ? 'bg-red-50 border-red-300 ring-1 ring-red-400' 
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                        <span>กล่องที่ {idx + 1}</span>
                        {isUnder && <span className="text-red-600 font-black">HOLD</span>}
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="100"
                          max="200"
                          value={w}
                          onChange={(e) => handleSetBoxWeight(idx, e.target.value)}
                          className={`w-full text-center font-black text-sm rounded-lg py-1 px-1 border focus:outline-none ${
                            isUnder 
                              ? 'bg-red-100/60 border-red-400 text-red-900' 
                              : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-slate-400'
                          }`}
                        />
                        <span className="absolute right-1.5 top-1 text-[11px] font-bold text-slate-400 pointer-events-none">g</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className={`text-xs font-bold ${isPassed ? 'text-slate-700' : 'text-red-700'}`}>
                  {isPassed ? '✓ ผลเฉลี่ยอยู่ในเกณฑ์มาตรฐานน้ำหนักสุทธิ 140g' : '⚠️ ตกเกณฑ์มาตรฐาน: ต้องแก้ไขหรือ Hold/Reject'}
                </span>
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setIsWeightModalOpen(false)} 
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSaveBoxWeights}
                    className={`font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer ${
                      isPassed ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    บันทึกผลการชั่งน้ำหนัก
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- POPUP 2.6: พิมพ์ภาพรวมสรุปผลการตรวจสอบ Finish Good ทุก Lot ขนาด A4 --- */}
      {isFgOverviewPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn overflow-y-auto print:fixed print:inset-0 print:z-[9999] print:p-0 print:bg-white print:overflow-visible">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-300 p-6 sm:p-10 space-y-6 my-auto print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
            {/* Header Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center space-x-2.5">
                <div className="bg-emerald-800 text-white p-2 rounded-xl">
                  <Printer className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">พิมพ์ภาพรวมสรุปการตรวจ Finish Good ทุก Lot (A4)</h3>
                  <p className="text-xs text-slate-500">รายงานสรุปข้อมูล Lot, วันที่ตรวจ, วันผลิต, วันหมดอายุ, สัดส่วนสี, เลข PO และผลตรวจ</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์รายงาน (Print / PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFgOverviewPrintModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-all"
                >
                  ✕ ปิด
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="space-y-5 text-slate-900">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-800" />
                    <h2 className="text-lg font-black text-slate-900">บริษัท เฟรชโปร อินเตอร์ฟู้ดส์ จำกัด</h2>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">รายงานสรุปผลการตรวจสอบผลิตภัณฑ์สำเร็จรูป (Finish Good Inspection Summary)</p>
                  <p className="text-[11px] text-slate-500">มาตรฐาน 7-Eleven Retail Spec • CP ALL Distribution Requirements</p>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-900 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider inline-block">
                    QA/QC RECORD
                  </span>
                  <p className="text-xs font-bold text-slate-700 mt-2">พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH')}</p>
                </div>
              </div>

              {/* Complete Finish Good Inspection Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3 border-b border-r border-slate-300">หมายเลขล็อต (Lot ID)</th>
                      <th className="py-2.5 px-2.5 border-b border-r border-slate-300">วันที่ตรวจ</th>
                      <th className="py-2.5 px-2.5 border-b border-r border-slate-300">วันผลิต (MFG)</th>
                      <th className="py-2.5 px-2.5 border-b border-r border-slate-300">วันหมดอายุ (EXP)</th>
                      <th className="py-2.5 px-3 border-b border-r border-slate-300">จำนวนสี / สายพันธุ์ที่ตรวจ</th>
                      <th className="py-2.5 px-2.5 border-b border-r border-slate-300">เลขที่ PO</th>
                      <th className="py-2.5 px-3 border-b border-slate-300 text-center">ผลการตรวจ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {finishGoodLots.map((fg) => {
                      const overall = getFgOverallStatus(fg);
                      const isPassed = overall === 'Passed';
                      const isPending = overall === 'Pending';
                      const colorKeys = Object.keys(fg.colorBreakdown || {}).filter(c => (fg.colorBreakdown[c] || 0) > 0);
                      const colorSummary = colorKeys.map(c => `${c} ${fg.colorBreakdown[c]}%`).join(', ');

                      return (
                        <tr key={`print-fg-overview-${fg.id}`} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">{fg.id}</td>
                          <td className="py-2.5 px-2.5 text-slate-700 border-r border-slate-200">{fg.releaseDate || fg.date}</td>
                          <td className="py-2.5 px-2.5 text-slate-600 border-r border-slate-200">{fg.date}</td>
                          <td className="py-2.5 px-2.5 text-red-600 font-bold border-r border-slate-200">{fg.expireDate}</td>
                          <td className="py-2.5 px-3 text-slate-800 border-r border-slate-200 font-medium">
                            <span className="font-bold text-emerald-800">{colorKeys.length} สี: </span>
                            <span className="text-[11px] text-slate-600">{colorSummary || 'รอลงบันทึก'}</span>
                          </td>
                          <td className="py-2.5 px-2.5 font-mono text-[11px] text-slate-700 border-r border-slate-200">{fg.poNumber}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded font-black text-[10px] border inline-block ${
                              isPassed ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              isPending ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'
                            }`}>
                              {isPassed ? '✓ Passed (ผ่านการตรวจ)' : isPending ? '⏳ รอผลตรวจ' : '✕ HOLD / REJECT'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
                <div className="space-y-2">
                  <div className="border-b border-dashed border-slate-400 pb-5">
                    <p className="font-serif italic text-slate-700 font-bold">Somchai FG</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">(นาย สมชาย สินค้าดี)</p>
                    <p className="text-[10px] text-slate-500">QC Finish Good Inspector</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="border-b border-dashed border-slate-400 pb-5">
                    <p className="font-serif italic text-slate-700 font-bold">Wichai Prod</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">(นาย วิชัย ผลิตเลิศ)</p>
                    <p className="text-[10px] text-slate-500">Production Lead</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="border-b border-dashed border-slate-400 pb-5">
                    <p className="font-serif italic text-slate-700 font-bold">Dr. Prasit QA</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">(ดร. ประสิทธิ์ มั่นคง)</p>
                    <p className="text-[10px] text-slate-500">QA Manager</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP 2.7: สั่งพิมพ์ใบรับรอง COA (Print Preview & Print Modal) --- */}
      {isCoaPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-800">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">สั่งพิมพ์เอกสาร COA ทางการ</h3>
                  <p className="text-xs text-slate-500">สั่งพิมพ์เอกสารขนาด A4 ผ่านระบบพิมพ์ของเบราว์เซอร์</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCoaPrintModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <p><span className="font-bold text-slate-700">หมายเลขล็อต:</span> <strong className="text-emerald-800 font-mono text-sm">{currentFgLot?.id}</strong></p>
              <p><span className="font-bold text-slate-700">เลขที่ COA:</span> COA-{currentFgLot?.id}</p>
              <p><span className="font-bold text-slate-700">ลูกค้า / DC:</span> {currentFgLot?.customerName} ({currentFgLot?.distributionCenter})</p>
              <p><span className="font-bold text-slate-700">สถานะเอกสาร:</span> <span className="font-bold text-emerald-700">พร้อมพิมพ์ (จัดรูปแบบ A4 เรียบร้อย)</span></p>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200">
                * ระบบตั้งค่าหน้ากระดาษ A4 แนวตั้ง (Portrait) พร้อมตราสัญลักษณ์ ลายเซ็น 3 ฝ่าย และ QR Traceability มุมล่างขวา
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCoaPrintModalOpen(false)}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCoaPrintModalOpen(false);
                  setTimeout(() => window.print(), 150);
                }}
                className="w-1/2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์เอกสาร (Print)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP 2.8: บันทึกเอกสารเป็น PDF (Save to PDF & Electronic Record) --- */}
      {isCoaPdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="bg-teal-100 p-2 rounded-xl text-teal-800">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">บันทึกเป็น PDF (Save / Export PDF)</h3>
                  <p className="text-xs text-slate-500">ส่งออกเอกสาร COA ในรูปแบบไฟล์ดิจิทัล PDF ขนาด A4</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCoaPdfModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <p><span className="font-bold text-slate-700">ชื่อไฟล์เอกสาร:</span> <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono font-bold text-teal-900">COA-{currentFgLot?.id}.pdf</code></p>
                <p><span className="font-bold text-slate-700">ขนาดหน้ากระดาษ:</span> A4 (210 x 297 mm) มาตรฐานสากล</p>
                <p><span className="font-bold text-slate-700">ระบบตรวจสอบย้อนกลับ:</span> QR Traceability TR-711-{currentFgLot?.id}</p>
              </div>

              {/* Instructions box */}
              <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold">ขั้นตอนการบันทึกเป็น PDF ในเบราว์เซอร์:</p>
                <p className="text-[11px] text-emerald-800">1. คลิกปุ่ม <strong>&quot;บันทึกเป็นไฟล์ PDF (Print to PDF)&quot;</strong> ด้านล่าง</p>
                <p className="text-[11px] text-emerald-800">2. ในหน้าต่างพิมพ์ ให้เลือกปลายทาง (Destination) เป็น <strong>&quot;บันทึกเป็น PDF&quot; (Save as PDF)</strong></p>
                <p className="text-[11px] text-emerald-800">3. กดบันทึกเพื่อจัดเก็บไฟล์ลงในอุปกรณ์ของคุณได้ทันที</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCoaPdfModalOpen(false);
                  setTimeout(() => window.print(), 150);
                }}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-2xl text-xs shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>บันทึกเป็นไฟล์ PDF (Print to PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleDownloadCoaJson(currentFgLot);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-2xl text-xs border border-slate-300 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                <span>ดาวน์โหลดข้อมูลเอกสารดิจิทัล (.json)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP 2.5: สร้าง Lot สินค้าสำเร็จรูปใหม่ (Finish Good Lot) พร้อมข้อมูลครบถ้วน --- */}
      {isNewFgModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-100 p-2.5 rounded-2xl text-emerald-700">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">สร้าง Lot สินค้าสำเร็จรูปใหม่</h3>
                  <p className="text-xs text-slate-500">ลงข้อมูลล็อตสินค้า, คู่ค้า, ศูนย์กระจายสินค้า, และกำหนดวันผลิต/หมดอายุ</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsNewFgModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFgLot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  1. หมายเลข Lot สินค้าสำเร็จรูป (FG Lot ID)
                </label>
                <input
                  type="text"
                  value={newFgLotIdInput}
                  onChange={(e) => setNewFgLotIdInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="เช่น LOT-FG-2026-1103-03"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    2. วันที่ผลิต (MFG):
                  </label>
                  <input
                    type="date"
                    value={newFgMfgDate}
                    onChange={(e) => {
                      const mfg = e.target.value;
                      setNewFgMfgDate(mfg);
                      try {
                        const d = new Date(mfg);
                        d.setDate(d.getDate() + 6);
                        setNewFgExpDate(d.toISOString().split('T')[0]);
                      } catch {
                        // ignore
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      3. วันหมดอายุ (EXP):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const d = new Date(newFgMfgDate);
                          d.setDate(d.getDate() + 6);
                          setNewFgExpDate(d.toISOString().split('T')[0]);
                        } catch {
                          // ignore
                        }
                      }}
                      className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                    >
                      +6 วันอัตโนมัติ
                    </button>
                  </div>
                  <input
                    type="date"
                    value={newFgExpDate}
                    onChange={(e) => setNewFgExpDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* ข้อมูลคู่ค้า, DC, PO, วันและเวลาตรวจ */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                  ข้อมูลการจัดส่งและตรวจปล่อย (Delivery & Release Information)
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อคู่ค้า / ลูกค้า:</label>
                  <input
                    type="text"
                    value={newFgCustomerInput}
                    onChange={(e) => setNewFgCustomerInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ศูนย์กระจายสินค้า (DC):</label>
                    <input
                      type="text"
                      value={newFgDcInput}
                      onChange={(e) => setNewFgDcInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">เลขที่ใบสั่งซื้อ (PO No.):</label>
                    <input
                      type="text"
                      value={newFgPoInput}
                      onChange={(e) => setNewFgPoInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">วันที่ตรวจปล่อย:</label>
                    <input
                      type="date"
                      value={newFgReleaseDateInput}
                      onChange={(e) => setNewFgReleaseDateInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">เวลาตรวจ:</label>
                    <input
                      type="text"
                      value={newFgInspectionTimeInput}
                      onChange={(e) => setNewFgInspectionTimeInput(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="เช่น 09:30 น."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-0.5">
                <p><span className="font-bold">บรรจุภัณฑ์:</span> กล่อง PET ใส Food Grade (140g ± 3g)</p>
                <p><span className="font-bold">การตรวจปล่อย:</span> 7 เกณฑ์มาตรฐานกายภาพและอุณหภูมิ 2–6 °C</p>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsNewFgModalOpen(false)} 
                  className="px-4 py-2 text-sm text-slate-600 font-semibold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all cursor-pointer"
                >
                  บันทึกสร้าง Lot FG
                </button>
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
              <h3 className="text-lg font-black text-slate-900">เลือกผลการตรวจ (Evaluation)</h3>
              <p className="text-xs text-slate-500 mt-1">ประเมินผลการตรวจสอบหัวข้อนี้สำหรับสินค้าสำเร็จรูป</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleUpdateFgResult('Passed')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl shadow-md text-sm transition-all cursor-pointer active:scale-95"
              >
                Passed (ผ่าน)
              </button>
              <button
                type="button"
                onClick={() => handleUpdateFgResult('Failed')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl shadow-md text-sm transition-all cursor-pointer active:scale-95"
              >
                Failed (ไม่ผ่าน)
              </button>
            </div>
            <button 
              type="button"
              onClick={() => setFgStatusModalOpen(false)} 
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
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
                  <p className="text-xs text-slate-500">ระบุสาเหตุที่ไม่ผ่านเกณฑ์และมาตรการแก้ไข</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setFgFailModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFailRemark} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">สาเหตุที่ไม่ผ่านเกณฑ์ (Reason)</label>
                <textarea
                  value={failReason}
                  onChange={(e) => setFailReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="เช่น สีไม่สม่ำเสมอ ผิวมีรอยแตก หรือน้ำหนักต่ำกว่าเกณฑ์..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">วิธีแก้ไข / การจัดการ (Corrective Action)</label>
                <input
                  type="text"
                  value={failAction}
                  onChange={(e) => setFailAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="เช่น คัดแยกสินค้าออกจากไลน์ผลิต และทำลายตามระเบียบ..."
                  required
                />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setFgFailModalOpen(false)} 
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all cursor-pointer"
                >
                  บันทึกผลไม่ผ่าน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP 6: Raw Material Selector for COA (Page 4) - บังคับ 3 ถึง 5 Lot --- */}
      {isRmSelectorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-teal-100 p-2.5 rounded-2xl text-teal-700">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">เลือก Lot วัตถุดิบ (Raw Material Traceability)</h3>
                  <p className="text-xs text-slate-500">เกณฑ์บังคับ: ต้องระบุ 3 ถึง 5 ล็อตเพื่อออกใบรับรอง COA</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsRmSelectorModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Validation Notice Banner */}
            <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
              selectedRmForCoa.length >= 3 && selectedRmForCoa.length <= 5
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="font-black">สถานะการเลือก:</span>
                <span>เลือกแล้ว <strong>{selectedRmForCoa.length}</strong> / 5 ล็อต</span>
              </div>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                selectedRmForCoa.length >= 3 && selectedRmForCoa.length <= 5
                  ? 'bg-emerald-200 text-emerald-900'
                  : 'bg-amber-200 text-amber-900'
              }`}>
                {selectedRmForCoa.length < 3 ? `ขาดอีก ${3 - selectedRmForCoa.length} ล็อต (ขั้นต่ำ 3)` : 'ครบตามเกณฑ์ (3-5 ล็อต)'}
              </span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
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
                          showToast('กำหนดให้เลือกได้สูงสุด 5 ล็อตเท่านั้น');
                        }
                      }
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                      isSelected ? 'bg-teal-50 border-teal-500 shadow-2xs ring-1 ring-teal-400/40' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-2">
                        <span>{rm.id}</span>
                        <span className="text-[11px] text-slate-500 font-normal">(รับเข้า: {rm.receiveDate})</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ความหวาน: <strong className="text-teal-700">{rm.brix} °Bx</strong> | สี: <strong className="text-slate-700">{rm.color}</strong> | Pesticide: <strong className={rm.pesticideStatus === 'Passed' ? 'text-emerald-700' : 'text-red-700'}>{rm.pesticideStatus}</strong>
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-xl transition-colors ${
                      isSelected ? 'bg-teal-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}>
                      {isSelected ? '✓ เลือกแล้ว' : '+ เลือก'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="text-[11px] text-slate-400 text-center sm:text-left">
                * ต้องเลือก 3 ถึง 5 ล็อต จึงจะสามารถออกใบรับรอง COA ทางการได้
              </p>
              <button 
                type="button"
                onClick={() => {
                  if (selectedRmForCoa.length < 3) {
                    showToast('ต้องเลือกอย่างน้อย 3 ล็อต จึงจะสามารถออก COA ได้');
                    return;
                  }
                  setIsRmSelectorModalOpen(false);
                  showToast(`ยืนยันการเลือกวัตถุดิบ ${selectedRmForCoa.length} ล็อต เรียบร้อย`);
                }} 
                className={`font-semibold px-6 py-2.5 rounded-xl text-sm w-full sm:w-auto shadow-md cursor-pointer transition-all ${
                  selectedRmForCoa.length >= 3 && selectedRmForCoa.length <= 5
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {selectedRmForCoa.length < 3 
                  ? `เลือกแล้ว ${selectedRmForCoa.length}/3 ล็อต (ต้องการอีก ${3 - selectedRmForCoa.length})`
                  : `ยืนยันการเลือก (${selectedRmForCoa.length} ล็อต)`}
              </button>
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
              <button 
                type="button"
                onClick={() => setIsCoaModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
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
                    <span className={`text-xs font-bold px-3 py-1 rounded-xl transition-colors ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isSelected ? 'กำลังแสดง' : 'เลือก'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="button" 
                onClick={() => setIsCoaModalOpen(false)} 
                className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm w-full shadow-md cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP 8: ปริ้นภาพรวมการตรวจทั้งหมด (Production Lots Summary Report) ขนาด A4 / PDF --- */}
      {isSummaryPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn overflow-y-auto print:fixed print:inset-0 print:z-[9999] print:p-0 print:bg-white print:overflow-visible">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-300 p-6 sm:p-10 space-y-6 my-auto print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
            {/* Modal Top Control Bar (Hidden when printing) */}
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center space-x-2.5">
                <div className="bg-emerald-800 text-white p-2 rounded-xl">
                  <Printer className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">พิมพ์ภาพรวมการตรวจทั้งหมด (PDF ขนาด A4)</h3>
                  <p className="text-xs text-slate-500">รายงานสรุปผลการตรวจสอบคุณภาพสินค้าขาออกและการตรวจปล่อยสินค้า</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์รายงาน / บันทึก PDF (A4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSummaryPrintModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-all"
                >
                  ✕ ปิด
                </button>
              </div>
            </div>

            {/* A4 Paper Document Content */}
            <div className="space-y-5 text-slate-900">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-800" />
                    <h2 className="text-lg font-black text-slate-900">บริษัท เฟรชโปร อินเตอร์ฟู้ดส์ จำกัด</h2>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">Fresh Pro Interfoods Co., Ltd. • Quality Assurance Division</p>
                  <p className="text-[11px] text-slate-500">99/9 หมู่ 5 นิคมอุตสาหกรรมเกษตร บางบัวทอง จ.นนทบุรี 11110 • Tel: 02-999-8888</p>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-900 text-white text-[11px] font-black px-3 py-1 rounded-lg uppercase tracking-wider inline-block">
                    CP ALL Vendor Standard
                  </span>
                  <p className="text-xs font-black text-slate-900 mt-2">รายงานสรุปผลการตรวจสอบคุณภาพสินค้าขาออก</p>
                  <p className="text-[10px] text-slate-500 font-mono">วันที่พิมพ์รายงาน: 04/11/2026 | DOC-SUM-711</p>
                </div>
              </div>

              {/* General Scope Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">สินค้า:</span>
                  <span className="font-bold text-slate-900">มะเขือเทศคละสี 140g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">ลูกค้า / คู่ค้า:</span>
                  <span className="font-bold text-slate-900">CP ALL / 7-Eleven</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">ศูนย์กระจายสินค้า:</span>
                  <span className="font-bold text-slate-900">DC บางบัวทอง</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">มาตรฐานรับรอง:</span>
                  <span className="font-bold text-emerald-800">GHPs, HACCP, GAP</span>
                </div>
              </div>

              {/* Complete Production Lots Table */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  <span>ตารางสรุปรายการล็อตสินค้าและผลตรวจวิเคราะห์ (Production & QA Inspection Records)</span>
                </h4>
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2 px-2.5 border-b border-r border-slate-300">หมายเลขล็อต (FG)</th>
                        <th className="py-2 px-2 border-b border-r border-slate-300">วันที่ผลิต (MFG)</th>
                        <th className="py-2 px-2 border-b border-r border-slate-300">วันหมดอายุ (EXP)</th>
                        <th className="py-2 px-2 border-b border-r border-slate-300">PO Number</th>
                        <th className="py-2 px-2.5 border-b border-r border-slate-300">ล็อตวัตถุดิบ (RM)</th>
                        <th className="py-2 px-2 border-b border-r border-slate-300 text-center">Pesticide</th>
                        <th className="py-2 px-2 border-b border-r border-slate-300 text-center">7 เกณฑ์กายภาพ</th>
                        <th className="py-2 px-2.5 border-b border-slate-300 text-center">สถานะตรวจปล่อย</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {finishGoodLots.map((fg) => {
                        const overall = getFgOverallStatus(fg);
                        const isPassed = overall === 'Passed';
                        const isPending = overall === 'Pending';
                        const checkValues = Object.values(fg.fgChecks);
                        const passedChecksCount = checkValues.filter(c => c.result === 'Passed').length;
                        return (
                          <tr key={`print-fg-${fg.id}`} className="hover:bg-slate-50">
                            <td className="py-2 px-2.5 font-bold text-slate-900 border-r border-slate-200">{fg.id}</td>
                            <td className="py-2 px-2 text-slate-600 border-r border-slate-200">{fg.date}</td>
                            <td className="py-2 px-2 text-slate-600 border-r border-slate-200">{fg.expireDate}</td>
                            <td className="py-2 px-2 font-mono text-[11px] text-slate-700 border-r border-slate-200">{fg.poNumber}</td>
                            <td className="py-2 px-2.5 text-[10px] text-slate-600 border-r border-slate-200">
                              {fg.linkedRmLots.slice(0, 3).join(', ')}
                            </td>
                            <td className="py-2 px-2 text-center border-r border-slate-200">
                              <span className="font-bold text-emerald-800 text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Passed (0 ตกค้าง)
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center border-r border-slate-200 font-bold text-[11px]">
                              {passedChecksCount}/7 ผ่าน
                            </td>
                            <td className="py-2 px-2.5 text-center font-bold text-[11px]">
                              {isPassed ? (
                                <span className="text-slate-900 font-bold">Passed Approved</span>
                              ) : isPending ? (
                                <span className="text-amber-600 font-bold">Pending</span>
                              ) : (
                                <span className="text-red-600 font-bold">Failed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7 Standard Physical Inspection Criteria Summary */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <span className="font-black text-slate-800 uppercase block text-[10px]">
                  เกณฑ์มาตรฐานตรวจสอบด้านกายภาพ 7 รายการ (7-Eleven Inspection Checklist):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-slate-600">
                  <p>1. <strong>การปิดผนึกฝากล่อง:</strong> ฝากล่อง PET ปิดสนิทครบทุกมุม ไม่ฉีกขาด</p>
                  <p>2. <strong>ลักษณะทางกายภาพ:</strong> ผลสด ผิวเรียบตึงเงางาม ไม่มีสิ่งแปลกปลอม ไม่พบผลช้ำ/เชื้อรา</p>
                  <p>3. <strong>ฉลากและข้อความบังคับ:</strong> อายุสินค้า 6 วัน และระบุ &quot;ล้างก่อนรับประทาน&quot; ชัดเจน</p>
                  <p>4. <strong>น้ำหนักสุทธิ (140g):</strong> น้ำหนักสุทธิไม่น้อยกว่า 140 กรัมต่อแพ็ค</p>
                  <p>5. <strong>จำนวนสินค้าตรง PO:</strong> ยอดบรรจุจริงตรงตามใบสั่งซื้อ PO และระบุจำนวนตะกร้าขนส่ง</p>
                  <p>6. <strong>อุณหภูมิห้องขณะตรวจ:</strong> ควบคุมความเย็น 2.0 °C ถึง 6.0 °C ตลอดการตรวจปล่อย</p>
                  <p className="sm:col-span-2">7. <strong>ความสะอาดตะกร้าขนส่ง:</strong> ผ่านการล้างฆ่าเชื้อ แห้งสะอาด จัดเรียงเป็นระเบียบ</p>
                </div>
              </div>

              {/* Official Sign-off Stamp Box */}
              <div className="pt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
                <div className="space-y-2">
                  <div className="border-b border-dashed border-slate-400 pb-5">
                    <p className="font-serif italic text-slate-700 font-bold">Somchai QC</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">(นาย สมชาย สินค้าดี)</p>
                    <p className="text-[10px] text-slate-500">ผู้ตรวจสอบสินค้าขาออก (QC Inspector)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="border-b border-dashed border-slate-400 pb-5">
                    <p className="font-serif italic text-slate-700 font-bold">Wichai Prod</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">(นาย วิชัย ผลิตเลิศ)</p>
                    <p className="text-[10px] text-slate-500">หัวหน้าฝ่ายบรรจุ/คลังสินค้า (Production Lead)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="border-b border-dashed border-slate-400 pb-5">
                    <p className="font-serif italic text-slate-700 font-bold">Dr. Prasit QA</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">(ดร. ประสิทธิ์ มั่นคง)</p>
                    <p className="text-[10px] text-slate-500">ผู้อนุมัติปล่อยสินค้า (QA Manager)</p>
                  </div>
                </div>
              </div>

              {/* Footer text */}
              <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                เอกสารนี้สร้างขึ้นโดยระบบควบคุมคุณภาพ COA Pro • ได้รับการรับรองตามมาตรฐาน GHPs, HACCP, GAP
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-lg sticky top-0 z-40 print:hidden border-b border-emerald-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="bg-emerald-500/20 p-2.5 rounded-2xl border border-emerald-400/30 text-emerald-300 shadow-inner">
              <ClipboardCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight">COA Pro</h1>
                <span className="text-[11px] font-bold bg-emerald-500/30 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  7-Eleven Retail Spec
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">ระบบตรวจสอบคุณภาพและออกใบรับรองผลวิเคราะห์ (COA) มะเขือเทศคละสี 140g</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-emerald-950/80 px-3.5 py-1.5 rounded-xl border border-emerald-700/60 text-xs flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-emerald-200">CP ALL Retail Link: Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-[69px] z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-2 py-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
            <span>1. สรุปภาพรวม</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('labInput')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'labInput' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4 text-teal-600" />
            <span>2. Lab Data Input สินค้ารับเข้า</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finishGood')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'finishGood' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-600" />
            <span>3. ผลการตรวจสินค้า Finish good</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coa')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'coa' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-600" />
            <span>4. เอกสาร COA ทางการ (Official)</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0">
        
        {/* ================= 1. DASHBOARD VIEW (สรุปภาพรวม) ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                  <span>สรุปภาพรวม (Overview Dashboard)</span>
                </h2>
                <p className="text-sm text-slate-600 mt-1">รายงานสรุปสถานะล็อตสินค้า ผลตรวจสอบกายภาพ และผลวิเคราะห์สารเคมีตามข้อกำหนด 7-Eleven</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('labInput')}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>บันทึกผล Lab รับเข้า</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('coa')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>ออกเอกสาร COA</span>
                </button>
              </div>
            </div>

            {/* 5 Summary Cards - Minimal & Clean */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: จำนวน Lot ทั้งหมด */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">1. จำนวน Lot ทั้งหมด</p>
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900">{totalFgLots} <span className="text-sm font-normal text-slate-500">ล็อต</span></p>
                  <p className="text-[11px] text-slate-400 mt-1">ผลิตภัณฑ์สำเร็จรูปในระบบ</p>
                </div>
              </div>

              {/* Card 2: ผลการตรวจสอบสินค้าขาออก */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700">2. ผลการตรวจสอบสินค้าขาออก</p>
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="border border-slate-200 bg-slate-50/60 p-1.5 rounded-xl">
                    <p className="text-[11px] font-semibold text-slate-600">ผ่าน</p>
                    <p className="text-lg font-black text-slate-900 my-0.5">{passedFgCount}</p>
                    <p className="text-[10px] text-slate-400">พร้อมส่ง</p>
                  </div>
                  <div className="border border-slate-200 bg-slate-50/60 p-1.5 rounded-xl">
                    <p className="text-[11px] font-semibold text-slate-600">รอตรวจ</p>
                    <p className="text-lg font-black text-slate-900 my-0.5">{pendingFgCount}</p>
                    <p className="text-[10px] text-slate-400">รอผลตรวจ</p>
                  </div>
                  <div className="border border-slate-200 bg-slate-50/60 p-1.5 rounded-xl">
                    <p className="text-[11px] font-semibold text-slate-600">ไม่ผ่าน</p>
                    <p className="text-lg font-black text-slate-900 my-0.5">{failedFgCount}</p>
                    <p className="text-[10px] text-slate-400">Hold/Reject</p>
                  </div>
                </div>
              </div>

              {/* Card 3: ผลตรวจ Pesticide */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700">3. ผลตรวจ Pesticide</p>
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="border border-slate-200 bg-slate-50/60 p-1.5 rounded-xl">
                    <p className="text-[11px] font-semibold text-slate-600">ผ่าน</p>
                    <p className="text-lg font-black text-slate-900 my-0.5">{passedPestRmCount}</p>
                    <p className="text-[10px] text-slate-400">0 ตกค้าง</p>
                  </div>
                  <div className="border border-slate-200 bg-slate-50/60 p-1.5 rounded-xl">
                    <p className="text-[11px] font-semibold text-slate-600">รอผล</p>
                    <p className="text-lg font-black text-slate-900 my-0.5">{pendingPestRmCount}</p>
                    <p className="text-[10px] text-slate-400">รอตรวจ</p>
                  </div>
                  <div className="border border-slate-200 bg-slate-50/60 p-1.5 rounded-xl">
                    <p className="text-[11px] font-semibold text-slate-600">ไม่ผ่าน</p>
                    <p className="text-lg font-black text-slate-900 my-0.5">{failedPestRmCount}</p>
                    <p className="text-[10px] text-slate-400">พบสาร</p>
                  </div>
                </div>
              </div>

              {/* Card 4: ผลตรวจ Brix เฉลี่ย (เกณฑ์ ≥ 6.0 °Bx) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700">4. ผลตรวจ Brix (เฉลี่ย)</p>
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900">{avgBrixVal} <span className="text-sm font-normal text-slate-500">°Bx</span></p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">เกณฑ์ขั้นต่ำ 7-Eleven ≥ 6.0 °Bx</p>
                </div>
              </div>

              {/* Card 5: สรุปการออกเอกสาร COA */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700">5. สรุปการออกเอกสาร COA</p>
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="border border-slate-200 bg-slate-50/60 p-1.5 rounded-xl">
                    <p className="text-[11px] font-semibold text-slate-600">ทั้งหมด</p>
                    <p className="text-lg font-black text-slate-900 my-0.5">{totalFgLots}</p>
                    <p className="text-[10px] text-slate-400">ฉบับ</p>
                  </div>
                  <div className="border border-slate-200 bg-slate-50/60 p-1.5 rounded-xl">
                    <p className="text-[11px] font-semibold text-slate-600">ผ่าน</p>
                    <p className="text-lg font-black text-slate-900 my-0.5">{passedFgCount}</p>
                    <p className="text-[10px] text-slate-400">อนุมัติแล้ว</p>
                  </div>
                  <div className="border border-slate-200 bg-slate-50/60 p-1.5 rounded-xl">
                    <p className="text-[11px] font-semibold text-slate-600">ไม่ผ่าน</p>
                    <p className="text-lg font-black text-slate-900 my-0.5">{pendingFgCount + failedFgCount}</p>
                    <p className="text-[10px] text-slate-400">Hold/รอผล</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Finish Good Lots Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden mt-8">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/80">
                <h3 className="font-bold text-slate-800 flex items-center space-x-2 text-sm sm:text-base">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  <span>รายการล็อตสินค้าและผลตรวจวิเคราะห์ (Production Lots)</span>
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSummaryPrintModalOpen(true)}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-300" />
                    <span>พิมพ์ภาพรวมการตรวจ (PDF / A4)</span>
                  </button>
                  <span className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                    ข้อมูลเชื่อมโยงอัตโนมัติจากผลการตรวจ Finish Good
                  </span>
                </div>
              </div>

              {/* กรองข้อมูลผลตรวจ: ทั้งหมด, ผ่านพร้อมส่ง, รอผลตรวจ, ไม่ผ่านเกณฑ์ */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-6 py-3 bg-slate-50/50 text-xs">
                <span className="text-slate-600 font-bold mr-1 text-[11px] uppercase tracking-wider">กรองสถานะ:</span>
                <button
                  type="button"
                  onClick={() => setProdLotFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    prodLotFilter === 'all' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ทั้งหมด ({finishGoodLots.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProdLotFilter('passed')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    prodLotFilter === 'passed' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ผ่านพร้อมส่ง ({passedFgCount})
                </button>
                <button
                  type="button"
                  onClick={() => setProdLotFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    prodLotFilter === 'pending' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  รอผลตรวจ ({pendingFgCount})
                </button>
                <button
                  type="button"
                  onClick={() => setProdLotFilter('failed')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    prodLotFilter === 'failed' 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ไม่ผ่านเกณฑ์ ({failedFgCount})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-600 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-5">หมายเลขล็อต (FG)</th>
                      <th className="py-3.5 px-4">วันที่ผลิต</th>
                      <th className="py-3.5 px-4">Pesticide (Raw Mat.)</th>
                      <th className="py-3.5 px-4">ผลตรวจสอบด้านกายภาพ</th>
                      <th className="py-3.5 px-4">สถานะภาพรวม</th>
                      <th className="py-3.5 px-5 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {finishGoodLots
                      .filter((fg) => {
                        const overall = getFgOverallStatus(fg);
                        if (prodLotFilter === 'passed') return overall === 'Passed';
                        if (prodLotFilter === 'pending') return overall === 'Pending';
                        if (prodLotFilter === 'failed') return overall === 'Failed';
                        return true;
                      })
                      .map((fg) => {
                        const overall = getFgOverallStatus(fg);
                        const isPassed = overall === 'Passed';
                        const isPending = overall === 'Pending';
                        return (
                          <tr key={fg.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-5 font-bold text-slate-900">{fg.id}</td>
                            <td className="py-4 px-4 text-slate-900 text-xs font-medium">{fg.date}</td>
                            <td className="py-4 px-4 text-xs font-semibold text-slate-900">
                              Passed
                            </td>
                            <td className="py-4 px-4">
                              {isPassed ? (
                                <span className="text-xs font-semibold text-slate-900">Passed</span>
                              ) : isPending ? (
                                <span className="text-xs font-bold text-amber-600">Pending</span>
                              ) : (
                                <span className="text-xs font-bold text-red-600">Failed</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {isPassed ? (
                                <span className="text-xs font-bold text-slate-900">Passed Approved</span>
                              ) : isPending ? (
                                <span className="text-xs font-bold text-amber-600">Pending</span>
                              ) : (
                                <span className="text-xs font-bold text-red-600">Failed</span>
                              )}
                            </td>
                            <td className="py-4 px-5 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setFgInspectLotId(fg.id);
                                  setActiveTab('finishGood');
                                }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                ตรวจสินค้า
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedLotId(fg.id);
                                  setActiveTab('coa');
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
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
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
                  <Database className="w-6 h-6 text-teal-600" />
                  <span>2. Lab Data Input สินค้ารับเข้า (Raw Material)</span>
                </h2>
                <p className="text-sm text-slate-600 mt-1">แยกการบันทึกตรวจ Brix และ Pesticide ออกจากกันอย่างชัดเจน พร้อมแสดง "รอผลการตรวจสอบ" หากยังไม่บันทึก</p>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBrixModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ ลงผล Brix & สี</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenPestModal}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ ลงผล Pesticide</span>
                </button>
              </div>
            </div>

            {/* Table 1: Brix & Color Inspection */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h3 className="font-bold text-slate-900 flex items-center space-x-2 text-sm sm:text-base">
                  <span className="w-3 h-3 rounded-full bg-teal-600"></span>
                  <span>ตารางบันทึกผลการตรวจความหวาน (Brix) และสัดส่วนสีมะเขือเทศ</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBrixModalOpen(true)}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 border border-teal-200 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>บันทึกผล Brix & สี (Pop-up)</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-700 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">หมายเลขล็อต (Raw Material)</th>
                      <th className="py-3 px-4">วันที่รับเข้า</th>
                      <th className="py-3 px-4 text-center">ระดับความหวาน (Brix) [เกณฑ์ ≥ 6.0 °Bx]</th>
                      <th className="py-3 px-4 text-center">สีมะเขือเทศ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rawMaterialLots.map((rm) => (
                      <tr key={`brix-${rm.id}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{rm.id}</td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs">{rm.receiveDate}</td>
                        <td className="py-3.5 px-4 font-medium text-center">
                          {rm.brix >= 6 ? (
                            <span className="text-slate-800 font-semibold">{rm.brix} °Bx</span>
                          ) : (
                            <span className="text-red-600 font-bold">{rm.brix} °Bx (✕ ต่ำกว่าเกณฑ์)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 font-semibold text-xs text-center">
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                            <span className={`w-2.5 h-2.5 rounded-full ${TOMATO_COLOR_PALETTE.find(c => c.name === rm.color)?.dot || 'bg-red-500'}`}></span>
                            <span>{rm.color}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Pesticide Inspection */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h3 className="font-bold text-slate-900 flex items-center space-x-2 text-sm sm:text-base">
                  <span className="w-3 h-3 rounded-full bg-slate-700"></span>
                  <span>ตารางบันทึกผลการตรวจ Pesticide (สารเคมีตกค้าง)</span>
                </h3>
                <button
                  type="button"
                  onClick={handleOpenPestModal}
                  className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 border border-slate-300 shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                  <span>บันทึกผล Pesticide (Pop-up)</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100/70 text-slate-700 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">หมายเลขล็อต (Raw Material)</th>
                      <th className="py-3 px-4 text-center">วันที่ตรวจ Lab</th>
                      <th className="py-3 px-4 text-center">Organophosphate & Carbamate</th>
                      <th className="py-3 px-4 text-center">Organochlorine & Pyrethroid</th>
                      <th className="py-3 px-4 text-center">ผลสรุป Pesticide</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rawMaterialLots.map((rm) => {
                      const pestRes = rm.pesticideStatus || 'รอผลการตรวจสอบ';
                      return (
                        <tr key={`pest-${rm.id}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{rm.id}</td>
                          <td className="py-3.5 px-4 text-slate-700 text-xs font-semibold font-mono text-center">{rm.testDate || rm.receiveDate}</td>
                          <td className="py-3.5 px-4 font-semibold text-xs text-slate-700 text-center">{rm.organophosphate || 'รอผลการตรวจสอบ'}</td>
                          <td className="py-3.5 px-4 font-semibold text-xs text-slate-700 text-center">{rm.organochlorine || 'รอผลการตรวจสอบ'}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`text-xs font-bold inline-block ${
                              pestRes === 'Passed' ? 'text-emerald-700' :
                              pestRes === 'Failed' ? 'text-red-600' : 'text-amber-600'
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
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              
              {/* Header & Create FG Lot Button */}
              <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2">
                    <Award className="w-6 h-6 text-emerald-600" />
                    <span>3. ผลการตรวจสินค้า Finish good (ผลิตภัณฑ์สำเร็จรูป)</span>
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">วิธีการตรวจสอบจำแนกตามเกณฑ์ 6 มาตรฐานกายภาพ และคลิกที่แถวตารางเพื่อประเมินสถานะ</p>
                </div>

                <button 
                  type="button" 
                  onClick={() => setIsNewFgModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm cursor-pointer transition-all flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ สร้าง Lot สำเร็จรูปใหม่</span>
                </button>
              </div>

              {/* ข้อมูลล็อตสินค้าสำเร็จรูปที่กำลังตรวจสอบ (Active Finish Good Specification) */}
              <div className="bg-slate-50/90 p-5 sm:p-6 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3.5">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 bg-emerald-100 rounded-xl text-emerald-800">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        ข้อมูลล็อตสินค้าสำเร็จรูปที่กำลังตรวจสอบ (Active Finish Good Specification)
                      </h3>
                      <p className="text-[11px] text-slate-500">ตรวจสอบและแก้ไขข้อมูลล็อตสำหรับการส่งมอบและออกใบรับรอง COA</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-semibold">
                    <span className="text-slate-500">ผลประเมิน 7 เกณฑ์:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                      getFgOverallStatus(activeInspectionFg) === 'Passed' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs' 
                        : getFgOverallStatus(activeInspectionFg) === 'Pending'
                        ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-2xs'
                        : 'bg-red-100 text-red-800 border-red-300 shadow-2xs'
                    }`}>
                      {getFgOverallStatus(activeInspectionFg) === 'Passed' ? '✓ Passed (ผ่านครบ 7 เกณฑ์)' :
                       getFgOverallStatus(activeInspectionFg) === 'Pending' ? '⏳ Pending (รอผลตรวจให้ครบ 7 รายการ)' : '✕ Failed (มีรายการไม่ผ่าน)'}
                    </span>
                  </div>
                </div>

                {/* Row 1: Lot ID, วันที่ผลิต MFG, วันหมดอายุ EXP */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                      1. Lot สินค้าสำเร็จรูป:
                    </label>
                    <select
                      value={fgInspectLotId}
                      onChange={(e) => setFgInspectLotId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {finishGoodLots.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.id} (ผลิต {f.date})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                        2. วันที่ผลิต (MFG):
                      </label>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        MFG
                      </span>
                    </div>
                    <input
                      type="date"
                      value={activeInspectionFg.date}
                      onChange={(e) => handleUpdateActiveFgField('date', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                        3. วันหมดอายุ (EXP):
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const d = new Date(activeInspectionFg.date);
                            d.setDate(d.getDate() + 6);
                            handleUpdateActiveFgField('expireDate', d.toISOString().split('T')[0]);
                          } catch {
                            // ignore
                          }
                        }}
                        className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        +6 วันอัตโนมัติ
                      </button>
                    </div>
                    <input
                      type="date"
                      value={activeInspectionFg.expireDate}
                      onChange={(e) => handleUpdateActiveFgField('expireDate', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Row 2 & 3: ชื่อคู่ค้า / ลูกค้า, ศูนย์กระจายสินค้า (DC), เลขที่ใบสั่งซื้อ (PO No.), วันที่ตรวจปล่อย, เวลาตรวจ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1 md:col-span-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                      ชื่อคู่ค้า / ลูกค้า:
                    </label>
                    <input
                      type="text"
                      value={activeInspectionFg.customerName || 'บริษัท ซีพี ออลล์ จำกัด (มหาชน) / 7-Eleven'}
                      onChange={(e) => handleUpdateActiveFgField('customerName', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="เช่น CP ALL / 7-Eleven"
                    />
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                      ศูนย์กระจายสินค้า (DC):
                    </label>
                    <input
                      type="text"
                      value={activeInspectionFg.distributionCenter || activeInspectionFg.store || 'DC บางบัวทอง'}
                      onChange={(e) => {
                        handleUpdateActiveFgField('distributionCenter', e.target.value);
                        handleUpdateActiveFgField('store', e.target.value);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="เช่น DC บางบัวทอง"
                    />
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                      เลขที่ PO (PO No.):
                    </label>
                    <input
                      type="text"
                      value={activeInspectionFg.poNumber || 'PO-7E-20261103-088'}
                      onChange={(e) => handleUpdateActiveFgField('poNumber', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="PO-..."
                    />
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                        วันที่ & เวลาตรวจ:
                      </label>
                    </div>
                    <div className="flex space-x-1.5">
                      <input
                        type="date"
                        value={activeInspectionFg.releaseDate || activeInspectionFg.date}
                        onChange={(e) => handleUpdateActiveFgField('releaseDate', e.target.value)}
                        className="w-1/2 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={activeInspectionFg.inspectionTime || '09:30 น.'}
                        onChange={(e) => handleUpdateActiveFgField('inspectionTime', e.target.value)}
                        className="w-1/2 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none"
                        placeholder="เวลา"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 7 Standard Criteria Table with dedicated tools for Color Mix, Weights, PO, and Temp */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-700 text-xs font-black uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-[28%]">หัวข้อการตรวจสอบด้านกายภาพ (7 เกณฑ์มาตรฐาน)</th>
                      <th className="py-3.5 px-4 w-[36%]">เกณฑ์กำหนด 7-Eleven & ข้อมูลบันทึกจริง</th>
                      <th className="py-3.5 px-4 w-[16%]">วิธีการตรวจ (Method)</th>
                      <th className="py-3.5 px-4 text-center w-[20%]">ผลการตรวจ (Result)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {Object.entries(activeInspectionFg?.fgChecks || {}).map(([key, check], idx) => {
                      const isUnchecked = check.result === 'ผลการตรวจ';
                      const isPassed = check.result === 'Passed';
                      const isFailed = check.result === 'Failed';
                      return (
                        <tr 
                          key={key} 
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-900 align-top">
                            <div className="flex items-start space-x-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                                {idx + 1}
                              </span>
                              <div>
                                <span>{check.name}</span>
                                {key === 'item3' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentColors = { ...(activeInspectionFg.colorBreakdown || { 'แดง': 40, 'เขียว': 30, 'ช็อคโกแลต': 30 }) };
                                      if (!currentColors['แดง']) currentColors['แดง'] = 34;
                                      if (!currentColors['เขียว']) currentColors['เขียว'] = 33;
                                      setTempColorMix(currentColors);
                                      setIsColorMixModalOpen(true);
                                    }}
                                    className="mt-2 block bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer shadow-xs transition-all"
                                  >
                                    🎨 สุ่มตรวจสัดส่วนสี (Pop-up)
                                  </button>
                                )}
                                {key === 'item5' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTempBoxWeights(activeInspectionFg.boxWeights || [142.5, 141.0, 143.2, 140.5, 142.8, 141.5, 143.0, 140.8, 142.0, 141.8]);
                                      setIsWeightModalOpen(true);
                                    }}
                                    className="mt-2 block bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer shadow-xs transition-all"
                                  >
                                    ⚖️ บันทึกผลชั่ง 10–20 กล่อง (Pop-up)
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-700 text-xs leading-relaxed font-medium align-top">
                            <p>{check.spec}</p>

                            {/* Specific interactive fields for Item 6 (Order vs Actual PO) and Item 7 (Temp) */}
                            {key === 'item6' && (
                              <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-900 block text-xs">จำนวนที่ตรวจเทียบยอดสั่งซื้อ</span>
                                  <span className="text-[10px] text-slate-500 font-medium">1 ตะกร้า = 25 กล่อง</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <label className="text-slate-600 font-bold block text-[10px] mb-0.5">ยอดสั่งซื้อ (PO)</label>
                                    <input
                                      type="number"
                                      value={activeInspectionFg.orderQty || 1200}
                                      onChange={(e) => handleUpdateOrderQuantities(Number(e.target.value) || 0, activeInspectionFg.actualQty, activeInspectionFg.basketCount)}
                                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                                      placeholder="กล่อง"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-600 font-bold block text-[10px] mb-0.5">จำนวนตะกร้า (Auto x25)</label>
                                    <input
                                      type="number"
                                      value={activeInspectionFg.basketCount || 48}
                                      onChange={(e) => {
                                        const baskets = Math.max(0, Number(e.target.value) || 0);
                                        const autoActual = baskets * 25;
                                        handleUpdateOrderQuantities(activeInspectionFg.orderQty, autoActual, baskets);
                                      }}
                                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800"
                                      placeholder="ตะกร้า"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-slate-600 font-bold block text-[10px] mb-0.5">ยอดบรรจุจริง (กล่อง)</label>
                                    <div className="flex items-center space-x-1">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateOrderQuantities(activeInspectionFg.orderQty, Math.max(0, activeInspectionFg.actualQty - 1), activeInspectionFg.basketCount)}
                                        className="w-6 h-6 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded flex items-center justify-center text-xs cursor-pointer shadow-xs"
                                        title="ลด 1 กล่อง (กรณีไม่เต็มตะกร้า)"
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        value={activeInspectionFg.actualQty || 1200}
                                        onChange={(e) => handleUpdateOrderQuantities(activeInspectionFg.orderQty, Math.max(0, Number(e.target.value) || 0), activeInspectionFg.basketCount)}
                                        className="w-full bg-white border border-slate-300 rounded-lg px-1.5 py-1 text-xs font-bold text-slate-800 text-center"
                                        placeholder="กล่อง"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateOrderQuantities(activeInspectionFg.orderQty, activeInspectionFg.actualQty + 1, activeInspectionFg.basketCount)}
                                        className="w-6 h-6 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded flex items-center justify-center text-xs cursor-pointer shadow-xs"
                                        title="เพิ่ม 1 กล่อง"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {key === 'item7' && (
                              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                                <span className="font-bold text-slate-800 block text-[11px]">อุณหภูมิห้องขณะตรวจปล่อย:</span>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={activeInspectionFg.measuredTemp || 3.8}
                                    onChange={(e) => handleUpdateMeasuredTemp(parseFloat(e.target.value) || 0)}
                                    className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-black text-slate-800 text-center"
                                  />
                                  <span className="text-xs font-bold text-slate-600">°C</span>
                                  <span className={`text-[11px] font-semibold ${
                                    activeInspectionFg.measuredTemp >= 2.0 && activeInspectionFg.measuredTemp <= 6.0
                                      ? 'text-slate-700'
                                      : 'text-red-600 font-bold'
                                  }`}>
                                    {activeInspectionFg.measuredTemp >= 2.0 && activeInspectionFg.measuredTemp <= 6.0 ? '(อยู่ในเกณฑ์ 2–6 °C)' : '(อยู่นอกเกณฑ์)'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 text-xs align-top">
                            {check.method}
                          </td>

                          <td className="py-3.5 px-4 text-center align-middle">
                            <div className="flex flex-col items-center justify-center space-y-1.5">
                              {isPassed ? (
                                <div className="inline-flex items-center space-x-2 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
                                  <span className="text-xs font-black text-emerald-700">✓ Passed</span>
                                  <button
                                    type="button"
                                    onClick={() => handleSetFgItemResult(key as keyof FinishGoodLot['fgChecks'], 'Failed')}
                                    className="text-[10px] text-slate-400 hover:text-slate-600 underline font-semibold ml-1 cursor-pointer"
                                    title="คลิกเพื่อสลับเป็น Failed"
                                  >
                                    เปลี่ยน
                                  </button>
                                </div>
                              ) : isFailed ? (
                                <div className="inline-flex items-center space-x-2 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
                                  <span className="text-xs font-black text-red-700">✕ Failed</span>
                                  <button
                                    type="button"
                                    onClick={() => handleSetFgItemResult(key as keyof FinishGoodLot['fgChecks'], 'Passed')}
                                    className="text-[10px] text-slate-400 hover:text-slate-600 underline font-semibold ml-1 cursor-pointer"
                                    title="คลิกเพื่อสลับเป็น Passed"
                                  >
                                    เปลี่ยน
                                  </button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-1.5 w-full max-w-[170px]">
                                  <button
                                    type="button"
                                    onClick={() => handleSetFgItemResult(key as keyof FinishGoodLot['fgChecks'], 'Passed')}
                                    className="py-1 px-2 rounded-lg font-bold text-xs bg-slate-100 hover:bg-slate-200 text-emerald-700 border border-slate-300 transition-all cursor-pointer shadow-2xs"
                                  >
                                    ✓ Passed
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSetFgItemResult(key as keyof FinishGoodLot['fgChecks'], 'Failed')}
                                    className="py-1 px-2 rounded-lg font-bold text-xs bg-slate-100 hover:bg-slate-200 text-red-700 border border-slate-300 transition-all cursor-pointer shadow-2xs"
                                  >
                                    ✕ Failed
                                  </button>
                                </div>
                              )}

                              {check.remark && (
                                <p className="text-[10px] text-red-600 font-medium bg-red-50 p-1.5 rounded-lg border border-red-200 max-w-[180px] leading-tight">
                                  {check.remark}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Bottom Right Save Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                <p className="text-xs text-slate-500 font-medium">* กดปุ่ม Passed หรือ Failed ในช่องผลการตรวจเพื่อประเมินสถานะแต่ละรายการ</p>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`บันทึกผลตรวจสอบล็อต ${fgInspectLotId} เรียบร้อยแล้ว`);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg text-sm flex items-center space-x-2 transition-all cursor-pointer transform active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  <span>บันทึกผลการตรวจสอบ</span>
                </button>
              </div>

            </div>

            {/* --- ภาพรวมสรุปผลการตรวจสอบ Finish Good ทุก Lot (Finish Good Inspection Summary) --- */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-emerald-700" />
                    <span>ภาพรวมสรุปการตรวจผลิตภัณฑ์สำเร็จรูปทุก Lot (Finish Good Overview)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    แสดงรายละเอียด Lot, วันที่ตรวจ, วันผลิต, วันหมดอายุ, จำนวนสี/สายพันธุ์ที่ตรวจ, เลข PO และผลการตรวจ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFgOverviewPrintModalOpen(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์ภาพรวมสรุปทุก Lot (A4)</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-3.5 border-b border-r border-slate-200">หมายเลขล็อต (FG)</th>
                      <th className="py-3 px-3 border-b border-r border-slate-200">วันที่ตรวจ</th>
                      <th className="py-3 px-3 border-b border-r border-slate-200">วันผลิต (MFG)</th>
                      <th className="py-3 px-3 border-b border-r border-slate-200">วันหมดอายุ (EXP)</th>
                      <th className="py-3 px-3.5 border-b border-r border-slate-200">สัดส่วนสี / สายพันธุ์ที่ตรวจ</th>
                      <th className="py-3 px-3 border-b border-r border-slate-200">เลขที่ PO</th>
                      <th className="py-3 px-3 border-b border-r border-slate-200 text-center">ผลการตรวจ</th>
                      <th className="py-3 px-3 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {finishGoodLots.map((fg) => {
                      const overall = getFgOverallStatus(fg);
                      const isPassed = overall === 'Passed';
                      const isPending = overall === 'Pending';
                      const colorKeys = Object.keys(fg.colorBreakdown || {}).filter(c => (fg.colorBreakdown[c] || 0) > 0);
                      const colorSummary = colorKeys.map(c => `${c} ${fg.colorBreakdown[c]}%`).join(', ');

                      return (
                        <tr key={`fg-overview-row-${fg.id}`} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3.5 font-bold text-slate-900 border-r border-slate-200">{fg.id}</td>
                          <td className="py-3 px-3 text-slate-700 border-r border-slate-200">{fg.releaseDate || fg.date}</td>
                          <td className="py-3 px-3 text-slate-600 border-r border-slate-200">{fg.date}</td>
                          <td className="py-3 px-3 text-red-600 font-bold border-r border-slate-200">{fg.expireDate}</td>
                          <td className="py-3 px-3.5 text-slate-800 border-r border-slate-200">
                            <span className="font-bold text-emerald-800">{colorKeys.length} สายพันธุ์: </span>
                            <span className="text-slate-600 text-[11px]">{colorSummary}</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-700 border-r border-slate-200">{fg.poNumber}</td>
                          <td className="py-3 px-3 text-center border-r border-slate-200">
                            <span className={`px-2.5 py-1 rounded-full font-black text-[10px] border inline-block ${
                              isPassed ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                              isPending ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'
                            }`}>
                              {isPassed ? '✓ Passed (ผ่าน)' : isPending ? '⏳ รอตรวจ' : '✕ HOLD / REJECT'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setFgInspectLotId(fg.id);
                                showToast(`สลับมาตรวจล็อต ${fg.id}`);
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer"
                            >
                              ตรวจล็อตนี้
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLotId(fg.id);
                                setActiveTab('coa');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer"
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

        {/* ================= 4. OFFICIAL COA DOCUMENT (เอกสาร COA ทางการ Official) ================= */}
        {activeTab === 'coa' && (() => {
          const isCoaValid = selectedRmForCoa.length >= 3 && selectedRmForCoa.length <= 5;
          const overall = getFgOverallStatus(currentFgLot);
          const isPassed = overall === 'Passed';
          const isPending = overall === 'Pending';

          return (
            <div className="space-y-6 animate-fadeIn">
              {/* Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-3 print:hidden">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">ล็อต Finish Good:</span>
                  <span className="bg-emerald-50 text-emerald-800 font-black px-3.5 py-1.5 rounded-xl border border-emerald-200 text-sm">
                    {currentFgLot?.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCoaModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    เลือกล็อตสินค้า (Pop-up)
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRmSelectorModalOpen(true)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer transition-all border ${
                      isCoaValid 
                        ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600' 
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 ring-2 ring-amber-400'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>เลือก Lot วัตถุดิบ ({selectedRmForCoa.length} / 5)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isCoaValid) {
                        showToast(`ไม่สามารถพิมพ์ COA ได้: ต้องเลือกวัตถุดิบ 3-5 ล็อต (ปัจจุบันมี ${selectedRmForCoa.length} ล็อต)`);
                        return;
                      }
                      setIsCoaPrintModalOpen(true);
                    }}
                    disabled={!isCoaValid}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      isCoaValid
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md cursor-pointer'
                        : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                    }`}
                    title={!isCoaValid ? 'ต้องเลือกวัตถุดิบ 3 - 5 ล็อต จึงจะสามารถออกเอกสารได้' : 'สั่งพิมพ์เอกสาร COA'}
                  >
                    <Printer className="w-4 h-4" />
                    <span>สั่งพิมพ์เอกสาร (Print)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isCoaValid) {
                        showToast(`ไม่สามารถบันทึก PDF ได้: ต้องเลือกวัตถุดิบ 3-5 ล็อต (ปัจจุบันมี ${selectedRmForCoa.length} ล็อต)`);
                        return;
                      }
                      setIsCoaPdfModalOpen(true);
                    }}
                    disabled={!isCoaValid}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      isCoaValid
                        ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-md cursor-pointer'
                        : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                    }`}
                    title={!isCoaValid ? 'ต้องเลือกวัตถุดิบ 3 - 5 ล็อต จึงจะสามารถบันทึกเป็น PDF ได้' : 'บันทึกเป็น PDF'}
                  >
                    <Download className="w-4 h-4" />
                    <span>บันทึกเป็น PDF (Save PDF)</span>
                  </button>
                </div>
              </div>

              {/* Warning alert if lots are < 3 or > 5 */}
              {!isCoaValid && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start space-x-3 text-amber-900 shadow-sm print:hidden">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-black text-sm text-amber-900">
                      ไม่สามารถออกเอกสารใบรับรองผลวิเคราะห์ (COA) ได้ในขณะนี้
                    </p>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      ตามข้อกำหนดมาตรฐาน 7-Eleven ในหัวข้อ <span className="font-bold underline">แหล่งที่มาวัตถุดิบและผลตรวจ Lab</span> กำหนดให้ต้องลงข้อมูล <span className="font-black text-amber-950">3 - 5 Lot</span> เท่านั้น 
                      (ปัจจุบันเลือกล็อตวัตถุดิบอยู่ <span className="font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-md border border-red-200">{selectedRmForCoa.length} Lot</span>) 
                      น้อยกว่าหรือมากกว่านั้นระบบจะไม่สามารถออกเอกสาร COA ทางการได้
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsRmSelectorModalOpen(true)}
                      className="mt-2.5 inline-flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>คลิกเพื่อปรับจำนวนล็อตวัตถุดิบ (3-5 Lot)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* A4 Paper Certificate of Analysis */}
              <div className="bg-white rounded-3xl border border-slate-300 shadow-xl p-8 sm:p-12 max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 space-y-6 relative">
                
                {/* Visual Watermark if invalid lots count */}
                {!isCoaValid && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-3xl flex flex-col items-center justify-center z-20 pointer-events-none print:hidden">
                    <div className="bg-white/95 border-2 border-amber-500 p-6 rounded-2xl shadow-2xl text-center max-w-md pointer-events-auto">
                      <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                      <h4 className="font-black text-slate-900 text-base">เอกสาร COA ยังไม่พร้อมออก</h4>
                      <p className="text-xs text-slate-600 mt-2">
                        กรุณาเลือกข้อมูลแหล่งที่มาวัตถุดิบให้ครบถ้วน <span className="font-bold text-amber-700">3 ถึง 5 Lot</span> (ปัจจุบัน: {selectedRmForCoa.length} Lot) เพื่อให้สมบูรณ์ตามเกณฑ์มาตรฐาน
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsRmSelectorModalOpen(true)}
                        className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        ปรับปรุงล็อตวัตถุดิบ
                      </button>
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                  <div className="flex items-start space-x-4">
                    <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm">
                      <ShieldCheck className="w-8 h-8 text-slate-100" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">บริษัท เฟรชโปร อินเตอร์ฟู้ดส์ จำกัด</h2>
                      <p className="text-xs text-slate-700 font-normal">Fresh Pro Interfoods Co., Ltd.</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-normal">99/9 หมู่ 5 นิคมอุตสาหกรรมเกษตร บางบัวทอง จ.นนทบุรี 11110</p>
                      <p className="text-xs text-slate-400 font-normal">Tel: 02-999-8888 • Email: qa@freshprointerfoods.co.th</p>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="border border-slate-900 text-slate-900 text-xs font-bold px-3 py-1 uppercase tracking-wider inline-block rounded-md mb-1">
                      7-Eleven Retail Spec
                    </span>
                    <p className="text-xs font-bold text-slate-900">CERTIFICATE OF ANALYSIS (COA)</p>
                    <p className="text-xs font-mono font-medium text-slate-700">เลขที่: COA-{currentFgLot?.id}</p>
                    <p className="text-[11px] text-slate-600 font-normal">ฉบับปรับปรุง (Revision): Rev. 02 (04/11/2026)</p>
                    <p className="text-[11px] text-slate-600 font-normal">วันที่ออกเอกสาร: {currentFgLot?.releaseDate || currentFgLot?.date || '04/11/2026'}</p>
                  </div>
                </div>

                {/* General Info Grid - Strictly GHPs, HACCP, GAP (Uniform Typography, No Green Pill) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-300 text-xs">
                  <div className="space-y-2">
                    <p><span className="font-bold text-slate-900">ชื่อผลิตภัณฑ์:</span> <span className="font-normal text-slate-800">มะเขือเทศคละสี (Mixed Color Tomato)</span></p>
                    <p><span className="font-bold text-slate-900">น้ำหนักสุทธิ / บรรจุภัณฑ์:</span> <span className="font-normal text-slate-800">{currentFgLot?.netWeight} (กล่อง PET ใส Food Grade)</span></p>
                    <p><span className="font-bold text-slate-900">หมายเลขล็อตสินค้า (FG):</span> <span className="font-normal text-slate-800 font-mono">{currentFgLot?.id}</span></p>
                    <p><span className="font-bold text-slate-900">วันที่ผลิต (MFG):</span> <span className="font-normal text-slate-800">{currentFgLot?.date}</span></p>
                    <p><span className="font-bold text-slate-900">วันหมดอายุ (EXP):</span> <span className="font-normal text-slate-800">{currentFgLot?.expireDate}</span></p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-bold text-slate-900">ชื่อคู่ค้า / ลูกค้า:</span> <span className="font-normal text-slate-800">{currentFgLot?.customerName || 'บริษัท ซีพี ออลล์ จำกัด (มหาชน)'}</span></p>
                    <p><span className="font-bold text-slate-900">ศูนย์กระจายสินค้า (DC):</span> <span className="font-normal text-slate-800">{currentFgLot?.distributionCenter || currentFgLot?.store}</span></p>
                    <p><span className="font-bold text-slate-900">เลขที่ใบสั่งซื้อ (PO No.):</span> <span className="font-normal text-slate-800 font-mono">{currentFgLot?.poNumber || 'PO-7E-20261103-088'}</span></p>
                    <p><span className="font-bold text-slate-900">อายุการเก็บรักษา:</span> <span className="font-normal text-slate-800">{currentFgLot?.shelfLife} (อุณหภูมิควบคุม {currentFgLot?.temperature})</span></p>
                    <p><span className="font-bold text-slate-900">มาตรฐานรับรอง:</span> <span className="font-normal text-slate-800">GHPs, HACCP, GAP</span></p>
                  </div>
                </div>

                {/* Raw Material Origins (Selected 3-5 lots) */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                      <span>แหล่งที่มาวัตถุดิบและผลตรวจ Lab (Raw Material Traceability & Lab Test)</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        ({selectedRmForCoa.length} Lot จากเกณฑ์ 3-5 Lot)
                      </span>
                    </h3>
                    <button 
                      type="button"
                      onClick={() => setIsRmSelectorModalOpen(true)} 
                      className="text-slate-700 hover:text-slate-900 hover:underline text-[11px] font-bold print:hidden cursor-pointer"
                    >
                      + เปลี่ยนล็อตวัตถุดิบ
                    </button>
                  </div>
                  <div className="border border-slate-300 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                          <th className="py-2.5 px-3 border-b border-r border-slate-300">Raw Material Lot</th>
                          <th className="py-2.5 px-3 border-b border-r border-slate-300">วันที่รับเข้า</th>
                          <th className="py-2.5 px-3 border-b border-r border-slate-300">ความหวาน (Brix)</th>
                          <th className="py-2.5 px-3 border-b border-r border-slate-300">สีมะเขือเทศ</th>
                          <th className="py-2.5 px-2.5 border-b border-r border-slate-300 text-center">Organophosphate & Carbamate</th>
                          <th className="py-2.5 px-2.5 border-b border-slate-300 text-center">Organochlorine & Pyrethroid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {rawMaterialLots
                          .filter(rm => selectedRmForCoa.includes(rm.id))
                          .map((rm) => {
                            const opStatus = rm.organophosphate || rm.pesticideStatus;
                            const ocStatus = rm.organochlorine || rm.pesticideStatus;
                            return (
                              <tr key={`rm-table-${rm.id}`}>
                                <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">{rm.id}</td>
                                <td className="py-2 px-3 border-r border-slate-200 text-slate-800 font-normal">{rm.receiveDate}</td>
                                <td className="py-2 px-3 border-r border-slate-200 text-slate-800 font-normal">{rm.brix} °Bx</td>
                                <td className="py-2 px-3 border-r border-slate-200 text-slate-800 font-normal">{rm.color}</td>
                                <td className="py-2 px-2.5 border-r border-slate-200 text-center">
                                  <span className="font-semibold text-black">
                                    {opStatus === 'Passed' ? 'Passed' : opStatus === 'Failed' ? 'Failed' : '-'}
                                  </span>
                                </td>
                                <td className="py-2 px-2.5 text-center">
                                  <span className="font-semibold text-black">
                                    {ocStatus === 'Passed' ? 'Passed' : ocStatus === 'Failed' ? 'Failed' : '-'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  {!isCoaValid && (
                    <p className="text-[11px] font-bold text-red-600 mt-1.5 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 inline text-red-500" />
                      <span>* ข้อกำหนด: ต้องลงข้อมูลวัตถุดิบ 3 ถึง 5 Lot เท่านั้น จึงจะสามารถออกเอกสาร COA ได้</span>
                    </p>
                  )}
                </div>

                {/* Finish Good Physical Inspection */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                    <span>ผลการตรวจสินค้า Finish good (สำเร็จรูป) ด้านกายภาพและบรรจุภัณฑ์</span>
                  </h3>
                  <div className="border border-slate-300 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-3 border-b border-r border-slate-300 w-[30%]">หัวข้อตรวจสอบด้านกายภาพ</th>
                          <th className="py-2.5 px-3 border-b border-r border-slate-300 w-[50%]">เกณฑ์กำหนด 7-Eleven</th>
                          <th className="py-2.5 px-3 border-b border-slate-300 text-center w-[20%]">ผลการตรวจสอบ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {Object.entries(currentFgLot?.fgChecks || {}).map(([key, check], idx) => (
                          <tr key={key}>
                            <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                              <span className="text-slate-600 font-bold mr-1">{idx + 1}.</span> {check.name}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 text-slate-800 font-normal leading-tight">{check.spec}</td>
                            <td className="py-2 px-3 text-center">
                              <span className="font-semibold text-black">
                                {check.result === 'Passed' ? 'Passed' : check.result === 'Failed' ? 'Failed' : '-'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Overall Conclusion - Updated to exact phrase without lot prefix */}
                <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 text-xs">
                  <p className="font-bold uppercase tracking-wider text-slate-900 mb-1">สรุปผลการตรวจสอบ COA (Conclusion):</p>
                  <p className="font-normal text-slate-800 leading-relaxed">
                    {isPassed 
                      ? `ผ่านการตรวจสอบครบถ้วนตามข้อกำหนดมาตรฐาน พร้อมส่งจำหน่าย (Approved for Distribution)`
                      : isPending
                      ? `อยู่ระหว่างการตรวจสอบ ยังมีรายการรอผลตรวจ ไม่อนุมัติปล่อยสินค้า (Pending Inspection / On Hold)`
                      : `ไม่ผ่านการตรวจสอบตามข้อกำหนดมาตรฐาน ไม่อนุมัติปล่อยสินค้า (Rejected / Hold)`}
                  </p>
                </div>

                {/* Bottom Section: Signatures on Left + Official QR Traceability on Bottom-Right */}
                <div className="pt-6 border-t-2 border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                  
                  {/* Left: 3 Signatures */}
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
                    <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                      <div className="border-b border-dashed border-slate-400 pb-5">
                        <p className="font-serif italic text-slate-700 font-bold text-sm">Pimjai Lab</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">({currentFgLot?.qaLabInspector})</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">1. ผู้บันทึกข้อมูล QC Lab</p>
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                      <div className="border-b border-dashed border-slate-400 pb-5">
                        <p className="font-serif italic text-slate-700 font-bold text-sm">Somchai FG</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">({currentFgLot?.qaFgInspector})</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">2. ผู้บันทึกข้อมูล QC Finish Good</p>
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                      <div className="border-b border-dashed border-slate-400 pb-5">
                        <p className="font-serif italic text-slate-700 font-bold text-sm">Dr. Prasit</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">({currentFgLot?.qaManager})</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">ผู้อนุมัติปล่อยสินค้า (QA Manager)</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: QR Traceability Block (ย้ายไปด้านล่างขวา เป็น QR code) */}
                  <div className="shrink-0 w-full sm:w-auto flex flex-col items-center justify-center p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-800 text-center shadow-xs">
                    <div className="flex items-center space-x-1.5 mb-2 text-emerald-900 font-black text-[11px] uppercase tracking-wider">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR Traceability</span>
                    </div>

                    {/* Styled High-Fidelity SVG QR Matrix */}
                    <div className="p-2 bg-white rounded-xl border border-slate-300 shadow-2xs">
                      <svg
                        className="w-24 h-24"
                        viewBox="0 0 100 100"
                        fill="currentColor"
                        shapeRendering="crispEdges"
                      >
                        {/* QR Top-Left Finder */}
                        <rect x="5" y="5" width="28" height="28" fill="#0f172a" rx="2" />
                        <rect x="9" y="9" width="20" height="20" fill="#ffffff" />
                        <rect x="13" y="13" width="12" height="12" fill="#0f172a" />
                        
                        {/* QR Top-Right Finder */}
                        <rect x="67" y="5" width="28" height="28" fill="#0f172a" rx="2" />
                        <rect x="71" y="9" width="20" height="20" fill="#ffffff" />
                        <rect x="75" y="13" width="12" height="12" fill="#0f172a" />

                        {/* QR Bottom-Left Finder */}
                        <rect x="5" y="67" width="28" height="28" fill="#0f172a" rx="2" />
                        <rect x="9" y="71" width="20" height="20" fill="#ffffff" />
                        <rect x="13" y="75" width="12" height="12" fill="#0f172a" />

                        {/* Dynamic Matrix Dots */}
                        <rect x="37" y="9" width="4" height="4" fill="#0f172a" />
                        <rect x="45" y="9" width="4" height="4" fill="#0f172a" />
                        <rect x="53" y="9" width="4" height="4" fill="#0f172a" />
                        <rect x="41" y="17" width="4" height="4" fill="#0f172a" />
                        <rect x="49" y="17" width="4" height="4" fill="#0f172a" />
                        <rect x="57" y="17" width="4" height="4" fill="#0f172a" />
                        <rect x="37" y="25" width="4" height="4" fill="#0f172a" />
                        <rect x="45" y="25" width="4" height="4" fill="#0f172a" />
                        
                        {/* Center Timing & Pattern */}
                        <rect x="9" y="37" width="4" height="4" fill="#0f172a" />
                        <rect x="17" y="37" width="4" height="4" fill="#0f172a" />
                        <rect x="25" y="37" width="4" height="4" fill="#0f172a" />
                        <rect x="37" y="37" width="8" height="8" fill="#065f46" rx="1" />
                        <rect x="49" y="37" width="4" height="4" fill="#0f172a" />
                        <rect x="57" y="37" width="4" height="4" fill="#0f172a" />
                        <rect x="69" y="37" width="4" height="4" fill="#0f172a" />
                        <rect x="77" y="37" width="4" height="4" fill="#0f172a" />
                        <rect x="85" y="37" width="4" height="4" fill="#0f172a" />

                        <rect x="9" y="45" width="4" height="4" fill="#0f172a" />
                        <rect x="21" y="45" width="4" height="4" fill="#0f172a" />
                        <rect x="37" y="49" width="4" height="4" fill="#0f172a" />
                        <rect x="45" y="49" width="8" height="8" fill="#047857" rx="1" />
                        <rect x="61" y="45" width="4" height="4" fill="#0f172a" />
                        <rect x="73" y="45" width="4" height="4" fill="#0f172a" />
                        <rect x="85" y="45" width="4" height="4" fill="#0f172a" />

                        <rect x="13" y="53" width="4" height="4" fill="#0f172a" />
                        <rect x="25" y="53" width="4" height="4" fill="#0f172a" />
                        <rect x="37" y="61" width="4" height="4" fill="#0f172a" />
                        <rect x="49" y="61" width="4" height="4" fill="#0f172a" />
                        <rect x="57" y="61" width="4" height="4" fill="#0f172a" />
                        <rect x="69" y="53" width="4" height="4" fill="#0f172a" />
                        <rect x="81" y="53" width="4" height="4" fill="#0f172a" />

                        {/* Bottom Right Area */}
                        <rect x="37" y="69" width="4" height="4" fill="#0f172a" />
                        <rect x="45" y="69" width="4" height="4" fill="#0f172a" />
                        <rect x="53" y="69" width="4" height="4" fill="#0f172a" />
                        <rect x="69" y="69" width="4" height="4" fill="#0f172a" />
                        <rect x="77" y="69" width="4" height="4" fill="#0f172a" />
                        <rect x="85" y="69" width="4" height="4" fill="#0f172a" />
                        
                        <rect x="41" y="77" width="4" height="4" fill="#0f172a" />
                        <rect x="49" y="77" width="4" height="4" fill="#0f172a" />
                        <rect x="61" y="77" width="4" height="4" fill="#0f172a" />
                        <rect x="73" y="77" width="4" height="4" fill="#0f172a" />
                        <rect x="81" y="77" width="4" height="4" fill="#0f172a" />

                        <rect x="37" y="85" width="4" height="4" fill="#0f172a" />
                        <rect x="53" y="85" width="4" height="4" fill="#0f172a" />
                        <rect x="65" y="85" width="4" height="4" fill="#0f172a" />
                        <rect x="77" y="85" width="4" height="4" fill="#0f172a" />
                        <rect x="85" y="85" width="4" height="4" fill="#0f172a" />
                      </svg>
                    </div>

                    <p className="font-mono font-black text-[11px] text-slate-800 mt-2 bg-white px-2 py-0.5 rounded border border-slate-300">
                      TR-711-{currentFgLot?.id}
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium mt-1 max-w-[130px] leading-tight">
                      สแกนตรวจสอบย้อนกลับ CP ALL 7-Eleven
                    </p>
                  </div>

                </div>

              </div>
            </div>
          );
        })()}

      </main>

      <footer className="bg-white border-t border-slate-200 py-4 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          COA Pro System (7-Eleven Retail Spec) • รองรับมาตรฐานการตรวจสอบย้อนกลับและสเปกส่งมอบ CP ALL
        </div>
      </footer>
    </div>
  );
}
