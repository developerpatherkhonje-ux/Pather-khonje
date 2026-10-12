import React from "react";

export const buildCustomFields = (definitions = [], existing = [], invoiceType = "") => {
  const existingMap = new Map((existing || []).map((field) => [field.key || field.label, field]));
  return (definitions || [])
    .filter((field) => field.enabled !== false)
    .filter((field) => !field.appliesTo?.length || field.appliesTo.includes(invoiceType))
    .map((field) => {
      const saved = existingMap.get(field.key || field.label) || {};
      return {
        key: field.key || field.label,
        label: field.label || field.key || "Custom Field",
        type: field.type || "text",
        required: Boolean(field.required),
        options: field.options || [],
        value: saved.value ?? "",
      };
    });
};

function CustomInvoiceFields({ fields = [], onChange }) {
  if (!fields.length) return null;

  const inputClass = "w-full rounded-lg border px-4 py-3";

  return (
    <div className="border rounded-xl">
      <div className="px-4 py-3 border-b font-semibold">Custom Invoice Fields</div>
      <div className="grid gap-4 p-4 md:grid-cols-2">
        {fields.map((field, index) => {
          const commonProps = {
            className: inputClass,
            value: field.value ?? "",
            required: field.required,
            onChange: (event) => onChange(index, event.target.value),
          };

          return (
            <label key={field.key || `${field.label}-${index}`} className="block">
              <span className="mb-1 block text-xs font-medium text-gray-600">
                {field.label}{field.required ? " *" : ""}
              </span>
              {field.type === "textarea" ? (
                <textarea rows={3} {...commonProps} />
              ) : field.type === "select" ? (
                <select {...commonProps}>
                  <option value="">Select</option>
                  {(field.options || []).filter(Boolean).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} {...commonProps} />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default CustomInvoiceFields;
