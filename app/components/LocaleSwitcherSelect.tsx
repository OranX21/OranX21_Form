'use client'

import React from 'react'

interface LocaleSwitcherSelectProps {
  defaultValue: string
  label: string
  children: React.ReactNode
}

export default function LocaleSwitcherSelect({
  defaultValue,
  label,
  children,
}: LocaleSwitcherSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="locale-switcher" className="text-sm">
        {label}
      </label>
      <select
        id="locale-switcher"
        defaultValue={defaultValue}
        onChange={(e) => {
          const newLocale = e.target.value
          window.location.href = `/${newLocale}`
        }}
        className="p-2 border rounded-md"
      >
        {children}
      </select>
    </div>
  )
}
