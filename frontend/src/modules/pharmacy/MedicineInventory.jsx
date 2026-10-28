// Medicines (Admin) — add medicines to the dispensary, restock, edit, remove.
import React, { useMemo, useState } from "react";
import { IoAddCircle, IoSearch, IoTrashOutline, IoCreateOutline, IoAdd, IoWarning, IoTimeOutline, IoCube } from "react-icons/io5";
import { FaPills } from "react-icons/fa6";
import { useHmis } from "../../store/HmisStore";
import { EXPIRY_WARNING_DAYS, LOW_STOCK_DEFAULT, MEDICINE_CATEGORIES, MEDICINE_FORMS, VISIT_STATUS } from "../../utils/constants";
import { daysUntil, formatDate } from "../../utils/format";
import { Badge, Button, Card, CardHeader, EmptyState, Modal, PageHeader, StatCard, useToast } from "../../components/ui";
import { Field, Input, Select } from "../../components/forms/Field";

const EMPTY_FORM = { name: "", strength: "", form: "Tablet", category: "", stock: "", reorderLevel: String(LOW_STOCK_DEFAULT), batch: "", expiry: "" };

const stockState = (m) => {
  if (m.stock <= 0) return { key: "out", badge: <Badge tone="rose">Out of stock</Badge> };
  if (m.stock <= (m.reorderLevel ?? LOW_STOCK_DEFAULT)) return { key: "low", badge: <Badge tone="amber">Low stock</Badge> };
  return { key: "ok", badge: <Badge tone="emerald">In stock</Badge> };
};

const expiryState = (m) => {
  const d = daysUntil(m.expiry);
  if (d === null) return null;
  if (d < 0) return { key: "expired", badge: <Badge tone="rose">Expired</Badge> };
  if (d <= EXPIRY_WARNING_DAYS) return { key: "soon", badge: <Badge tone="amber">{d}d to expiry</Badge> };
  return null;
};

function MedicineForm({ initial, onSubmit, onCancel, existing, isEdit }) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => {
    setF((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!f.name.trim()) next.name = "Medicine name is required";
    if (!f.strength.trim()) next.strength = "Strength is required (e.g. 500mg)";
    if (f.stock === "" || Number(f.stock) < 0) next.stock = "Enter quantity in stock";
    if (f.expiry && !isEdit && daysUntil(f.expiry) < 0) next.expiry = "Expiry date is in the past";
    const dup = existing.find(
      (m) => m.name.toLowerCase() === f.name.trim().toLowerCase() && m.strength.toLowerCase() === f.strength.trim().toLowerCase() && m.form === f.form
    );
    if (dup) next.name = "This medicine already exists — use Restock instead";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({
      ...f,
      name: f.name.trim(),
      strength: f.strength.trim(),
      category: f.category || "Other",
      stock: Number(f.stock),
      reorderLevel: Number(f.reorderLevel) || LOW_STOCK_DEFAULT,
    });
  };

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Medicine Name" required error={errors.name} className="sm:col-span-2">
        <Input value={f.name} onChange={set("name")} placeholder="e.g. Paracetamol" error={errors.name} autoFocus />
      </Field>
      <Field label="Strength" required error={errors.strength}>
        <Input value={f.strength} onChange={set("strength")} placeholder="e.g. 500mg, 120ml" error={errors.strength} />
      </Field>
      <Field label="Form">
        <Select value={f.form} onChange={set("form")}>
          {MEDICINE_FORMS.map((x) => <option key={x}>{x}</option>)}
        </Select>
      </Field>
      <Field label="Category">
        <Select value={f.category} onChange={set("category")}>
          <option value="">Select category</option>
          {MEDICINE_CATEGORIES.map((x) => <option key={x}>{x}</option>)}
        </Select>
      </Field>
      <Field label="Batch No.">
        <Input value={f.batch} onChange={set("batch")} placeholder="e.g. PCM-2411" />
      </Field>
      <Field label="Quantity in Stock" required error={errors.stock}>
        <Input type="number" min="0" value={f.stock} onChange={set("stock")} placeholder="e.g. 500" error={errors.stock} />
      </Field>
      <Field label="Reorder Level" hint="Flag as low stock at or below this">
        <Input type="number" min="0" value={f.reorderLevel} onChange={set("reorderLevel")} />
      </Field>
      <Field label="Expiry Date" error={errors.expiry}>
        <Input type="date" value={f.expiry} onChange={set("expiry")} error={errors.expiry} />
      </Field>
      <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{isEdit ? "Save Changes" : "Add Medicine"}</Button>
      </div>
    </form>
  );
}

function RestockModal({ med, onClose, onSubmit }) {
  const [qty, setQty] = useState("");
  const [batch, setBatch] = useState(med.batch || "");
  const [expiry, setExpiry] = useState(med.expiry || "");
  const [error, setError] = useState("");
  return (
    <Modal
      open
      size="sm"
      onClose={onClose}
      title={`Restock ${med.name} ${med.strength}`}
      subtitle={`Currently ${med.stock} in stock`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => (Number(qty) > 0 ? onSubmit({ qty: Number(qty), batch, expiry }) : setError("Enter a quantity above 0"))}>
            Add to Stock
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Quantity Received" required error={error} hint={Number(qty) > 0 ? `New stock: ${med.stock + Number(qty)}` : undefined}>
          <Input type="number" min="1" autoFocus value={qty} onChange={(e) => { setQty(e.target.value); setError(""); }} error={error} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Batch No.">
            <Input value={batch} onChange={(e) => setBatch(e.target.value)} />
          </Field>
          <Field label="Expiry Date">
            <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}

export default function MedicineInventory() {
  const { db, addMedicine, updateMedicine, deleteMedicine } = useHmis();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [filter, setFilter] = useState("all"); // all | low | expiring
  const [modal, setModal] = useState(null); // {mode:'add'|'edit', med}
  const [restock, setRestock] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const meds = db.medicines;
  const lowCount = meds.filter((m) => stockState(m).key !== "ok").length;
  const expiringCount = meds.filter((m) => expiryState(m)).length;

  // Medicines reserved by prescriptions not yet dispensed
  const reserved = useMemo(() => {
    const r = {};
    db.visits
      .filter((v) => [VISIT_STATUS.PENDING, VISIT_STATUS.AT_DISPENSARY].includes(v.status))
      .forEach((v) => (v.prescriptions || []).forEach((rx) => (r[rx.medicineId] = (r[rx.medicineId] || 0) + Number(rx.qty || 0))));
    return r;
  }, [db.visits]);

  const rows = meds
    .filter((m) => category === "All" || m.category === category)
    .filter((m) => (filter === "low" ? stockState(m).key !== "ok" : filter === "expiring" ? !!expiryState(m) : true))
    .filter((m) => `${m.name} ${m.strength} ${m.form} ${m.batch}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleSubmit = (data) => {
    if (modal.mode === "add") {
      addMedicine(data);
      toast(`${data.name} ${data.strength} added to the dispensary`);
    } else {
      updateMedicine(modal.med.id, data);
      toast(`${data.name} updated`);
    }
    setModal(null);
  };

  return (
    <>
      <PageHeader
        title="Medicines"
        crumbs={["Admin", "Medicines"]}
        description="Medicines added here are available to doctors and the dispensary."
        actions={<Button icon={IoAddCircle} onClick={() => setModal({ mode: "add" })}>Add Medicine</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Medicines" value={meds.length} icon={FaPills} onClick={() => setFilter("all")} active={filter === "all"} />
        <StatCard label="Low / Out of Stock" value={lowCount} icon={IoWarning} accent="amber" onClick={() => setFilter(filter === "low" ? "all" : "low")} active={filter === "low"} />
        <StatCard label={`Expiring ≤ ${EXPIRY_WARNING_DAYS} days`} value={expiringCount} icon={IoTimeOutline} accent="rose" onClick={() => setFilter(filter === "expiring" ? "all" : "expiring")} active={filter === "expiring"} />
        <StatCard label="Units in Stock" value={meds.reduce((s, m) => s + m.stock, 0).toLocaleString()} icon={IoCube} accent="emerald" />
      </div>

      <Card>
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10">
          <CardHeader icon={FaPills} title="Dispensary Stock" subtitle={`${rows.length} of ${meds.length} medicines`} />
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative sm:w-64">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, batch…" className="pl-9" />
            </div>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-48">
              <option value="All">All categories</option>
              {MEDICINE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={FaPills} title={meds.length ? "No medicines match your filters" : "No medicines yet"} action={!meds.length && <Button icon={IoAdd} onClick={() => setModal({ mode: "add" })}>Add Medicine</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 bg-slate-900/40">
                  <th className="px-5 py-3 font-medium">Medicine</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Category</th>
                  <th className="px-5 py-3 font-medium text-right">Stock</th>
                  <th className="px-5 py-3 font-medium text-right hidden lg:table-cell" title="Prescribed but not yet issued">Reserved</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Batch / Expiry</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((m) => {
                  const s = stockState(m);
                  const ex = expiryState(m);
                  return (
                    <tr key={m.id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-100">{m.name} <span className="text-slate-400 font-normal">{m.strength}</span></p>
                        <p className="text-xs text-slate-500">{m.form}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-300 hidden md:table-cell">{m.category}</td>
                      <td className={`px-5 py-3 text-right tabular-nums font-medium ${s.key === "out" ? "text-rose-400" : s.key === "low" ? "text-amber-300" : "text-slate-100"}`}>
                        {m.stock}
                        <p className="text-[11px] text-slate-500 font-normal">reorder ≤ {m.reorderLevel}</p>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-400 hidden lg:table-cell">{reserved[m.id] || "—"}</td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <p className="text-slate-300">{m.batch || "—"}</p>
                        <p className="text-xs text-slate-500">{m.expiry ? formatDate(m.expiry) : "No expiry set"}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">{s.badge}{ex?.badge}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Button size="xs" variant="secondary" icon={IoAdd} onClick={() => setRestock(m)}>Restock</Button>
                          <Button size="icon" variant="ghost" title="Edit" aria-label={`Edit ${m.name}`} onClick={() => setModal({ mode: "edit", med: m })}>
                            <IoCreateOutline />
                          </Button>
                          <Button size="icon" variant="danger-ghost" title="Remove" aria-label={`Remove ${m.name}`} onClick={() => setConfirmDelete(m)}>
                            <IoTrashOutline />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? `Edit ${modal.med.name}` : "Add Medicine"} subtitle="Doctors can prescribe it as soon as it's saved">
        {modal && (
          <MedicineForm
            key={modal.med?.id || "new"}
            isEdit={modal.mode === "edit"}
            initial={modal.mode === "edit" ? { ...EMPTY_FORM, ...modal.med, stock: String(modal.med.stock), reorderLevel: String(modal.med.reorderLevel ?? "") } : EMPTY_FORM}
            existing={meds.filter((m) => m.id !== modal.med?.id)}
            onSubmit={handleSubmit}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      {restock && (
        <RestockModal
          med={restock}
          onClose={() => setRestock(null)}
          onSubmit={({ qty, batch, expiry }) => {
            updateMedicine(restock.id, { stock: restock.stock + qty, batch, expiry });
            toast(`${qty} added — ${restock.name} now has ${restock.stock + qty} in stock`);
            setRestock(null);
          }}
        />
      )}

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        size="sm"
        title={`Remove ${confirmDelete?.name}?`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteMedicine(confirmDelete.id);
                toast(`${confirmDelete.name} removed`, "info");
                setConfirmDelete(null);
              }}
            >
              Remove Medicine
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          Doctors will no longer be able to prescribe it. Past prescriptions keep their record.
          {reserved[confirmDelete?.id] > 0 && (
            <span className="block mt-2 text-amber-300">
              {reserved[confirmDelete.id]} unit(s) are on prescriptions not yet issued.
            </span>
          )}
        </p>
      </Modal>
    </>
  );
}
