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
  parent?: string
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
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en')
  const [questions, setQuestions] = useState<Question[]>([])
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [invalidFields, setInvalidFields] = useState<string[]>([])

  useEffect(() => {
    loadQuestions(selectedLanguage)
  }, [selectedLanguage])

  const loadQuestions = (language: string) => {
    const fullQuestions =
      typedQuestionsData[language as keyof QuestionsData] ||
      typedQuestionsData['en']
    const mainQuestion = fullQuestions.find((q) => !q.parent)
    if (mainQuestion) {
      setQuestions([mainQuestion])
      setFormData({ [mainQuestion.name]: '' })
    }
    setIsFormValid(false)
    setInvalidFields([])
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    const newFormData = { ...formData, [name]: value }
    setFormData(newFormData)

    if (name === 'reported_symptoms') {
      updateFollowUpQuestions()
    }
    validateForm(newFormData)
  }

  const updateFollowUpQuestions = () => {
    const language = selectedLanguage as keyof QuestionsData
    const fullQuestions = typedQuestionsData[language]

    // Obtener la pregunta principal
    const mainQuestion = fullQuestions.find(
      (q) => q.name === 'reported_symptoms'
    )

    // Filtrar todas las preguntas de seguimiento
    const followUpQuestions = fullQuestions.filter(
      (q) => q.parent === 'reported_symptoms'
    )

    // Actualizar el estado de las preguntas para incluir la principal + las secundarias
    if (mainQuestion) {
      setQuestions([mainQuestion, ...followUpQuestions])
    }

    // Limpiar respuestas previas de preguntas secundarias
    setFormData((prev) => {
      const newFormData = { ...prev }
      followUpQuestions.forEach((q) => {
        newFormData[q.name] = ''
      })
      return newFormData
    })
  }

  const validateForm = (data: Record<string, string>) => {
    const emptyFields = questions
      .filter((q) => !data[q.name] || data[q.name].trim() === '')
      .map((q) => q.name)
    setInvalidFields(emptyFields)
    setIsFormValid(emptyFields.length === 0)
  }

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value
    setSelectedLanguage(newLanguage)
    i18n.changeLanguage(newLanguage)
    loadQuestions(newLanguage)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    validateForm(formData)

    if (!isFormValid) return

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
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-5xl w-full">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
          {t('Datos Reales Sobre Síntomas Comunes: ¿Te Sumarías?')}
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          {t(
            'Tu experiencia puede ayudar a comprender mejor los síntomas más frecuentes. ¡Solo toma 2 minutos!'
          )}
        </p>

        <div className="mb-6 flex justify-end items-center">
          <label className="mr-2 text-gray-700">🌍 {t('language')}</label>
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={question.uuid}
              className={`bg-gray-50 p-6 rounded-lg shadow-md ${
                invalidFields.includes(question.name)
                  ? 'border-2 border-red-500'
                  : ''
              }`}
            >
              <h2 className="text-xl font-semibold mb-4 text-orange-600">
                Pregunta {index + 1}
              </h2>
              <label className="block text-gray-700 text-lg mb-2">
                {question.question}
              </label>
              {question.type === 'text' ? (
                <input
                  type="text"
                  name={question.name}
                  onChange={handleChange}
                  value={formData[question.name] || ''}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300"
                />
              ) : (
                <select
                  name={question.name}
                  onChange={handleChange}
                  value={formData[question.name] || ''}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300"
                >
                  <option value="">Selecciona una opción...</option>
                  {question.options?.map((option, index) => (
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
            className="bg-orange-600 text-white font-bold py-3 px-8 rounded-full hover:bg-orange-700"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}
