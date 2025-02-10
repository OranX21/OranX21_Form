'use client'

import { useDispatch, useSelector } from 'react-redux'
import { routing } from '../../i18n/routing'
import { RootState } from '../../lib/store'
import { setLanguage } from '../../slices/languageSlice'

export default function LocaleSwitcher() {
  const dispatch = useDispatch()
  const locale = useSelector((state: RootState) => state.language.language)

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setLanguage(e.target.value))
  }

  return (
    <div>
      <label className="mr-2">🌍 Language:</label>
      <select
        value={locale}
        onChange={handleLanguageChange}
        className="border border-gray-300 rounded-lg px-3 py-2"
      >
        {routing.locales.map((cur) => (
          <option key={cur} value={cur}>
            {cur === 'en' ? 'English' : 'Español'}
          </option>
        ))}
      </select>
    </div>
  )
}
