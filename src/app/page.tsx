'use client'

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import questionsDataRaw from '../../config/questions.json'

interface Question {
  uuid: number
  question: string
  options?: string[]
  type: 'select' | 'text'
  name: string
}

interface QuestionsData {
  es: Question[]
  en: Question[]
}

const typedQuestionsData: QuestionsData = {
  es: questionsDataRaw.es.map((q) => ({
    ...q,
    type: q.type as 'select' | 'text',
  })),
  en: questionsDataRaw.en.map((q) => ({
    ...q,
    type: q.type as 'select' | 'text',
  })),
}

export default function Home() {
  const { t, i18n } = useTranslation()
  const [randomQuestions, setRandomQuestions] = useState<Question[]>([])
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en')
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [invalidFields, setInvalidFields] = useState<string[]>([])

  useEffect(() => {
    loadQuestions(selectedLanguage)
  }, [selectedLanguage])

  const loadQuestions = (language: string) => {
    const questions =
      typedQuestionsData[language as keyof QuestionsData] ||
      typedQuestionsData['en']
    const shuffled: Question[] = [...questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
    setRandomQuestions(shuffled)

    const initialFormData: Record<string, string> = {}
    shuffled.forEach((q) => (initialFormData[q.name] = ''))
    setFormData(initialFormData)
    setIsFormValid(false)
    setInvalidFields([])
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value }
    setFormData(newFormData)
    validateForm(newFormData)
  }

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value
    setSelectedLanguage(newLanguage)
    i18n.changeLanguage(newLanguage)
    loadQuestions(newLanguage)
  }

  const validateForm = (data: Record<string, string>) => {
    const emptyFields = randomQuestions
      .filter((q) => !data[q.name] || data[q.name].trim() === '')
      .map((q) => q.name)

    setInvalidFields(emptyFields)
    setIsFormValid(emptyFields.length === 0)
  }

  const scrollToFirstInvalidField = () => {
    if (invalidFields.length > 0) {
      const firstInvalidField = document.querySelector(
        `[name="${invalidFields[0]}"]`
      )
      if (firstInvalidField) {
        firstInvalidField.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
        ;(firstInvalidField as HTMLElement).focus()
      }
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    validateForm(formData)

    if (!isFormValid) {
      scrollToFirstInvalidField()
      return
    }

    const response = await fetch('https://mi-api-fastapi.com/submit-symptom/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const data = await response.json()
    alert(data.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-5xl w-full">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
          {t('Datos Reales Sobre Síntomas Comunes: ¿Te Sumarías?')}
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          {t(
            'Tu experiencia puede ayudar a comprender mejor los síntomas más frecuentes. Participa en este breve cuestionario anónimo y contribuye a un estudio sobre la salud y el bienestar. ¡Solo toma 2 minutos!'
          )}
        </p>

        <div className="mb-6 flex justify-end items-center">
          <label className="mr-2 text-gray-700">🌍 {t('language')}</label>
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {randomQuestions.map((pregunta, index) => (
            <div
              key={pregunta.uuid}
              className={`bg-gray-50 p-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 ${
                invalidFields.includes(pregunta.name)
                  ? 'border-2 border-red-500'
                  : ''
              }`}
            >
              <h2 className="text-xl font-semibold mb-4 text-orange-600">
                Pregunta {index + 1}
              </h2>
              <label className="block text-gray-700 text-lg mb-2">
                {pregunta.question}
              </label>
              {pregunta.type === 'text' ? (
                <input
                  type="text"
                  name={pregunta.name}
                  onChange={handleChange}
                  value={formData[pregunta.name] || ''}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                />
              ) : (
                <select
                  name={pregunta.name}
                  onChange={handleChange}
                  value={formData[pregunta.name] || ''}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                >
                  <option value="">
                    {selectedLanguage === 'es'
                      ? 'Selecciona una opción...'
                      : 'Select an option...'}
                  </option>
                  {pregunta.options?.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
          <div className="flex flex-row justify-center">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700 transition duration-300 ease-in-out transform hover:scale-105 ${
                !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
