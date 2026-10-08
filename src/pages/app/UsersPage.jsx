import { useState } from 'react';
import { Plus, Users, ShieldCheck, Pencil, Trash2, Mail } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { PageHeader, Card, CardHead, CardBody } from '../../components/ui/Card.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import { Badge, Avatar } from '../../components/ui/Badge.jsx';
import Modal, { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { Select, TextField } from '../../components/ui/Form.jsx';
import { Tabs, InfoNote } from '../../components/ui/Misc.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '../../lib/data.js';
import { formatJalali, relativeDay } from '../../lib/date.js';

const EMPTY = { name: '', email: '', role: 'accountant', status: 'active' };

export default function UsersPage() {
  const toast = useToast();
  const { settings, updateSettings } = useSettings();
  const { user: currentUser } = useAuth();
  const { users, addUser, updateUser, deleteUser } = useData();

  const [tab, setTab] = useState('users');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(null);

  const matrix = settings.rolePermissions || ROLE_PERMISSIONS;

  const togglePermission = (role, perm) => {
    const current = matrix[role] || [];
    const next = current.includes(perm)
      ? current.filter((p) => p !== perm)
      : [...current, perm];
    updateSettings({ rolePermissions: { ...matrix, [role]: next } });
  };

  const openNew = () => { setEditing('new'); setForm(EMPTY); setErrors({}); };
  const openEdit = (u) => { setEditing(u.id); setForm({ name: u.name, email: u.email, role: u.role, status: u.status }); setErrors({}); };

  const save = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'نام کاربر الزامی است.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'ایمیل معتبر وارد کنید.';
    setErrors(next);
    if (Object.keys(next).length) return;

    if (editing === 'new') {
      addUser({ ...form, status: 'invited' });
      toast.success('کاربر جدید افزوده شد و دعوت‌نامه ارسال شد.', { title: 'کاربر افزوده شد' });
    } else {
      updateUser(editing, form);
      toast.success('اطلاعات کاربر به‌روزرسانی شد.');
    }
    setEditing(null);
  };

  const columns = [
    {
      key: 'name',
      header: 'کاربر',
      render: (row) => (
        <div className="row gap-3">
          <Avatar name={row.name} size={34} tone={row.role === 'owner' ? 'indigo' : 'brand'} />
          <div>
            <div className="strong">{row.name}</div>
            <div className="faint num">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'نقش',
      render: (row) => <Badge tone={row.role === 'owner' ? 'brand' : 'info'}>{ROLES.find((r) => r.id === row.role)?.label || row.role}</Badge>,
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (row) => (
        <Badge tone={row.status === 'active' ? 'success' : 'warning'} dot>
          {row.status === 'active' ? 'فعال' : 'دعوت‌شده'}
        </Badge>
      ),
    },
    {
      key: 'lastActive',
      header: 'آخرین فعالیت',
      render: (row) => (row.lastActive ? <span className="num">{relativeDay(row.lastActive)}</span> : <span className="faint">—</span>),
    },
    {
      key: 'actions',
      header: 'عملیات',
      align: 'center',
      width: 110,
      render: (row) => (
        <div className="row gap-1" style={{ justifyContent: 'center' }}>
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(row)} aria-label="ویرایش" />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            aria-label="حذف"
            disabled={row.email === currentUser?.email}
            onClick={() => setConfirm(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="کاربران و دسترسی‌ها"
        subtitle={`${users.length} کاربر — ${ROLES.length} نقش تعریف‌شده`}
        breadcrumbs={[{ label: 'داشبورد', to: '/app' }, { label: 'کاربران و دسترسی‌ها' }]}
        actions={<Button variant="accent" icon={Plus} onClick={openNew}>افزودن کاربر</Button>}
      />

      <div style={{ marginBottom: 'var(--s-5)' }}>
        <Tabs
          ariaLabel="بخش‌های مدیریت کاربران"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'users', label: 'کاربران', count: users.length },
            { value: 'roles', label: 'نقش‌ها و دسترسی‌ها' },
          ]}
        />
      </div>

      {tab === 'users' ? (
        <Card>
          <CardHead title="کاربران سازمان" subtitle="مدیریت اعضای تیم و نقش‌های دسترسی" icon={Users} />
          <CardBody flush>
            <DataTable
              columns={columns}
              rows={users}
              emptyTitle="کاربری ثبت نشده"
              emptyMessage="اعضای تیم مالی خود را اضافه کنید و نقش مناسب را به آن‌ها بدهید."
              emptyAction={<Button variant="accent" icon={Plus} onClick={openNew}>افزودن کاربر</Button>}
              caption="فهرست کاربران"
            />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHead
            title="ماتریس دسترسی نقش‌ها"
            subtitle="تعیین کنید هر نقش به کدام بخش‌ها دسترسی دارد"
            icon={ShieldCheck}
          />
          <CardBody flush>
            <div className="table-wrap">
              <table className="permission-matrix">
                <thead>
                  <tr>
                    <th>دسترسی</th>
                    {ROLES.map((r) => <th key={r.id}>{r.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map((perm) => (
                    <tr key={perm.id}>
                      <td>{perm.label}</td>
                      {ROLES.map((role) => {
                        const on = (matrix[role.id] || []).includes(perm.id);
                        return (
                          <td key={role.id}>
                            <input
                              type="checkbox"
                              checked={on}
                              aria-label={`${perm.label} برای ${role.label}`}
                              onChange={() => {
                                togglePermission(role.id, perm.id);
                                toast.info(`دسترسی «${perm.label}» برای نقش «${role.label}» ${on ? 'حذف' : 'فعال'} شد.`);
                              }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: 'var(--s-5)' }}>
              <InfoNote tone="info" icon={ShieldCheck} title="اثر فوری">
                تغییرات این ماتریس بلافاصله روی دسترسی کاربران اعمال می‌شود. نقش «مدیر اصلی» باید
                دسترسی به تنظیمات و کاربران را داشته باشد تا امکان مدیریت سیستم از دست نرود.
              </InfoNote>
            </div>
          </CardBody>
        </Card>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'افزودن کاربر' : 'ویرایش کاربر'}
        description="برای کاربر جدید یک دعوت‌نامه ایمیلی ارسال می‌شود."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>انصراف</Button>
            <Button variant="accent" icon={Mail} onClick={save}>ذخیره کاربر</Button>
          </>
        }
      >
        <form onSubmit={save} className="stack" style={{ gap: 'var(--s-4)' }}>
          <div className="form-grid">
            <TextField label="نام و نام خانوادگی" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
            <TextField label="ایمیل" required dir="ltr" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} />
            <Select
              aria-label="نقش"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              options={ROLES.map((r) => ({ value: r.id, label: r.label }))}
            />
            <Select
              aria-label="وضعیت"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              options={[{ value: 'active', label: 'فعال' }, { value: 'invited', label: 'دعوت‌شده' }]}
            />
          </div>
          <InfoNote tone="info">
            {ROLES.find((r) => r.id === form.role)?.hint}
          </InfoNote>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => { deleteUser(confirm.id); toast.success('کاربر حذف شد.'); }}
        title="حذف کاربر"
        message={`آیا از حذف «${confirm?.name || ''}» مطمئن هستید؟ دسترسی او به سیستم قطع می‌شود.`}
        confirmLabel="حذف کن"
      />
    </>
  );
}
