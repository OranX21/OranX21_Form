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

  useEffect(() => {
    const browserLanguage = navigator.language.startsWith('es') ? 'es' : 'en'
    setSelectedLanguage(browserLanguage)
    const questions =
      typedQuestionsData[browserLanguage as keyof QuestionsData] ||
      typedQuestionsData['es']
    const shuffled: Question[] = [...questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
    setRandomQuestions(shuffled)
  }, [])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value
    setSelectedLanguage(newLanguage)
    i18n.changeLanguage(newLanguage)
    const questions =
      typedQuestionsData[newLanguage as keyof QuestionsData] ||
      typedQuestionsData['en']
    const shuffled: Question[] = [...questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
    setRandomQuestions(shuffled)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const response = await fetch('https://mi-api-fastapi.com/submit-symptom/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    const data = await response.json()
    alert(data.message)
  }

  return (
    <div className="container">
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>

      <label>🌍 {t('language')}</label>
      <select value={selectedLanguage} onChange={handleLanguageChange}>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>

      <form onSubmit={handleSubmit}>
        {randomQuestions.map((pregunta) => (
          <div key={pregunta.uuid}>
            <label>{pregunta.question}</label>
            {pregunta.type === 'text' ? (
              <input
                type="text"
                name={pregunta.name}
                onChange={handleChange}
                required
              />
            ) : (
              <select name={pregunta.name} onChange={handleChange} required>
                {pregunta.options?.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
        <button type="submit">Enviar</button>
      </form>
    </div>
  )
}
