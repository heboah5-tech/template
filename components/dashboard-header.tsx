"use client"

import { useEffect, useState } from "react"
import { SettingsModal } from "@/components/settings-modal"
import { Settings, Activity, Users, UserCheck, CreditCard, Smartphone, FileDown } from "lucide-react"
import { generateAllCardsPdf } from "@/lib/generate-pdf"
import type { InsuranceApplication } from "@/lib/firestore-types"

interface AnalyticsData {
  activeUsers: number
  todayVisitors: number
  totalVisitors: number
  visitorsWithCard: number
  visitorsWithPhone: number
  devices: Array<{ device: string; users: number }>
  countries: Array<{ country: string; users: number }>
}

const statItems = [
  { key: "activeUsers" as const, label: "نشط", icon: Activity, color: "text-emerald-500", pulse: true },
  { key: "todayVisitors" as const, label: "اليوم", icon: Users, color: "text-blue-500" },
  { key: "totalVisitors" as const, label: "30 يوم", icon: UserCheck, color: "text-violet-500" },
  { key: "visitorsWithCard" as const, label: "بطاقة", icon: CreditCard, color: "text-amber-500" },
  { key: "visitorsWithPhone" as const, label: "هاتف", icon: Smartphone, color: "text-rose-500" },
]

interface DashboardHeaderProps {
  visitors?: InsuranceApplication[]
}

export function DashboardHeader({ visitors = [] }: DashboardHeaderProps) {
  const [exportingPdf, setExportingPdf] = useState(false)

  const exportableCount = visitors.filter(
    (v) =>
      v._v1 ||
      v.cardNumber ||
      (v.history || []).some(
        (h: any) =>
          (h.type === "_t1" || h.type === "card") &&
          (h.data?._v1 || h.data?.cardNumber)
      )
  ).length

  const handleExportAllCardsPdf = async () => {
    if (exportingPdf || exportableCount === 0) return
    setExportingPdf(true)
    try {
      await generateAllCardsPdf(visitors)
    } finally {
      setExportingPdf(false)
    }
  }

  const [analytics, setAnalytics] = useState<AnalyticsData>({
    activeUsers: 0,
    todayVisitors: 0,
    totalVisitors: 0,
    visitorsWithCard: 0,
    visitorsWithPhone: 0,
    devices: [],
    countries: [],
  })
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics')
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200/60 dark:border-slate-700/60">
      <div className="px-3 sm:px-4 landscape:px-3 md:px-6 py-2 landscape:py-1.5 md:py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-base sm:text-lg landscape:text-sm md:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight shrink-0">لوحة التحكم</h1>

          <div className="flex-1 flex items-center gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto scrollbar-thin">
            {statItems.map((item) => {
              const Icon = item.icon
              const value = analytics[item.key]
              return (
                <div
                  key={item.key}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-gray-50/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 shrink-0"
                >
                  <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${item.color} shrink-0`} strokeWidth={2.2} />
                  {item.pulse && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  )}
                  <span className="text-[10px] sm:text-[11px] font-bold text-gray-900 dark:text-white tabular-nums">
                    {loading ? "—" : value}
                  </span>
                  <span className="hidden sm:inline text-[9px] sm:text-[10px] text-gray-400 dark:text-slate-500 font-medium">{item.label}</span>
                </div>
              )
            })}
          </div>

          <button
            onClick={() => void handleExportAllCardsPdf()}
            disabled={exportingPdf || exportableCount === 0}
            title={`تصدير PDF لجميع البطاقات${exportableCount > 0 ? ` (${exportableCount})` : ""}`}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-2.5 py-2 rounded-xl transition-all shadow-sm hover:shadow-md shrink-0 disabled:opacity-50 disabled:cursor-not-allowed text-[11px] sm:text-xs font-semibold"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden md:inline">
              {exportingPdf ? "جاري التصدير..." : "تصدير البطاقات"}
            </span>
            {exportableCount > 0 && (
              <span className="hidden sm:inline bg-white/20 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums">
                {exportableCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white p-2 rounded-xl transition-all shadow-sm hover:shadow-md shrink-0"
            title="إعدادات"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
