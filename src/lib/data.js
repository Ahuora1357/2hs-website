/* ============================================================
   Seed dataset — realistic Persian accounting records.
   Shapes here mirror the future API/DB models so the app can be
   wired to a real backend later without touching the UI.
   ============================================================ */

import { shiftDays, todayISO } from './date.js';

export const BUSINESS_TYPES = [
  'شرکت بازرگانی',
  'تولیدی و صنعتی',
  'خدمات و مشاوره',
  'فروشگاهی',
  'پیمانکاری',
  'فناوری اطلاعات',
  'سایر',
];

export const EXPENSE_CATEGORIES = [
  'اجاره',
  'حقوق و دستمزد',
  'آب و برق و گاز',
  'اینترنت و تلفن',
  'ملزومات اداری',
  'تبلیغات و بازاریابی',
  'حمل و نقل',
  'تعمیر و نگهداری',
  'مالیات و عوارض',
  'سایر',
];

export const PRODUCT_CATEGORIES = ['خدمات', 'کالا', 'اشتراک', 'آموزش'];

export const PRODUCT_UNITS = ['عدد', 'ساعت', 'ماه', 'سال', 'بسته', 'دستگاه', 'سرویس'];

export const ROLES = [
  { id: 'owner', label: 'مدیر اصلی', hint: 'دسترسی کامل به همه بخش‌ها' },
  { id: 'accountant', label: 'حسابدار', hint: 'فاکتور، هزینه، دریافت و گزارش' },
  { id: 'sales_manager', label: 'مدیر فروش', hint: 'فاکتور، مشتریان و گزارش فروش' },
  { id: 'salesperson', label: 'فروشنده', hint: 'صدور فاکتور و ثبت مشتری' },
  { id: 'viewer', label: 'مشاهده‌گر', hint: 'فقط مشاهده داشبورد و گزارش‌ها' },
];

export const PERMISSIONS = [
  { id: 'dashboard.view', label: 'مشاهده داشبورد' },
  { id: 'invoice.create', label: 'ایجاد فاکتور' },
  { id: 'invoice.edit', label: 'ویرایش فاکتور' },
  { id: 'invoice.delete', label: 'حذف فاکتور' },
  { id: 'reports.view', label: 'مشاهده گزارش‌ها' },
  { id: 'customer.manage', label: 'مدیریت مشتریان' },
  { id: 'product.manage', label: 'مدیریت کالا و خدمات' },
  { id: 'expense.manage', label: 'مدیریت هزینه‌ها' },
  { id: 'user.manage', label: 'مدیریت کاربران' },
  { id: 'settings.manage', label: 'دسترسی به تنظیمات' },
];

export const ROLE_PERMISSIONS = {
  owner: PERMISSIONS.map((p) => p.id),
  accountant: [
    'dashboard.view', 'invoice.create', 'invoice.edit', 'reports.view',
    'customer.manage', 'product.manage', 'expense.manage',
  ],
  sales_manager: ['dashboard.view', 'invoice.create', 'invoice.edit', 'reports.view', 'customer.manage'],
  salesperson: ['dashboard.view', 'invoice.create', 'customer.manage'],
  viewer: ['dashboard.view', 'reports.view'],
};

const DAY = 1;

function buildCustomers() {
  return [
    { id: 'cus_1', name: 'شرکت فولاد سپاهان', type: 'حقوقی', contact: 'مهندس احمدی', phone: '031-36660120', email: 'info@foladsepahan.ir', nationalId: '۱۰۲۶۰۰۴۵۶۷۸', city: 'اصفهان', address: 'شهرک صنعتی مورچه‌خورت، خیابان ۱۲، پلاک ۴۵', creditLimit: 500000000, paymentTerms: 30, notes: 'مشتری کلیدی — تسویه ماهانه', createdAt: shiftDays(todayISO(), -420 * DAY) },
    { id: 'cus_2', name: 'مهندس علیرضا رحیمی', type: 'حقیقی', contact: '', phone: '0913-2245678', email: 'a.rahimi@gmail.com', nationalId: '۱۲۸۵۶۷۸۹۰۱', city: 'اصفهان', address: 'خیابان چهارباغ بالا، کوچه ۱۴', creditLimit: 80000000, paymentTerms: 15, notes: 'پروژه‌های مشاوره', createdAt: shiftDays(todayISO(), -380 * DAY) },
    { id: 'cus_3', name: 'شرکت پتروشیمی اصفهان', type: 'حقوقی', contact: 'خانم صادقی', phone: '031-34567890', email: 'finance@petroisfahan.ir', nationalId: '۱۰۲۶۰۱۲۳۴۵۶', city: 'اصفهان', address: 'بلوار کشاورز، برج پترو، طبقه ۹', creditLimit: 1200000000, paymentTerms: 45, notes: 'قرارداد سالانه پشتیبانی', createdAt: shiftDays(todayISO(), -350 * DAY) },
    { id: 'cus_4', name: 'فروشگاه زنجیره‌ای آفتاب', type: 'حقوقی', contact: 'آقای نیکوکار', phone: '031-32223344', email: 'accounts@aftab-store.ir', nationalId: '۱۰۲۶۰۲۳۴۵۶۷', city: 'اصفهان', address: 'خیابان امام خمینی، ساختمان آفتاب', creditLimit: 250000000, paymentTerms: 30, notes: '', createdAt: shiftDays(todayISO(), -300 * DAY) },
    { id: 'cus_5', name: 'خانم سارا محمدی', type: 'حقیقی', contact: '', phone: '0912-8877665', email: 'sara.m@outlook.com', nationalId: '۱۲۷۹۸۷۶۵۴۳', city: 'تهران', address: 'سعادت‌آباد، بلوار دریا', creditLimit: 40000000, paymentTerms: 7, notes: 'مشتری خرده', createdAt: shiftDays(todayISO(), -240 * DAY) },
    { id: 'cus_6', name: 'شرکت ساختمانی بنای نو', type: 'حقوقی', contact: 'مهندس توکلی', phone: '031-37778899', email: 'info@banayenow.ir', nationalId: '۱۰۲۶۰۳۴۵۶۷۸', city: 'اصفهان', address: 'خیابان نظر شرقی، پلاک ۲۲۰', creditLimit: 600000000, paymentTerms: 60, notes: 'پرداخت‌ها با تأخیر', createdAt: shiftDays(todayISO(), -200 * DAY) },
    { id: 'cus_7', name: 'کلینیک تخصصی مهر', type: 'حقوقی', contact: 'دکتر فاطمی', phone: '031-36601234', email: 'clinic.mehr@gmail.com', nationalId: '۱۰۲۶۰۴۵۶۷۸۹', city: 'اصفهان', address: 'خیابان توحید، ساختمان پزشکان مهر', creditLimit: 150000000, paymentTerms: 20, notes: '', createdAt: shiftDays(todayISO(), -160 * DAY) },
    { id: 'cus_8', name: 'آقای محمد کریمی', type: 'حقیقی', contact: '', phone: '0913-5566778', email: 'm.karimi@yahoo.com', nationalId: '۱۲۸۵۱۱۲۲۳۳', city: 'شهرضا', address: 'بلوار دانشگاه، کوچه شهید کاظمی', creditLimit: 30000000, paymentTerms: 10, notes: '', createdAt: shiftDays(todayISO(), -120 * DAY) },
    { id: 'cus_9', name: 'شرکت حمل و نقل ره‌گستر', type: 'حقوقی', contact: 'آقای بهرامی', phone: '031-34445566', email: 'ops@rahgostar.ir', nationalId: '۱۰۲۶۰۵۶۷۸۹۰', city: 'اصفهان', address: 'جاده مبارکه، شهرک حمل و نقل', creditLimit: 200000000, paymentTerms: 30, notes: '', createdAt: shiftDays(todayISO(), -90 * DAY) },
    { id: 'cus_10', name: 'آموزشگاه زبان پارسیان', type: 'حقوقی', contact: 'خانم رضایی', phone: '031-39998877', email: 'info@parsianlang.ir', nationalId: '۱۰۲۶۰۶۷۸۹۰۱', city: 'اصفهان', address: 'خیابان سعادت‌آباد، پلاک ۱۸', creditLimit: 60000000, paymentTerms: 15, notes: '', createdAt: shiftDays(todayISO(), -45 * DAY) },
  ];
}

function buildProducts() {
  return [
    { id: 'prd_1', name: 'مشاوره مالی و حسابداری', sku: 'SRV-1001', category: 'خدمات', unit: 'ساعت', purchasePrice: 450000, salePrice: 1200000, taxRate: 9, stock: null, minStock: null, description: 'ارائه مشاوره تخصصی مالی به‌صورت ساعتی', active: true },
    { id: 'prd_2', name: 'طراحی و پیاده‌سازی سیستم حسابداری', sku: 'SRV-1002', category: 'خدمات', unit: 'سرویس', purchasePrice: 35000000, salePrice: 85000000, taxRate: 9, stock: null, minStock: null, description: 'استقرار کامل سیستم حسابداری سازمانی', active: true },
    { id: 'prd_3', name: 'پشتیبانی نرم‌افزار (ماهانه)', sku: 'SRV-1003', category: 'اشتراک', unit: 'ماه', purchasePrice: 2000000, salePrice: 6500000, taxRate: 9, stock: null, minStock: null, description: 'پشتیبانی فنی و بروزرسانی ماهانه', active: true },
    { id: 'prd_4', name: 'آموزش نرم‌افزار حسابداری', sku: 'SRV-1004', category: 'آموزش', unit: 'ساعت', purchasePrice: 600000, salePrice: 1800000, taxRate: 9, stock: null, minStock: null, description: 'دوره آموزشی کاربران و حسابداران', active: true },
    { id: 'prd_5', name: 'کاغذ A4 (بسته ۵۰۰ برگ)', sku: 'GD-2001', category: 'کالا', unit: 'بسته', purchasePrice: 320000, salePrice: 480000, taxRate: 9, stock: 86, minStock: 20, description: 'کاغذ اداری تحریر ۸۰ گرمی', active: true },
    { id: 'prd_6', name: 'کارتریج چاپگر لیزری', sku: 'GD-2002', category: 'کالا', unit: 'عدد', purchasePrice: 1850000, salePrice: 2650000, taxRate: 9, stock: 12, minStock: 15, description: 'کارتریج اورجینال سازگار با چاپگرهای اداری', active: true },
    { id: 'prd_7', name: 'لایسنس نرم‌افزار 2HS (سالانه)', sku: 'SRV-1005', category: 'اشتراک', unit: 'سال', purchasePrice: 12000000, salePrice: 29000000, taxRate: 9, stock: null, minStock: null, description: 'لایسنس سالانه نسخه حرفه‌ای', active: true },
    { id: 'prd_8', name: 'سرور ابری (ماهانه)', sku: 'SRV-1006', category: 'اشتراک', unit: 'ماه', purchasePrice: 3200000, salePrice: 5400000, taxRate: 9, stock: null, minStock: null, description: 'میزبانی ابری امن با پشتیبان‌گیری روزانه', active: true },
    { id: 'prd_9', name: 'تنظیم و ارسال اظهارنامه مالیاتی', sku: 'SRV-1007', category: 'خدمات', unit: 'سرویس', purchasePrice: 4500000, salePrice: 11000000, taxRate: 9, stock: null, minStock: null, description: 'تهیه و ارسال اظهارنامه ارزش افزوده', active: true },
    { id: 'prd_10', name: 'حسابرسی داخلی', sku: 'SRV-1008', category: 'خدمات', unit: 'سرویس', purchasePrice: 15000000, salePrice: 38000000, taxRate: 9, stock: null, minStock: null, description: 'بررسی و تطبیق اسناد مالی', active: true },
    { id: 'prd_11', name: 'ماوس و کیبورد اداری', sku: 'GD-2003', category: 'کالا', unit: 'دستگاه', purchasePrice: 900000, salePrice: 1450000, taxRate: 9, stock: 4, minStock: 10, description: 'ست اداری بی‌سیم', active: true },
    { id: 'prd_12', name: 'شارژ پشتیبانی فوری', sku: 'SRV-1009', category: 'خدمات', unit: 'سرویس', purchasePrice: 800000, salePrice: 2500000, taxRate: 9, stock: null, minStock: null, description: 'رفع مشکل خارج از ساعات کاری', active: false },
  ];
}

/* Compact line-item builder */
function item(productId, qty, unitPrice, discount = 0, taxRate = 9) {
  return { id: `it_${productId}_${qty}_${unitPrice}`, productId, qty, unitPrice, discount, taxRate };
}

function buildInvoices() {
  const today = todayISO();
  const mk = (n, customerId, issueOffset, dueOffset, status, items, shipping, notes, payments) => ({
    id: `inv_${n}`,
    number: `1405-${String(n).padStart(4, '0')}`,
    customerId,
    issueDate: shiftDays(today, issueOffset),
    dueDate: shiftDays(today, dueOffset),
    status,
    items,
    shipping: shipping || 0,
    notes: notes || '',
    terms: 'پرداخت حداکثر تا تاریخ سررسید فاکتور الزامی است.',
    payments: payments || [],
  });

  const pay = (offset, amount, method, reference = '') => ({
    id: `pay_${offset}_${amount}`,
    date: shiftDays(today, offset),
    amount,
    method,
    reference,
    notes: '',
  });

  return [
    // ---- 5 months ago ----
    mk(1, 'cus_1', -152, -122, 'sent', [item('prd_3', 6, 6500000), item('prd_8', 6, 5400000)], 0, 'قرارداد پشتیبانی نیم‌سال اول', [pay(-120, 71400000, 'انتقال بانکی', 'TRX-88213')]),
    mk(2, 'cus_4', -148, -118, 'sent', [item('prd_1', 24, 1200000, 2000000), item('prd_4', 12, 1800000)], 500000, '', [pay(-115, 45000000, 'چک', 'CHK-4412')]),
    mk(3, 'cus_3', -140, -95, 'sent', [item('prd_2', 1, 85000000, 5000000), item('prd_10', 1, 38000000)], 0, 'فاز اول استقرار', [pay(-90, 118000000, 'انتقال بانکی', 'TRX-90114')]),
    // ---- 4 months ago ----
    mk(4, 'cus_2', -118, -103, 'sent', [item('prd_1', 18, 1200000), item('prd_9', 1, 11000000)], 0, '', [pay(-100, 35000000, 'کارت‌خوان')]),
    mk(5, 'cus_6', -110, -50, 'sent', [item('prd_10', 2, 38000000, 6000000), item('prd_1', 30, 1200000)], 0, 'پروژه حسابرسی پروژه مسکونی', [pay(-45, 45000000, 'انتقال بانکی', 'TRX-93320')]),
    mk(6, 'cus_5', -104, -97, 'sent', [item('prd_5', 8, 480000, 0), item('prd_6', 2, 2650000)], 250000, '', [pay(-97, 7000000, 'نقدی')]),
    // ---- 3 months ago ----
    mk(7, 'cus_7', -92, -72, 'sent', [item('prd_3', 3, 6500000), item('prd_4', 6, 1800000)], 0, '', [pay(-70, 30200000, 'انتقال بانکی', 'TRX-95410')]),
    mk(8, 'cus_1', -86, -56, 'sent', [item('prd_7', 2, 29000000, 4000000), item('prd_8', 3, 5400000)], 0, 'تمدید لایسنس سالانه', [pay(-52, 70000000, 'انتقال بانکی', 'TRX-96112')]),
    mk(9, 'cus_8', -80, -70, 'sent', [item('prd_1', 6, 1200000), item('prd_12', 1, 2500000)], 0, '', [pay(-68, 9500000, 'کارت‌خوان')]),
    // ---- 2 months ago ----
    mk(10, 'cus_3', -63, -18, 'sent', [item('prd_3', 2, 6500000), item('prd_9', 2, 11000000), item('prd_8', 2, 5400000)], 0, 'اظهارنامه فصل تابستان', []),
    mk(11, 'cus_4', -58, -28, 'sent', [item('prd_6', 6, 2650000, 900000), item('prd_11', 4, 1450000)], 400000, '', [pay(-30, 20000000, 'چک', 'CHK-4477')]),
    mk(12, 'cus_10', -52, -37, 'sent', [item('prd_4', 24, 1800000), item('prd_1', 4, 1200000)], 0, '', [pay(-35, 52000000, 'انتقال بانکی', 'TRX-98841')]),
    // ---- 1 month ago ----
    mk(13, 'cus_9', -34, -4, 'sent', [item('prd_1', 12, 1200000), item('prd_3', 1, 6500000)], 300000, '', []),
    mk(14, 'cus_6', -27, 33, 'sent', [item('prd_2', 1, 85000000, 10000000), item('prd_8', 3, 5400000)], 0, 'فاز دوم استقرار', [pay(-14, 40000000, 'انتقال بانکی', 'TRX-99201')]),
    mk(15, 'cus_2', -20, -5, 'draft', [item('prd_10', 1, 38000000), item('prd_9', 1, 11000000)], 0, 'پیش‌نویس — در انتظار تأیید مشتری', []),
    // ---- this month ----
    mk(16, 'cus_1', -12, 18, 'sent', [item('prd_3', 1, 6500000), item('prd_8', 1, 5400000), item('prd_1', 8, 1200000)], 0, '', []),
    mk(17, 'cus_5', -7, 8, 'sent', [item('prd_7', 1, 29000000)], 0, '', [pay(-3, 10000000, 'درگاه اینترنتی', 'ONL-7731')]),
    mk(18, 'cus_4', -4, 26, 'sent', [item('prd_5', 20, 480000, 500000), item('prd_6', 4, 2650000)], 200000, '', []),
    mk(19, 'cus_7', -2, 28, 'sent', [item('prd_12', 2, 2500000)], 0, '', []),
    mk(20, 'cus_8', -1, 14, 'cancelled', [item('prd_1', 3, 1200000)], 0, 'به درخواست مشتری لغو شد', []),
  ];
}

function buildExpenses() {
  const today = todayISO();
  const mk = (n, title, category, amount, offset, method, supplier, status = 'paid') => ({
    id: `exp_${n}`,
    title,
    category,
    amount,
    date: shiftDays(today, offset),
    method,
    supplier,
    description: '',
    status,
  });
  return [
    mk(1, 'اجاره دفتر مرکزی — ماه جاری', 'اجاره', 42000000, -12, 'انتقال بانکی', 'مالک ساختمان', 'paid'),
    mk(2, 'حقوق و دستمزد تیم مالی', 'حقوق و دستمزد', 185000000, -10, 'انتقال بانکی', 'پرسنل', 'paid'),
    mk(3, 'قبض برق دفتر', 'آب و برق و گاز', 6800000, -9, 'درگاه اینترنتی', 'شرکت توزیع برق', 'paid'),
    mk(4, 'اینترنت اختصاصی', 'اینترنت و تلفن', 4200000, -8, 'درگاه اینترنتی', 'شرکت مخابرات', 'paid'),
    mk(5, 'خرید ملزومات اداری', 'ملزومات اداری', 3500000, -6, 'کارت‌خوان', 'فروشگاه لوازم اداری', 'paid'),
    mk(6, 'تبلیغات در شبکه‌های اجتماعی', 'تبلیغات و بازاریابی', 12500000, -5, 'درگاه اینترنتی', 'آژانس دیجیتال مارکتینگ', 'paid'),
    mk(7, 'هزینه حمل محصولات', 'حمل و نقل', 2900000, -4, 'نقدی', 'باربری ره‌گستر', 'paid'),
    mk(8, 'سرویس و نگهداری سرور', 'تعمیر و نگهداری', 9500000, -3, 'انتقال بانکی', 'شرکت فناوری پارس', 'paid'),
    mk(9, 'پیش‌پرداخت اجاره سه‌ماهه', 'اجاره', 84000000, -2, 'چک', 'مالک ساختمان', 'pending'),
    mk(10, 'مالیات بر ارزش افزوده فصل گذشته', 'مالیات و عوارض', 24500000, -1, 'انتقال بانکی', 'سازمان امور مالیاتی', 'paid'),
  ];
}

/** Payments made to suppliers / service providers. */
function buildPayments() {
  const today = todayISO();
  const mk = (n, supplier, amount, offset, method, accountId, reference) => ({
    id: `pmt_${n}`,
    supplier,
    amount,
    date: shiftDays(today, offset),
    accountId,
    method,
    reference,
    notes: '',
  });
  return [
    mk(1, 'مالک ساختمان', 42000000, -12, 'انتقال بانکی', 'acc_2', 'TRX-70110'),
    mk(2, 'پرسنل', 185000000, -10, 'انتقال بانکی', 'acc_2', 'PAY-2291'),
    mk(3, 'شرکت توزیع برق', 6800000, -9, 'درگاه اینترنتی', 'acc_2', 'ONL-55120'),
    mk(4, 'شرکت فناوری پارس', 9500000, -3, 'انتقال بانکی', 'acc_3', 'TRX-71881'),
    mk(5, 'باربری ره‌گستر', 2900000, -4, 'نقدی', 'acc_1', ''),
    mk(6, 'سازمان امور مالیاتی', 24500000, -1, 'انتقال بانکی', 'acc_2', 'TAX-1405-3'),
  ];
}

function buildAccounts() {
  return [
    { id: 'acc_1', name: 'صندوق مرکزی', type: 'cash', bank: '', number: '', balance: 42500000 },
    { id: 'acc_2', name: 'جاری بانک ملت', type: 'bank', bank: 'بانک ملت', number: '5412-8870-1122', balance: 186400000 },
    { id: 'acc_3', name: 'سپرده بانک سامان', type: 'bank', bank: 'بانک سامان', number: '8801-2245-6670', balance: 312000000 },
  ];
}

function buildTransactions() {
  const today = todayISO();
  const mk = (n, accountId, type, amount, offset, description, category = '') => ({
    id: `trx_${n}`,
    accountId,
    type,
    amount,
    date: shiftDays(today, offset),
    description,
    category,
    counterpartAccountId: null,
  });
  return [
    mk(1, 'acc_2', 'in', 118000000, -90, 'دریافت از پتروشیمی اصفهان', 'فروش'),
    mk(2, 'acc_3', 'in', 70000000, -52, 'دریافت از فولاد سپاهان', 'فروش'),
    mk(3, 'acc_2', 'out', 42000000, -12, 'اجاره دفتر مرکزی', 'اجاره'),
    mk(4, 'acc_2', 'out', 185000000, -10, 'پرداخت حقوق و دستمزد', 'حقوق'),
    mk(5, 'acc_1', 'out', 2900000, -4, 'هزینه حمل محصولات', 'حمل و نقل'),
    mk(6, 'acc_3', 'in', 52000000, -35, 'دریافت از آموزشگاه پارسیان', 'فروش'),
    mk(7, 'acc_2', 'out', 24500000, -1, 'پرداخت مالیات بر ارزش افزوده', 'مالیات'),
    mk(8, 'acc_1', 'in', 7000000, -97, 'دریافت نقدی از خانم محمدی', 'فروش'),
  ];
}

function buildUsers() {
  const today = todayISO();
  return [
    { id: 'usr_1', name: 'مدیر سیستم', email: 'admin@2hs.ir', role: 'owner', status: 'active', lastActive: todayISO() },
    { id: 'usr_2', name: 'مریم شریفی', email: 'm.sharifi@2hs.ir', role: 'accountant', status: 'active', lastActive: shiftDays(today, -1) },
    { id: 'usr_3', name: 'حسین نوری', email: 'h.nouri@2hs.ir', role: 'sales_manager', status: 'active', lastActive: shiftDays(today, -2) },
    { id: 'usr_4', name: 'زهرا اکبری', email: 'z.akbari@2hs.ir', role: 'salesperson', status: 'active', lastActive: shiftDays(today, -3) },
    { id: 'usr_5', name: 'بازرس مالی', email: 'audit@2hs.ir', role: 'viewer', status: 'invited', lastActive: null },
  ];
}

function buildNotifications() {
  return [
    { id: 'ntf_1', type: 'danger', title: 'فاکتور ۱۴۰۵-۰۰۱۳ سررسید شده است', body: 'مبلغ ۲۲,۸۵۰,۰۰۰ تومان از شرکت حمل و نقل ره‌گستر پرداخت نشده باقی مانده است.', dateOffset: 0, read: false },
    { id: 'ntf_2', type: 'warning', title: 'موجودی کالا رو به اتمام است', body: 'موجودی «کارتریج چاپگر لیزری» به ۱۲ عدد رسیده که کمتر از حد هشدار است.', dateOffset: -1, read: false },
    { id: 'ntf_3', type: 'info', title: 'یادآوری سررسید فاکتور ۱۴۰۵-۰۰۱۰', body: 'فاکتور شرکت پتروشیمی اصفهان امروز سررسید می‌شود.', dateOffset: -2, read: false },
    { id: 'ntf_4', type: 'success', title: 'دریافت جدید ثبت شد', body: 'مبلغ ۱۰,۰۰۰,۰۰۰ تومان از خانم سارا محمدی از طریق درگاه اینترنتی دریافت شد.', dateOffset: -3, read: true },
  ];
}

/** Default settings for a fresh business profile. */
export function defaultSettings() {
  return {
    businessName: 'شرکت هسین حاسب سپاهان',
    businessType: 'فناوری اطلاعات',
    logoText: '2HS',
    nationalId: '۱۰۲۶۰۹۸۷۶۵۴',
    taxNumber: '۴۱۱۲۳۴۵۶۷۸',
    phone: '031-36661122',
    email: 'info@2hs.ir',
    website: 'www.2hs.ir',
    address: 'اصفهان، خیابان چهارباغ بالا، برج فناوری، طبقه ۷',
    currency: 'تومان',
    calendar: 'شمسی',
    fiscalYearStart: 'فروردین',
    defaultTaxRate: 9,
    invoicePrefix: '1405-',
    nextInvoiceNumber: 21,
    invoiceFooter: 'از اعتماد شما سپاسگزاریم — 2HS، همراه مالی کسب‌وکار شما',
    paymentTerms: 30,
    notifications: { overdue: true, lowStock: true, payments: true, weekly: false },
    paymentMethods: ['نقدی', 'کارت‌خوان', 'انتقال بانکی', 'چک', 'درگاه اینترنتی'],
    onboardingDone: true,
  };
}

/** Full dataset used to seed an empty store. */
export function createSeed() {
  return {
    settings: defaultSettings(),
    customers: buildCustomers(),
    products: buildProducts(),
    invoices: buildInvoices(),
    expenses: buildExpenses(),
    payments: buildPayments(),
    accounts: buildAccounts(),
    transactions: buildTransactions(),
    users: buildUsers(),
    notifications: buildNotifications().map((n) => ({
      ...n,
      id: n.id,
      date: shiftDays(todayISO(), n.dateOffset),
    })),
  };
}
