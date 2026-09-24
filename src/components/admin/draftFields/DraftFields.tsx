"use client";

import { useId } from "react";

import type { AdminRecord } from "../adminModels";
import type { InlineField } from "../inlineFields/InlineFields";

import "../inlineFields/_inlineFields.scss";

export default function DraftFields({
  record,
  fields,
  onChange,
}: {
  record: AdminRecord;
  fields: InlineField[];
  onChange: (name: string, value: AdminRecord[string]) => void;
}) {
  const id = useId();
  return (
    <div className="inlineFieldsContent">
      {fields.map((field) => {
        const inputId = `${id}-${field.name}`;
        return (
          <div
            key={field.name}
            className={`inlineField${field.full ? " inlineFieldFull" : ""}${field.type === "checkbox" ? " inlineFieldCheck" : ""}`}
          >
            <label htmlFor={inputId}>{field.label}</label>
            {field.type === "checkbox" ? (
              <input
                id={inputId}
                type="checkbox"
                checked={Boolean(record[field.name])}
                onChange={(event) => onChange(field.name, event.target.checked)}
              />
            ) : field.type === "textarea" ? (
              <textarea
                id={inputId}
                required={!field.optional}
                rows={3}
                value={String(record[field.name] ?? "")}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            ) : (
              <input
                id={inputId}
                required={!field.optional}
                type={field.type ?? "text"}
                min={field.type === "number" ? 0 : undefined}
                step={field.step ?? "1"}
                placeholder={field.placeholder}
                value={String(record[field.name] ?? "")}
                onChange={(event) =>
                  onChange(
                    field.name,
                    field.type === "number"
                      ? event.target.value === ""
                        ? null
                        : Number(event.target.value)
                      : event.target.value,
                  )
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
