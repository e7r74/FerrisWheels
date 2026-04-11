'use client'
import { useState, useEffect, useRef } from 'react'

const sectors = [
  { p: 'С', name: 'Столицы', color: '#fda4af' }, // розовый
  { p: 'Г', name: 'Государство', color: '#93c5fd' }, // синий
  { p: 'О', name: 'Определение', color: '#86efac' }, // зеленый
  { p: 'К', name: 'Казахстан', color: '#fde047' }, // желтый
  { p: 'П', name: 'Природа', color: '#cda4a5' }, // фиолетовый
  { p: 'Б', name: 'Блиц', color: '#fdba74' }, // оранжевый
  { p: 'Н', name: 'Номенклатура', color: '#7dd3fc' }, // голубой
  { p: 'Ф', name: 'Флаг', color: '#c4b5fd' }, // красный
]

export default function GameWheel() {
  // Ленивая инициализация: данные грузятся один раз
  const [questions, setQuestions] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quizQuestions')
      return saved ? JSON.parse(saved) : sectors.reduce((acc, s) => ({ ...acc, [s.p]: [] }), {})
    }
    return sectors.reduce((acc, s) => ({ ...acc, [s.p]: [] }), {})
  })

  const [rotation, setRotation] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [selectedLetter, setSelectedLetter] = useState('С')

  // Этот флаг нужен только для записи в localStorage после загрузки
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
  }, [])

  useEffect(() => {
    if (mounted.current) {
      localStorage.setItem('quizQuestions', JSON.stringify(questions))
    }
  }, [questions])

  const handleSpin = () => {
    if (isSpinning) return
    setIsSpinning(true)

    // 1. Выбираем сектор
    const prizeIndex = Math.floor(Math.random() * sectors.length)
    const degPerSector = 360 / sectors.length

    // 2. РАСЧЕТ:
    // Мы хотим, чтобы центр сектора был сверху (0 градусов).
    // Сектор находится на позиции (index * degPerSector).
    // Угол поворота должен быть (360 - (index * degPerSector + degPerSector / 2)).
    const targetRotation = 360 - (prizeIndex * degPerSector + degPerSector / 2)

    // 3. Обнуляем накопительный эффект, чтобы не было ошибки при повторных спинах.
    // Мы берем остаток от деления текущего угла на 360, добавляем 5 полных оборотов
    // и прибавляем нужный угол сектора.
    const baseRotation = Math.floor(rotation / 360) * 360
    const finalRotation = baseRotation + 1800 + targetRotation

    setRotation(finalRotation)

    setTimeout(() => {
      const selectedSector = sectors[prizeIndex]
      const list = questions[selectedSector.p]

      if (list?.length > 0) {
        // 1. Выбираем случайный индекс вопроса
        const randomIndex = Math.floor(Math.random() * list.length)
        const q = list[randomIndex]

        // 2. УДАЛЯЕМ выбранный вопрос из списка
        setQuestions((prev) => ({
          ...prev,
          [selectedSector.p]: prev[selectedSector.p].filter((_, i) => i !== randomIndex),
        }))

        setCurrentQuestion({ category: selectedSector.name, question: q })
      } else {
        setCurrentQuestion({ category: selectedSector.name, question: 'В этой категории вопросы закончились!' })
      }

      setIsSpinning(false)
      setShowModal(true)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-6 flex flex-col items-center">
      <h1 className="text-5xl font-black mb-12 text-emerald-400">Колесо Фортуны</h1>

      <div className="relative">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-emerald-400 text-4xl z-20">▼</div>
        <div
          className="w-150 h-150 rounded-full border-[12px] border-stone-800 relative overflow-hidden transition-transform duration-[3s] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(${sectors.map((s, i) => `${s.color} ${i * (360 / sectors.length)}deg ${(i + 1) * (360 / sectors.length)}deg`).join(', ')})`,
          }}>
          {sectors.map((s, i) => (
            <div
              key={i}
              className="absolute w-full h-full flex justify-center pt-6"
              style={{ transform: `rotate(${(360 / sectors.length) * i + 360 / sectors.length / 2}deg)` }}>
              <span className="font-bold text-xl">{s.p}</span>
            </div>
          ))}
        </div>
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="absolute inset-0 m-auto w-20 h-20 bg-stone-900 rounded-full border-4 border-stone-700">
          {isSpinning ? '...' : 'SPIN'}
        </button>
      </div>

      {/* Панель управления */}
      <div className="mt-16 w-full max-w-lg bg-stone-800 p-8 rounded-3xl">
        <select
          className="w-full bg-stone-900 p-4 mb-4 rounded-xl"
          onChange={(e) => setSelectedLetter(e.target.value)}
          value={selectedLetter}>
          {sectors.map((s) => (
            <option key={s.p} value={s.p}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          className="w-full bg-stone-900 p-4 mb-4 rounded-xl"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        <button
          onClick={() => {
            if (!newQuestion.trim()) return
            setQuestions((p) => ({ ...p, [selectedLetter]: [...(p[selectedLetter] || []), newQuestion] }))
            setNewQuestion('')
          }}
          className="w-full bg-emerald-600 py-4 rounded-xl font-bold">
          Добавить
        </button>
      </div>
      {/* ПАНЕЛЬ УПРАВЛЕНИЯ (ДОБАВЛЕНИЕ + УДАЛЕНИЕ) */}
      <div className="mt-16 w-full max-w-lg bg-stone-800/50 backdrop-blur-xl p-8 rounded-3xl border border-stone-700 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-emerald-400">Управление вопросами</h2>

        {/* СПИСОК С КНОПКОЙ УДАЛЕНИЯ (Вот где живет удаление) */}
        <div className="border-t border-stone-700 pt-6">
          <h4 className="font-semibold mb-4 text-stone-300">Список ({selectedLetter}):</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {questions[selectedLetter]?.map((q, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-stone-900 p-3 rounded-lg border border-stone-700">
                <span className="text-sm truncate mr-4">{q}</span>
                <button
                  onClick={() => {
                    setQuestions((prev) => ({
                      ...prev,
                      [selectedLetter]: prev[selectedLetter].filter((_, i) => i !== index),
                    }))
                  }}
                  className="text-red-400 hover:text-red-300 font-bold px-2 py-1">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
          onClick={() => setShowModal(false)}>
          <div className="bg-stone-800 p-10 rounded-3xl text-center">
            <h3 className="text-emerald-400 font-bold uppercase">{currentQuestion.category}</h3>
            <p className="text-3xl mt-4">{currentQuestion.question}</p>
          </div>
        </div>
      )}
    </div>
  )
}
