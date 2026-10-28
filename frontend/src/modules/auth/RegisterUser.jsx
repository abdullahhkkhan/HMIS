// User Management (Admin) — create staff logins and control access per role.
import React, { useMemo, useState } from "react";
import { IoPersonAdd, IoSearch, IoEye, IoEyeOff, IoPeople, IoCreateOutline } from "react-icons/io5";
import { useHmis } from "../../store/HmisStore";
import { DEPARTMENTS, ROLES, ROLE_LABELS } from "../../utils/constants";
import { Avatar, Button, Card, CardHeader, EmptyState, Modal, PageHeader, RoleBadge, Badge, StatCard, useToast } from "../../components/ui";
import { Field, Input, Select } from "../../components/forms/Field";

const EMPTY_FORM = { name: "", username: "", role: "", department: "", password: "", confirmPassword: "" };

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-rose-500", "bg-rose-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];
  return { score, label: labels[score], color: colors[score] };
}

const ROLE_PAGES = {
  admin: "All pages",
  registration: "Registration",
  doctor: "Waiting Patients, Patient History",
  dispensary: "Waiting Patients, Dispensary",
};

function UserForm({ initial, existingUsernames, onSubmit, onCancel, isEdit }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const strength = useMemo(() => passwordStrength(form.password), [form.password]);

  const set = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Full name is required";
    if (!form.username.trim()) next.username = "Username is required";
    else if (!/^[a-z0-9._]{3,}$/i.test(form.username)) next.username = "At least 3 letters/numbers, no spaces";
    else if (existingUsernames.includes(form.username.trim().toLowerCase())) next.username = "This username is taken";
    if (!form.role) next.role = "Select a role";
    if (form.role === "doctor" && !form.department) next.department = "Select the doctor's department";
    if (!isEdit || form.password) {
      if (!form.password) next.password = "Password is required";
      else if (form.password.length < 8) next.password = "Use at least 8 characters";
      if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match";
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit(form);
  };

  return (
    <form id="user-form" onSubmit={submit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" required error={errors.name}>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Dr. Ali Raza" error={errors.name} />
        </Field>
        <Field label="Username" required error={errors.username}>
          <Input
            value={form.username}
            onChange={(e) => set("username", e.target.value.replace(/\s/g, ""))}
            placeholder="e.g. drali"
            error={errors.username}
            disabled={isEdit}
          />
        </Field>
        <Field label="Role" required error={errors.role} hint={form.role && `Can open: ${ROLE_PAGES[form.role]}`}>
          <Select value={form.role} onChange={(e) => set("role", e.target.value)} error={errors.role}>
            <option value="">Select role</option>
            {Object.values(ROLES).map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </Select>
        </Field>
        {form.role === "doctor" && (
          <Field label="Department" required error={errors.department}>
            <Select value={form.department} onChange={(e) => set("department", e.target.value)} error={errors.department}>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </Field>
        )}
      </div>

      <div className="pt-2 border-t border-white/10">
        <p className="text-xs text-slate-400 mb-3">
          {isEdit ? "Leave blank to keep the current password." : "Set the login password for this user."}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={isEdit ? "New Password" : "Password"} required={!isEdit} error={errors.password}>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Min. 8 characters"
                error={errors.password}
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label="Toggle password visibility"
              >
                {showPw ? <IoEyeOff /> : <IoEye />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i < strength.score ? strength.color : "bg-slate-700"}`} />
                  ))}
                </div>
                <span className="text-xs text-slate-500 w-12 text-right">{strength.label}</span>
              </div>
            )}
          </Field>
          <Field label="Confirm Password" required={!isEdit} error={errors.confirmPassword}>
            <Input
              type={showPw ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              placeholder="Re-enter password"
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
          </Field>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{isEdit ? "Save Changes" : "Create User"}</Button>
      </div>
    </form>
  );
}

export default function RegisterUser() {
  const { db, addUser, updateUser, currentUser } = useHmis();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modal, setModal] = useState(null); // { mode: 'add' } | { mode: 'edit', user }

  const users = db.users;
  const filtered = users
    .filter((u) => roleFilter === "all" || u.role === roleFilter)
    .filter((u) => `${u.name} ${u.username} ${u.department}`.toLowerCase().includes(search.toLowerCase()));

  const counts = Object.values(ROLES).reduce((acc, r) => ({ ...acc, [r]: users.filter((u) => u.role === r && u.active).length }), {});

  const handleSubmit = (form) => {
    const data = {
      name: form.name.trim(),
      username: form.username.trim().toLowerCase(),
      role: form.role,
      department: form.role === "doctor" ? form.department : "",
    };
    if (modal.mode === "edit" && modal.user.id === currentUser.id && data.role !== "admin") {
      toast("You can't remove the Admin role from your own account", "error");
      return;
    }
    if (modal.mode === "add") {
      addUser({ ...data, password: form.password });
      toast(`${data.name} can now sign in as ${ROLE_LABELS[data.role]}`);
    } else {
      updateUser(modal.user.id, { ...data, ...(form.password ? { password: form.password } : {}) });
      toast(`${data.name} updated`);
    }
    setModal(null);
  };

  const toggleActive = (u) => {
    if (u.id === currentUser.id) {
      toast("You can't deactivate your own account", "error");
      return;
    }
    updateUser(u.id, { active: !u.active });
    toast(`${u.name} ${u.active ? "deactivated" : "re-activated"}`, u.active ? "info" : "success");
  };

  return (
    <>
      <PageHeader
        title="User Management"
        crumbs={["Admin", "Users"]}
        description="Create staff logins. Each role only sees its own pages."
        actions={<Button icon={IoPersonAdd} onClick={() => setModal({ mode: "add" })}>Add User</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Object.values(ROLES).map((r) => (
          <StatCard
            key={r}
            label={ROLE_LABELS[r]}
            value={counts[r]}
            hint="active accounts"
            onClick={() => setRoleFilter(roleFilter === r ? "all" : r)}
            active={roleFilter === r}
          />
        ))}
      </div>

      <Card>
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10">
          <CardHeader icon={IoPeople} title="Staff Accounts" subtitle={`${filtered.length} of ${users.length} users`} />
          <div className="relative sm:w-72">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, username…" className="pl-9" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={IoPeople} title="No users found">Try a different search or role filter.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 bg-slate-900/40">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((u) => (
                  <tr key={u.id} className={`hover:bg-white/[0.02] ${u.active ? "" : "opacity-60"}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <p className="font-medium text-slate-100">
                            {u.name} {u.id === currentUser.id && <span className="text-xs text-slate-500">(you)</span>}
                          </p>
                          <p className="text-xs text-slate-500">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-5 py-3 text-slate-300">{u.department || "—"}</td>
                    <td className="px-5 py-3">
                      <Badge tone={u.active ? "emerald" : "slate"} dot>{u.active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="xs"
                          variant="ghost"
                          icon={IoCreateOutline}
                          onClick={() => setModal({ mode: "edit", user: u })}
                        >
                          Edit
                        </Button>
                        <Button size="xs" variant={u.active ? "danger-ghost" : "ghost"} onClick={() => toggleActive(u)}>
                          {u.active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "edit" ? `Edit ${modal.user.name}` : "Add User"}
        subtitle={modal?.mode === "edit" ? `@${modal.user.username}` : "Creates a new staff login"}
      >
        {modal && (
          <UserForm
            key={modal.user?.id || "new"}
            isEdit={modal.mode === "edit"}
            initial={modal.mode === "edit" ? { ...EMPTY_FORM, ...modal.user, password: "", confirmPassword: "" } : EMPTY_FORM}
            existingUsernames={users.filter((u) => u.id !== modal.user?.id).map((u) => u.username.toLowerCase())}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>
    </>
  );
}
