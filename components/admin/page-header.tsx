"use client"

import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
        {description && (
          <p className="text-gray-400 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

export function PageHeaderActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {children}
    </div>
  )
}
