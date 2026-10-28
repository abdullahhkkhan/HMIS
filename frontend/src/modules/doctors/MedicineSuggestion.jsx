// Module 3 — Medicine Suggestion (prescription sent to the dispensary)
import React from "react";
import { useHmis } from "../../store/HmisStore";
import PrescriptionEditor from "../../components/forms/PrescriptionEditor";

export default function MedicineSuggestion({ rows, onChange, noMeds, onNoMedsChange, errors, readOnly }) {
  const { db, medicineById } = useHmis();
  const inStock = [...db.medicines].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      {!readOnly && (
        <label className="inline-flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={noMeds}
            onChange={(e) => onNoMedsChange(e.target.checked)}
            className="h-4 w-4 rounded accent-blue-500 cursor-pointer"
          />
          No medicines required for this visit
        </label>
      )}
      {!noMeds && (
        <PrescriptionEditor
          rows={rows}
          onChange={onChange}
          medicines={inStock}
          medicineById={medicineById}
          errors={errors}
          readOnly={readOnly}
        />
      )}
      {noMeds && !readOnly && (
        <p className="text-sm text-slate-500">
          The visit will be marked <b className="text-slate-300">Completed</b> on confirmation instead of going to the dispensary.
        </p>
      )}
    </div>
  );
}
