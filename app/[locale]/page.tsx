'use client'

import { useLocale, useTranslations } from 'next-intl'
import { ChangeEvent, FormEvent, useState } from 'react'
import questionsDataRaw from '../../config/firstQuestionsForm.json'

interface Question {
  uuid: number
  question: string
  options?: string[]
  type: 'select' | 'text'
  name: string
  parent?: string
}

interface QuestionsData {
  es: Question[]
  en: Question[]
}

const questionsData: QuestionsData = questionsDataRaw as QuestionsData

export default function HomePage() {
  const t = useTranslations('HomePage')
  const locale = useLocale() as keyof QuestionsData

  const questions = questionsData[locale] || questionsData['en']

  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    const updatedFormData = { ...formData, [name]: value }
    setFormData(updatedFormData)
    validateForm(updatedFormData)
  }

  const validateForm = (data: Record<string, string>) => {
    setIsFormValid(Object.values(data).every((value) => value.trim() !== ''))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isFormValid) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/submit-symptom/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )
      const data = await response.json()
      alert(data.message)
    } catch (error) {
      console.error('Error al enviar el formulario:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full">
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
        <p className="text-gray-600 mb-6">{t('description')}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q) => (
            <div key={q.uuid} className="mb-4">
              <label
                htmlFor={q.name}
                className="block text-sm font-medium text-gray-700"
              >
                {q.question}
              </label>
              {q.type === 'text' ? (
                <input
                  type="text"
                  name={q.name}
                  id={q.name}
                  onChange={handleChange}
                  value={formData[q.name] || ''}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              ) : (
                <select
                  id={q.name}
                  name={q.name}
                  onChange={handleChange}
                  value={formData[q.name] || ''}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">
                    {locale === 'es'
                      ? 'Selecciona una opción...'
                      : 'Select an option...'}
                  </option>
                  {q.options?.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2 px-4 bg-blue-500 text-white rounded-md ${
              !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {t('submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
