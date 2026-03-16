import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { Plus, Check, X as XIcon } from 'lucide-react';
import client from '@/api/client';
import useAuthStore from '@/store/authStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { RoleBadge } from '@/components/shared/RoleBadge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------
const settingsApi = {
  getAccount: () => client.get('/settings/account'),
  updateAccount: (data) => client.put('/settings/account', data),
  getUsers: () => client.get('/settings/users'),
  inviteUser: (data) => client.post('/settings/users/invite', data),
  updateUserRole: (userId, data) =>
    client.put(`/settings/users/${userId}/role`, data),
  deactivateUser: (userId) =>
    client.put(`/settings/users/${userId}/deactivate`),
  changePassword: (data) => client.put('/settings/password', data),
};

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------
const accountSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessEmail: z.string().email('Invalid email'),
  businessPhone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SALES_HANDLER', label: 'Sales Handler' },
  { value: 'SALES_USER', label: 'Sales User' },
  { value: 'EXPLORER', label: 'Explorer' },
];

const TABS = [
  { key: 'account', label: 'Account', handlerOnly: true },
  { key: 'users', label: 'Users', handlerOnly: true },
  { key: 'profile', label: 'Profile', handlerOnly: false },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AccountTab() {
  const queryClient = useQueryClient();
  const { data: accountRes, isLoading } = useQuery({
    queryKey: ['settings', 'account'],
    queryFn: () => settingsApi.getAccount().then((r) => r.data),
  });

  const updateAccount = useMutation({
    mutationFn: (data) => settingsApi.updateAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'account'] });
      toast.success('Account settings saved');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountSchema),
    values: accountRes
      ? {
          businessName: accountRes.businessName || '',
          businessEmail: accountRes.businessEmail || '',
          businessPhone: accountRes.businessPhone || '',
        }
      : undefined,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-card max-w-2xl">
      <form
        onSubmit={handleSubmit((values) => updateAccount.mutate(values))}
        className="space-y-5"
      >
        <Input
          label="Business Name"
          id="businessName"
          error={errors.businessName?.message}
          {...register('businessName')}
        />
        <Input
          label="Business Email"
          id="businessEmail"
          type="email"
          error={errors.businessEmail?.message}
          {...register('businessEmail')}
        />
        <Input
          label="Business Phone"
          id="businessPhone"
          error={errors.businessPhone?.message}
          {...register('businessPhone')}
        />

        {/* Plan tier (read-only) */}
        {accountRes?.planTier && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-primary">Plan</span>
            <Badge
              variant="info"
              className="w-fit text-sm px-3 py-1"
            >
              {accountRes.planTier}
            </Badge>
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" loading={updateAccount.isPending}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

function UsersTab() {
  const queryClient = useQueryClient();
  const { data: usersRes, isLoading } = useQuery({
    queryKey: ['settings', 'users'],
    queryFn: () => settingsApi.getUsers().then((r) => r.data),
  });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('SALES_USER');
  const [editRoleUser, setEditRoleUser] = useState(null);
  const [editRoleValue, setEditRoleValue] = useState('');
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const inviteUser = useMutation({
    mutationFn: (data) => settingsApi.inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
      toast.success('Invitation sent');
      setInviteOpen(false);
      setInviteEmail('');
      setInviteRole('SALES_USER');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to invite');
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ userId, role }) =>
      settingsApi.updateUserRole(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
      toast.success('Role updated');
      setEditRoleUser(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update role');
    },
  });

  const deactivateUser = useMutation({
    mutationFn: (userId) => settingsApi.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
      toast.success('User deactivated');
      setDeactivateTarget(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    },
  });

  const users = usersRes?.users ?? [];
  const planLimit = usersRes?.planLimit ?? null;
  const planTier = usersRes?.planTier ?? '';

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (value) => <RoleBadge role={value} />,
    },
    {
      key: 'verified',
      label: 'Verified',
      render: (value) =>
        value ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <XIcon size={16} className="text-gray-300" />
        ),
    },
    {
      key: 'active',
      label: 'Active',
      render: (value) => (
        <div
          className={clsx(
            'w-2.5 h-2.5 rounded-full',
            value !== false ? 'bg-green-500' : 'bg-gray-300'
          )}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditRoleUser(row);
              setEditRoleValue(row.role);
            }}
          >
            Edit Role
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => setDeactivateTarget(row)}
          >
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          {planLimit != null && (
            <p className="text-sm text-secondary">
              {users.length} of {planLimit} users ({planTier} plan)
              {users.length >= planLimit && (
                <span className="ml-2 text-amber-600 font-medium">
                  \u2014 Upgrade to add more users
                </span>
              )}
            </p>
          )}
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <Plus size={16} />
          Invite User
        </Button>
      </div>

      <Table columns={columns} data={users} loading={isLoading} />

      {/* Invite Modal */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite User"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                inviteUser.mutate({ email: inviteEmail, role: inviteRole })
              }
              loading={inviteUser.isPending}
              disabled={!inviteEmail}
            >
              Send Invite
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="user@company.com"
          />
          <Select
            label="Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            options={ROLE_OPTIONS}
          />
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        open={!!editRoleUser}
        onClose={() => setEditRoleUser(null)}
        title="Edit Role"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditRoleUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                updateRole.mutate({
                  userId: editRoleUser.id,
                  role: editRoleValue,
                })
              }
              loading={updateRole.isPending}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            Change role for{' '}
            <span className="font-medium text-primary">
              {editRoleUser?.username || editRoleUser?.email}
            </span>
          </p>
          <Select
            label="Role"
            value={editRoleValue}
            onChange={(e) => setEditRoleValue(e.target.value)}
            options={ROLE_OPTIONS}
          />
        </div>
      </Modal>

      {/* Deactivate Confirm */}
      <ConfirmDialog
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => deactivateUser.mutate(deactivateTarget.id)}
        title="Deactivate User"
        message={`Deactivate "${deactivateTarget?.username || deactivateTarget?.email}"? They will lose access immediately.`}
        confirmText="Deactivate"
        loading={deactivateUser.isPending}
      />
    </>
  );
}

function ProfileTab() {
  const user = useAuthStore((s) => s.user);

  const changePassword = useMutation({
    mutationFn: (data) => settingsApi.changePassword(data),
    onSuccess: () => {
      toast.success('Password updated');
      resetPw();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update password');
    },
  });

  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Read-only info */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <h3 className="text-base font-semibold text-primary mb-4">
          Your Profile
        </h3>
        <div className="space-y-4">
          <Input
            label="Name"
            value={
              user
                ? [user.firstName, user.lastName].filter(Boolean).join(' ')
                : ''
            }
            disabled
          />
          <Input label="Email" value={user?.email || ''} disabled />
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl p-6 shadow-card">
        <h3 className="text-base font-semibold text-primary mb-4">
          Change Password
        </h3>
        <form
          onSubmit={handleSubmitPw((values) => changePassword.mutate(values))}
          className="space-y-4"
        >
          <Input
            label="Current Password"
            id="currentPassword"
            type="password"
            error={pwErrors.currentPassword?.message}
            {...registerPw('currentPassword')}
          />
          <Input
            label="New Password"
            id="newPassword"
            type="password"
            error={pwErrors.newPassword?.message}
            {...registerPw('newPassword')}
          />
          <Input
            label="Confirm New Password"
            id="confirmPassword"
            type="password"
            error={pwErrors.confirmPassword?.message}
            {...registerPw('confirmPassword')}
          />
          <div className="pt-2">
            <Button type="submit" loading={changePassword.isPending}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const isHandler = useAuthStore((s) => s.isHandler());
  const [activeTab, setActiveTab] = useState(isHandler ? 'account' : 'profile');

  const visibleTabs = TABS.filter((tab) => !tab.handlerOnly || isHandler);

  return (
    <>
      <PageHeader title="Settings" />

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit mb-6">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer',
              activeTab === tab.key
                ? 'bg-white shadow-sm text-primary'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'account' && isHandler && <AccountTab />}
      {activeTab === 'users' && isHandler && <UsersTab />}
      {activeTab === 'profile' && <ProfileTab />}
    </>
  );
}
