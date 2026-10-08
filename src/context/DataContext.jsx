import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createSeed } from '../lib/data.js';
import { loadJSON, saveJSON, removeKey, uid } from '../lib/id.js';
import { todayISO } from '../lib/date.js';
import { invoiceTotals, num } from '../lib/calc.js';

const STORAGE_KEY = '2hs.data.v1';
const DataContext = createContext(null);

function readState() {
  // `settings` lives in SettingsContext, so the data store only keeps collections.
  const { settings: _settings, ...seedCollections } = createSeed();
  const stored = loadJSON(STORAGE_KEY, null);
  if (!stored || typeof stored !== 'object') return seedCollections;

  // Merge over the seed so a snapshot written by an older schema can never
  // leave a collection undefined — every consumer assumes arrays.
  const merged = { ...seedCollections };
  for (const key of Object.keys(seedCollections)) {
    if (Array.isArray(stored[key])) merged[key] = stored[key];
  }
  return merged;
}

export function DataProvider({ children }) {
  const [state, setState] = useState(readState);

  const commit = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveJSON(STORAGE_KEY, next);
      return next;
    });
  }, []);

  /* ---------------- collections ---------------- */
  const { customers, products, invoices, expenses, payments, accounts, transactions, users, notifications } = state;

  const customerById = useMemo(
    () => Object.fromEntries(customers.map((c) => [c.id, c])),
    [customers]
  );
  const productById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products]
  );
  const accountById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a])),
    [accounts]
  );

  /** Customer receipts = invoice payments, flattened for the receipts ledger. */
  const receipts = useMemo(() => {
    const rows = [];
    for (const inv of invoices) {
      for (const p of inv.payments || []) {
        rows.push({
          ...p,
          id: p.id,
          invoiceId: inv.id,
          invoiceNumber: inv.number,
          customerId: inv.customerId,
          customerName: customerById[inv.customerId]?.name || '—',
        });
      }
    }
    return rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [invoices, customerById]);

  const suppliers = useMemo(() => {
    const set = new Set([
      'مالک ساختمان', 'پرسنل', 'شرکت توزیع برق', 'شرکت مخابرات',
      'فروشگاه لوازم اداری', 'آژانس دیجیتال مارکتینگ', 'باربری ره‌گستر',
      'شرکت فناوری پارس', 'سازمان امور مالیاتی',
    ]);
    expenses.forEach((e) => e.supplier && set.add(e.supplier));
    payments.forEach((p) => p.supplier && set.add(p.supplier));
    return [...set].sort((a, b) => a.localeCompare(b, 'fa'));
  }, [expenses, payments]);

  /* ---------------- customers ---------------- */
  const addCustomer = useCallback((payload) => {
    const record = { id: uid('cus'), createdAt: todayISO(), ...payload };
    commit((prev) => ({ ...prev, customers: [record, ...prev.customers] }));
    return record;
  }, [commit]);

  const updateCustomer = useCallback((id, patch) => {
    commit((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, [commit]);

  const deleteCustomer = useCallback((id) => {
    commit((prev) => ({ ...prev, customers: prev.customers.filter((c) => c.id !== id) }));
  }, [commit]);

  /* ---------------- products ---------------- */
  const addProduct = useCallback((payload) => {
    const record = { id: uid('prd'), active: true, ...payload };
    commit((prev) => ({ ...prev, products: [record, ...prev.products] }));
    return record;
  }, [commit]);

  const updateProduct = useCallback((id, patch) => {
    commit((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, [commit]);

  const deleteProduct = useCallback((id) => {
    commit((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
  }, [commit]);

  /* ---------------- invoices ---------------- */
  const addInvoice = useCallback((payload) => {
    const record = {
      id: uid('inv'),
      status: 'draft',
      shipping: 0,
      notes: '',
      terms: '',
      payments: [],
      ...payload,
    };
    commit((prev) => ({ ...prev, invoices: [record, ...prev.invoices] }));
    return record;
  }, [commit]);

  const updateInvoice = useCallback((id, patch) => {
    commit((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));
  }, [commit]);

  const deleteInvoice = useCallback((id) => {
    commit((prev) => ({ ...prev, invoices: prev.invoices.filter((i) => i.id !== id) }));
  }, [commit]);

  const setInvoiceStatus = useCallback((id, status) => {
    commit((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) => (i.id === id ? { ...i, status } : i)),
    }));
  }, [commit]);

  const duplicateInvoice = useCallback((id) => {
    let created = null;
    commit((prev) => {
      const source = prev.invoices.find((i) => i.id === id);
      if (!source) return prev;
      const sourceTotal = invoiceTotals(source);
      created = {
        ...source,
        id: uid('inv'),
        number: `${source.number}-کپی`,
        status: 'draft',
        issueDate: todayISO(),
        dueDate: source.dueDate,
        payments: [],
        items: source.items.map((it) => ({ ...it, id: uid('it') })),
        _copyOf: sourceTotal.total,
      };
      return { ...prev, invoices: [created, ...prev.invoices] };
    });
    return created;
  }, [commit]);

  /* ---------------- money movements ---------------- */
  const applyAccountMove = (prev, { accountId, type, amount, date, description, category, counterpartAccountId }) => {
    if (!accountId) return prev.accounts;
    return prev.accounts.map((a) => {
      if (a.id === accountId) {
        const delta = type === 'in' ? num(amount) : -num(amount);
        return { ...a, balance: num(a.balance) + delta };
      }
      if (type === 'transfer' && a.id === counterpartAccountId) {
        return { ...a, balance: num(a.balance) + num(amount) };
      }
      return a;
    });
  };

  const addTransaction = useCallback((payload) => {
    const record = { id: uid('trx'), counterpartAccountId: null, ...payload, date: payload.date || todayISO() };
    commit((prev) => ({
      ...prev,
      transactions: [record, ...prev.transactions],
      accounts: applyAccountMove(prev, record),
    }));
    return record;
  }, [commit]);

  const reverseTransaction = useCallback((id) => {
    commit((prev) => {
      const trx = prev.transactions.find((t) => t.id === id);
      if (!trx) return prev;
      const inverse = trx.type === 'in' ? 'out' : 'in';
      const accounts = applyAccountMove(prev, { ...trx, type: inverse });
      return {
        ...prev,
        accounts,
        transactions: prev.transactions.filter((t) => t.id !== id),
      };
    });
  }, [commit]);

  const recordReceipt = useCallback((payload) => {
    const { invoiceId, amount, date, method, reference, notes, accountId } = payload;
    const payment = {
      id: uid('rct'),
      amount: num(amount),
      date: date || todayISO(),
      method: method || 'نقدی',
      reference: reference || '',
      notes: notes || '',
    };
    let invoiceNumber = '';
    let customerName = '';
    commit((prev) => {
      const inv = prev.invoices.find((i) => i.id === invoiceId);
      if (!inv) return prev;
      invoiceNumber = inv.number;
      customerName = prev.customers.find((c) => c.id === inv.customerId)?.name || '';
      const invoices = prev.invoices.map((i) =>
        i.id === invoiceId ? { ...i, payments: [...(i.payments || []), payment] } : i
      );
      const transactions2 = accountId
        ? [
            {
              id: uid('trx'),
              accountId,
              type: 'in',
              amount: payment.amount,
              date: payment.date,
              description: `دریافت از ${customerName} — فاکتور ${invoiceNumber}`,
              category: 'فروش',
              counterpartAccountId: null,
            },
            ...prev.transactions,
          ]
        : prev.transactions;
      const accounts2 = accountId
        ? applyAccountMove(prev, { accountId, type: 'in', amount: payment.amount })
        : prev.accounts;
      return { ...prev, invoices, transactions: transactions2, accounts: accounts2 };
    });
    return payment;
  }, [commit]);

  const recordSupplierPayment = useCallback((payload) => {
    const record = {
      id: uid('pmt'),
      supplier: payload.supplier || 'سایر',
      amount: num(payload.amount),
      date: payload.date || todayISO(),
      accountId: payload.accountId || null,
      method: payload.method || 'نقدی',
      reference: payload.reference || '',
      notes: payload.notes || '',
    };
    commit((prev) => {
      const accounts = record.accountId
        ? applyAccountMove(prev, {
            accountId: record.accountId,
            type: 'out',
            amount: record.amount,
          })
        : prev.accounts;
      const transactions2 = record.accountId
        ? [
            {
              id: uid('trx'),
              accountId: record.accountId,
              type: 'out',
              amount: record.amount,
              date: record.date,
              description: `پرداخت به ${record.supplier}`,
              category: 'خرید',
              counterpartAccountId: null,
            },
            ...prev.transactions,
          ]
        : prev.transactions;
      return { ...prev, payments: [record, ...prev.payments], transactions: transactions2, accounts };
    });
    return record;
  }, [commit]);

  const deletePayment = useCallback((id) => {
    commit((prev) => {
      const payment = prev.payments.find((p) => p.id === id);
      if (!payment) return prev;
      const accounts = payment.accountId
        ? applyAccountMove(prev, { accountId: payment.accountId, type: 'in', amount: payment.amount })
        : prev.accounts;
      return { ...prev, accounts, payments: prev.payments.filter((p) => p.id !== id) };
    });
  }, [commit]);

  /* ---------------- expenses ---------------- */
  const addExpense = useCallback((payload) => {
    const record = { id: uid('exp'), status: 'paid', ...payload, amount: num(payload.amount), date: payload.date || todayISO() };
    commit((prev) => ({ ...prev, expenses: [record, ...prev.expenses] }));
    return record;
  }, [commit]);

  const updateExpense = useCallback((id, patch) => {
    commit((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, [commit]);

  const deleteExpense = useCallback((id) => {
    commit((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== id) }));
  }, [commit]);

  /* ---------------- accounts ---------------- */
  const addAccount = useCallback((payload) => {
    const record = { id: uid('acc'), balance: 0, type: 'bank', ...payload };
    commit((prev) => ({ ...prev, accounts: [...prev.accounts, record] }));
    return record;
  }, [commit]);

  const updateAccount = useCallback((id, patch) => {
    commit((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, [commit]);

  const deleteAccount = useCallback((id) => {
    commit((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((a) => a.id !== id),
      transactions: prev.transactions.filter((t) => t.accountId !== id),
    }));
  }, [commit]);

  /* ---------------- users ---------------- */
  const addUser = useCallback((payload) => {
    const record = { id: uid('usr'), status: 'invited', lastActive: null, ...payload };
    commit((prev) => ({ ...prev, users: [...prev.users, record] }));
    return record;
  }, [commit]);

  const updateUser = useCallback((id, patch) => {
    commit((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    }));
  }, [commit]);

  const deleteUser = useCallback((id) => {
    commit((prev) => ({ ...prev, users: prev.users.filter((u) => u.id !== id) }));
  }, [commit]);

  /* ---------------- notifications ---------------- */
  const markNotificationRead = useCallback((id) => {
    commit((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, [commit]);

  const markAllNotificationsRead = useCallback(() => {
    commit((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, [commit]);

  /* ---------------- backup ---------------- */
  const resetDemo = useCallback(() => {
    const seed = createSeed();
    saveJSON(STORAGE_KEY, seed);
    setState(seed);
  }, []);

  const exportData = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importData = useCallback((json) => {
    const parsed = JSON.parse(json);
    if (!parsed || !Array.isArray(parsed.invoices)) throw new Error('ساختار فایل پشتیبان معتبر نیست.');
    saveJSON(STORAGE_KEY, parsed);
    setState(parsed);
  }, []);

  const clearAll = useCallback(() => {
    removeKey(STORAGE_KEY);
    setState(createSeed());
  }, []);

  const value = useMemo(
    () => ({
      customers, products, invoices, expenses, payments, accounts, transactions, users, notifications,
      receipts, suppliers,
      customerById, productById, accountById,
      addCustomer, updateCustomer, deleteCustomer,
      addProduct, updateProduct, deleteProduct,
      addInvoice, updateInvoice, deleteInvoice, setInvoiceStatus, duplicateInvoice,
      addTransaction, reverseTransaction, recordReceipt, recordSupplierPayment, deletePayment,
      addExpense, updateExpense, deleteExpense,
      addAccount, updateAccount, deleteAccount,
      addUser, updateUser, deleteUser,
      markNotificationRead, markAllNotificationsRead,
      resetDemo, exportData, importData, clearAll,
    }),
    [
      customers, products, invoices, expenses, payments, accounts, transactions, users, notifications,
      receipts, suppliers, customerById, productById, accountById,
      addCustomer, updateCustomer, deleteCustomer, addProduct, updateProduct, deleteProduct,
      addInvoice, updateInvoice, deleteInvoice, setInvoiceStatus, duplicateInvoice,
      addTransaction, reverseTransaction, recordReceipt, recordSupplierPayment, deletePayment,
      addExpense, updateExpense, deleteExpense, addAccount, updateAccount, deleteAccount,
      addUser, updateUser, deleteUser, markNotificationRead, markAllNotificationsRead,
      resetDemo, exportData, importData, clearAll,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
