import { useMemo, useState } from 'react';
import {
  Plus, Landmark, Wallet, ArrowLeftRight, Trash2, Pencil, Building2, Banknote,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { PageHeader, Card, CardHead, CardBody } from '../../components/ui/Card.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import Modal, { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { Select, TextField } from '../../components/ui/Form.jsx';
import JalaliDateInput from '../../components/ui/JalaliDateInput.jsx';
import { EmptyState } from '../../components/ui/Misc.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { formatNumber } from '../../lib/format.js';
import { formatJalali, todayISO } from '../../lib/date.js';

const EMPTY_TXN = { accountId: '', type: 'in', amount: '', date: todayISO(), description: '', category: '' };
const EMPTY_TRANSFER = { accountId: '', counterpartAccountId: '', amount: '', date: todayISO(), description: '' };

export default function BankAccounts() {
  const toast = useToast();
  const { settings } = useSettings();
  const {
    accounts, transactions, accountById,
    addAccount, updateAccount, deleteAccount, addTransaction, reverseTransaction,
  } = useData();

  const [accountModal, setAccountModal] = useState(null);
  const [accountForm, setAccountForm] = useState({ name: '', type: 'bank', bank: '', number: '', balance: '' });
  const [txnOpen, setTxnOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [txnForm, setTxnForm] = useState(EMPTY_TXN);
  const [transferForm, setTransferForm] = useState(EMPTY_TRANSFER);
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(null);

  const total = useMemo(() => accounts.reduce((s, a) => s + (a.balance || 0), 0), [accounts]);

  const openNewAccount = () => {
    setAccountModal('new');
    setAccountForm({ name: '', type: 'bank', bank: '', number: '', balance: '' });
  };
  const openEditAccount = (a) => {
    setAccountModal(a.id);
    setAccountForm({ name: a.name, type: a.type, bank: a.bank || '', number: a.number || '', balance: a.balance });
  };

  const saveAccount = () => {
    if (!accountForm.name.trim()) {
      toast.error('نام حساب را وارد کنید.');
      return;
    }
    const payload = { ...accountForm, balance: Number(accountForm.balance) || 0 };
    if (accountModal === 'new') {
      addAccount(payload);
      toast.success('حساب جدید ایجاد شد.', { title: 'ثبت شد' });
    } else {
      updateAccount(accountModal, payload);
      toast.success('اطلاعات حساب به‌روزرسانی شد.');
    }
    setAccountModal(null);
  };

  const submitTxn = (e) => {
    e.preventDefault();
    const next = {};
    if (!txnForm.accountId) next.accountId = 'حساب را انتخاب کنید.';
    if (!Number(txnForm.amount) || Number(txnForm.amount) <= 0) next.amount = 'مبلغ باید بزرگ‌تر از صفر باشد.';
    if (!txnForm.description.trim()) next.description = 'شرح تراکنش الزامی است.';
    setErrors(next);
    if (Object.keys(next).length) return;

    addTransaction({
      accountId: txnForm.accountId,
      type: txnForm.type,
      amount: Number(txnForm.amount),
      date: txnForm.date,
      description: txnForm.description,
      category: txnForm.category,
    });
    setTxnOpen(false);
    toast.success('تراکنش ثبت و موجودی حساب به‌روزرسانی شد.', { title: 'ثبت شد' });
  };

  const submitTransfer = (e) => {
    e.preventDefault();
    const next = {};
    if (!transferForm.accountId) next.accountId = 'حساب مبدأ را انتخاب کنید.';
    if (!transferForm.counterpartAccountId) next.counterpartAccountId = 'حساب مقصد را انتخاب کنید.';
    if (transferForm.accountId && transferForm.accountId === transferForm.counterpartAccountId) {
      next.counterpartAccountId = 'حساب مقصد باید متفاوت باشد.';
    }
    if (!Number(transferForm.amount) || Number(transferForm.amount) <= 0) next.amount = 'مبلغ باید بزرگ‌تر از صفر باشد.';
    setErrors(next);
    if (Object.keys(next).length) return;

    addTransaction({
      accountId: transferForm.accountId,
      counterpartAccountId: transferForm.counterpartAccountId,
      type: 'transfer',
      amount: Number(transferForm.amount),
      date: transferForm.date,
      description: transferForm.description || 'انتقال بین حساب‌ها',
      category: 'انتقال',
    });
    setTransferOpen(false);
    toast.success('انتقال بین حساب‌ها انجام شد.', { title: 'انتقال موفق' });
  };

  const txnColumns = [
    { key: 'date', header: 'تاریخ', render: (r) => <span className="num">{formatJalali(r.date)}</span> },
    {
      key: 'account',
      header: 'حساب',
      render: (r) => accountById[r.accountId]?.name || '—',
    },
    { key: 'description', header: 'شرح', render: (r) => <span className="strong">{r.description}</span> },
    {
      key: 'type',
      header: 'نوع',
      render: (r) => (
        <Badge tone={r.type === 'in' ? 'success' : r.type === 'transfer' ? 'info' : 'danger'} dot>
          {r.type === 'in' ? 'ورودی' : r.type === 'transfer' ? 'انتقال' : 'خروجی'}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: `مبلغ (${settings.currency})`,
      align: 'end',
      render: (r) => (
        <span className="num strong" style={{ color: r.type === 'in' ? 'var(--success-strong)' : r.type === 'transfer' ? 'var(--brand)' : 'var(--danger)' }}>
          {r.type === 'out' ? '−' : ''}{formatNumber(r.amount)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      align: 'center',
      width: 70,
      render: (r) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Trash2}
          aria-label="حذف تراکنش"
          onClick={() => { reverseTransaction(r.id); toast.success('تراکنش حذف و موجودی اصلاح شد.'); }}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="حساب‌های بانکی و صندوق"
        subtitle={`موجودی کل: ${formatNumber(total)} ${settings.currency}`}
        breadcrumbs={[{ label: 'داشبورد', to: '/app' }, { label: 'حساب‌های بانکی' }]}
        actions={
          <>
            <Button variant="outline" icon={ArrowLeftRight} onClick={() => { setTransferForm(EMPTY_TRANSFER); setErrors({}); setTransferOpen(true); }}>
              انتقال بین حساب‌ها
            </Button>
            <Button variant="accent" icon={Plus} onClick={openNewAccount}>افزودن حساب</Button>
          </>
        }
      />

      {accounts.length ? (
        <div className="record-grid" style={{ marginBottom: 'var(--s-5)' }}>
          {accounts.map((a) => (
            <div
              key={a.id}
              className={`account-card ${a.type === 'cash' ? 'account-card--cash' : a.bank === 'بانک سامان' ? 'account-card--gold' : ''}`}
            >
              <span className="account-card__glow" aria-hidden="true" />
              <div className="row between">
                <div>
                  <div className="account-card__name">{a.name}</div>
                  <div className="account-card__meta">
                    {a.type === 'cash' ? 'صندوق نقدی' : a.bank || 'حساب بانکی'}
                    {a.number ? <span className="num"> — {a.number}</span> : null}
                  </div>
                </div>
                <span style={{ opacity: 0.9 }} aria-hidden="true">
                  {a.type === 'cash' ? <Wallet size={24} /> : <Landmark size={24} />}
                </span>
              </div>
              <div className="account-card__balance num">{formatNumber(a.balance)}</div>
              <div className="account-card__label">{settings.currency} — موجودی فعلی</div>
              <div className="row gap-2" style={{ marginTop: 'var(--s-4)' }}>
                <Button variant="ghost" size="sm" icon={Pencil} style={{ color: 'inherit' }} onClick={() => openEditAccount(a)}>
                  ویرایش
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  style={{ color: 'inherit' }}
                  onClick={() => setConfirm(a)}
                >
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <Card style={{ marginBottom: 'var(--s-5)' }}>
        <CardHead
          title="گردش حساب‌ها"
          subtitle="تراکنش‌های ورودی، خروجی و انتقالی"
          icon={ArrowLeftRight}
          actions={
            <Button variant="accent" size="sm" icon={Plus} onClick={() => { setTxnForm({ ...EMPTY_TXN, accountId: accounts[0]?.id || '' }); setErrors({}); setTxnOpen(true); }}>
              ثبت تراکنش
            </Button>
          }
        />
        <CardBody flush>
          <DataTable
            columns={txnColumns}
            rows={transactions}
            emptyTitle="تراکنشی ثبت نشده"
            emptyMessage="با ثبت تراکنش، گردش حساب‌ها و موجودی به‌روزرسانی می‌شود."
            emptyAction={<Button variant="accent" icon={Plus} onClick={() => setTxnOpen(true)}>ثبت تراکنش</Button>}
            caption="گردش حساب‌ها"
          />
        </CardBody>
      </Card>

      {!accounts.length ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={Building2}
              title="حسابی ثبت نشده است"
              message="برای پیگیری نقدینگی، صندوق یا حساب بانکی کسب‌وکار خود را اضافه کنید."
              action={<Button variant="accent" icon={Plus} onClick={openNewAccount}>افزودن حساب</Button>}
            />
          </CardBody>
        </Card>
      ) : null}

      <Modal
        open={Boolean(accountModal)}
        onClose={() => setAccountModal(null)}
        title={accountModal === 'new' ? 'افزودن حساب جدید' : 'ویرایش حساب'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAccountModal(null)}>انصراف</Button>
            <Button variant="accent" icon={Banknote} onClick={saveAccount}>ذخیره حساب</Button>
          </>
        }
      >
        <div className="form-grid">
          <TextField label="نام حساب" required value={accountForm.name} onChange={(e) => setAccountForm((f) => ({ ...f, name: e.target.value }))} placeholder="مثلاً جاری بانک ملت" />
          <Select
            aria-label="نوع حساب"
            value={accountForm.type}
            onChange={(e) => setAccountForm((f) => ({ ...f, type: e.target.value }))}
            options={[{ value: 'bank', label: 'حساب بانکی' }, { value: 'cash', label: 'صندوق نقدی' }]}
          />
          {accountForm.type === 'bank' ? (
            <>
              <TextField label="نام بانک" value={accountForm.bank} onChange={(e) => setAccountForm((f) => ({ ...f, bank: e.target.value }))} placeholder="بانک ملت" />
              <TextField label="شماره حساب / کارت" dir="ltr" value={accountForm.number} onChange={(e) => setAccountForm((f) => ({ ...f, number: e.target.value }))} />
            </>
          ) : null}
          <TextField
            label={`موجودی اولیه (${settings.currency})`}
            dir="ltr"
            inputMode="numeric"
            value={accountForm.balance}
            onChange={(e) => setAccountForm((f) => ({ ...f, balance: e.target.value }))}
          />
        </div>
      </Modal>

      <Modal
        open={txnOpen}
        onClose={() => setTxnOpen(false)}
        title="ثبت تراکنش حساب"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTxnOpen(false)}>انصراف</Button>
            <Button variant="accent" icon={Plus} onClick={submitTxn}>ثبت تراکنش</Button>
          </>
        }
      >
        <form onSubmit={submitTxn} className="stack" style={{ gap: 'var(--s-4)' }}>
          <div className="form-grid">
            <div>
              <Select
                aria-label="حساب"
                value={txnForm.accountId}
                placeholder="انتخاب حساب…"
                onChange={(e) => setTxnForm((f) => ({ ...f, accountId: e.target.value }))}
                options={accounts.map((a) => ({ value: a.id, label: a.name }))}
              />
              {errors.accountId ? <p className="field__error" role="alert">{errors.accountId}</p> : null}
            </div>
            <Select
              aria-label="نوع تراکنش"
              value={txnForm.type}
              onChange={(e) => setTxnForm((f) => ({ ...f, type: e.target.value }))}
              options={[{ value: 'in', label: 'ورودی (واریز)' }, { value: 'out', label: 'خروجی (برداشت)' }]}
            />
            <TextField
              label={`مبلغ (${settings.currency})`}
              required
              dir="ltr"
              inputMode="numeric"
              value={txnForm.amount}
              onChange={(e) => setTxnForm((f) => ({ ...f, amount: e.target.value }))}
              error={errors.amount}
            />
            <JalaliDateInput label="تاریخ" value={txnForm.date} onChange={(v) => setTxnForm((f) => ({ ...f, date: v }))} />
          </div>
          <TextField
            label="شرح تراکنش"
            required
            value={txnForm.description}
            onChange={(e) => setTxnForm((f) => ({ ...f, description: e.target.value }))}
            error={errors.description}
            placeholder="مثلاً واریز از مشتری"
          />
          <TextField
            label="دسته‌بندی"
            value={txnForm.category}
            onChange={(e) => setTxnForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="فروش، اجاره، حقوق…"
          />
        </form>
      </Modal>

      <Modal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        title="انتقال بین حساب‌ها"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTransferOpen(false)}>انصراف</Button>
            <Button variant="accent" icon={ArrowLeftRight} onClick={submitTransfer}>انتقال</Button>
          </>
        }
      >
        <form onSubmit={submitTransfer} className="stack" style={{ gap: 'var(--s-4)' }}>
          <div className="form-grid">
            <div>
              <Select
                aria-label="از حساب"
                value={transferForm.accountId}
                placeholder="حساب مبدأ…"
                onChange={(e) => setTransferForm((f) => ({ ...f, accountId: e.target.value }))}
                options={accounts.map((a) => ({ value: a.id, label: `${a.name} — ${formatNumber(a.balance)}` }))}
              />
              {errors.accountId ? <p className="field__error" role="alert">{errors.accountId}</p> : null}
            </div>
            <div>
              <Select
                aria-label="به حساب"
                value={transferForm.counterpartAccountId}
                placeholder="حساب مقصد…"
                onChange={(e) => setTransferForm((f) => ({ ...f, counterpartAccountId: e.target.value }))}
                options={accounts.map((a) => ({ value: a.id, label: a.name }))}
              />
              {errors.counterpartAccountId ? <p className="field__error" role="alert">{errors.counterpartAccountId}</p> : null}
            </div>
            <TextField
              label={`مبلغ انتقال (${settings.currency})`}
              required
              dir="ltr"
              inputMode="numeric"
              value={transferForm.amount}
              onChange={(e) => setTransferForm((f) => ({ ...f, amount: e.target.value }))}
              error={errors.amount}
            />
            <JalaliDateInput label="تاریخ" value={transferForm.date} onChange={(v) => setTransferForm((f) => ({ ...f, date: v }))} />
          </div>
          <TextField
            label="شرح"
            value={transferForm.description}
            onChange={(e) => setTransferForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="مثلاً انتقال به حساب سپرده"
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => { deleteAccount(confirm.id); toast.success('حساب و گردش آن حذف شد.'); }}
        title="حذف حساب"
        message={`آیا از حذف «${confirm?.name || ''}» و تمام تراکنش‌های آن مطمئن هستید؟`}
        confirmLabel="حذف کن"
      />
    </>
  );
}
