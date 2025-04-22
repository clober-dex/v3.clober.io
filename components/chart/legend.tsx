import React from 'react'
import BigNumber from 'bignumber.js'

export type LegendInfo = { label: string; color: string; value: string }

export function Legend({ data }: { data: LegendInfo[] }) {
  return (
    <div
      id="protocolGraphLegend"
      className="bg-gray-600 absolute top-[100px] pointer-events-none p-2 gap-1.5 rounded-xl border shadow-lg z-50 w-fit"
    >
      {data.map(({ value: display, label, color }) => {
        return (
          !!display &&
          !BigNumber(display).isZero() && (
            <div
              className="flex text-xs lg:text-sm px-2 items-center gap-2 text-nowrap"
              key={label}
            >
              <div>{label}</div>
              <div className="w-2 h-2" style={{ backgroundColor: color }} />
              <div>{display}</div>
            </div>
          )
        )
      })}
    </div>
  )
}
