import React, { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'

import { textStyles } from '../../themes/text-styles'
import { TriangleDownSvg } from '../svg/triangle-down-svg'
import { Decimals } from '../../model/decimals'

export default function DecimalsSelector({
  availableDecimalPlacesGroups,
  value,
  onValueChange,
}: {
  availableDecimalPlacesGroups: Decimals[]
  value: Decimals
  onValueChange: (value: Decimals) => void
}) {
  return (
    <Listbox value={value} onChange={onValueChange}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="flex items-center gap-0.5">
              <span className={`${textStyles.body4} text-white`}>
                {value.label}
              </span>
              <span className="">
                <TriangleDownSvg />
              </span>
            </Listbox.Button>

            <Transition show={open} as={Fragment}>
              <Listbox.Options className="absolute z-[1500] top-6 right-0 mt-0 min-w-[4rem] p-0 bg-gray-700 rounded">
                {availableDecimalPlacesGroups.map((value, index) => (
                  <Listbox.Option
                    key={index}
                    className={`py-2 px-3 text-right text-white ${textStyles.body4} hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg`}
                    value={value}
                  >
                    <span>{value.label}</span>
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}
