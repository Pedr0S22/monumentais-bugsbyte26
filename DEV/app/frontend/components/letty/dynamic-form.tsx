"use client"

import { useState, useCallback, type FormEvent } from "react"

export interface FormField {
  id: string
  label: string
  type: "text" | "number" | "select" | "textarea" | "date" | "checkbox"
  placeholder?: string
  options?: { label: string; value: string }[]
  required?: boolean
}

interface DynamicFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, string | boolean>) => void
  submitLabel?: string
  title?: string
}

export function DynamicForm({ fields, onSubmit, submitLabel = "Enviar", title }: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, string | boolean>>({})

  const handleChange = useCallback((id: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [id]: value }))
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
      {fields.map((field) => (
        <div key={field.id} className="flex flex-col gap-1">
          <label htmlFor={field.id} className="text-xs font-medium text-muted-foreground">
            {field.label}
            {field.required && <span className="text-destructive"> *</span>}
          </label>

          {field.type === "select" ? (
            <select
              id={field.id}
              value={(values[field.id] as string) || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              required={field.required}
            >
              <option value="">{field.placeholder || "Selecionar..."}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              id={field.id}
              placeholder={field.placeholder}
              value={(values[field.id] as string) || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              rows={3}
              required={field.required}
            />
          ) : field.type === "checkbox" ? (
            <label className="flex items-center gap-2" htmlFor={field.id}>
              <input
                id={field.id}
                type="checkbox"
                checked={(values[field.id] as boolean) || false}
                onChange={(e) => handleChange(field.id, e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary accent-primary"
              />
              <span className="text-sm text-foreground">{field.placeholder}</span>
            </label>
          ) : (
            <input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={(values[field.id] as string) || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              required={field.required}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="mt-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
      >
        {submitLabel}
      </button>
    </form>
  )
}
