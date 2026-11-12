import { useState } from 'react'
import { MessagesSquare, Send, Sparkles } from 'lucide-react'


const AI_API_URL = 'http://localhost:3000/api/agent'


const SUGGESTED_QUESTIONS = [
  'How does the currency cushion affect my client price?',
  'What costs are included in my estimated INR?',
  'How do I choose a cushion percentage?',
]


export default function AiPage() {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Ask a question about pricing, cushions, or estimated deductions. This preview provides general explanations only.',
    },
  ])


  function handleQuestionChange(event) {
    setQuestion(event.target.value)
  }


  async function handleSubmit(event) {
    event.preventDefault()


    const trimmedQuestion = question.trim()


    if (trimmedQuestion === '' || isLoading) {
      return
    }


    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: 'user',
        text: trimmedQuestion,
      },
    ])


    setQuestion('')
    setIsLoading(true)


    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedQuestion,
        }),
      })


      if (!response.ok) {
        throw new Error('The AI service is unavailable right now. Please try again.')
      }


      const data = await response.json()


      const reply =
        data.reply ||
        data.response ||
        data.message ||
        data.answer ||
        data.text ||
        'I received your question, but could not generate a response.'


      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          text: reply,
        },
      ])
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          text: error.message,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }


  function handleSuggestedQuestion(value) {
    setQuestion(value)
  }


  return (
    <section className="max-w-6xl">
      <p className="text-xs uppercase tracking-[0.18em] text-[#9AA8BC]">
        Vyapaar IQ AI
      </p>


      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Ask about your pricing.
      </h1>


      <p className="mt-4 max-w-2xl text-lg text-[#9AA8BC]">
        Get plain-language explanations for cushions, client prices, and
        estimated deductions.
      </p>


      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="flex min-h-[520px] flex-col rounded-3xl border border-[#29354D] bg-[#141D33] p-6 sm:p-8">
          <div className="flex-1 space-y-5">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'ml-auto bg-[#F5A623] text-[#0B1020]'
                    : 'border border-[#29354D] bg-[#10172A] text-[#DCE4F0]'
                }`}
              >
                {message.text}
              </div>
            ))}


            {isLoading ? (
              <div className="max-w-[85%] rounded-2xl border border-[#29354D] bg-[#10172A] px-5 py-4 text-sm leading-relaxed text-[#9AA8BC]">
                Thinking…
              </div>
            ) : null}
          </div>


          <form
            onSubmit={handleSubmit}
            className="mt-6 flex items-center gap-3 rounded-2xl border border-[#29354D] bg-[#10172A] px-4 py-3 focus-within:border-[#F5A623]"
          >
            <input
              type="text"
              value={question}
              onChange={handleQuestionChange}
              placeholder="Ask about your pricing..."
              aria-label="Ask Vyapaar IQ AI a question"
              disabled={isLoading}
              className="w-full bg-transparent text-[#DCE4F0] outline-none placeholder:text-[#9AA8BC] disabled:opacity-60"
            />


            <button
              type="submit"
              aria-label="Send question"
              disabled={isLoading}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5A623] text-[#0B1020] transition hover:bg-[#FFB843] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={18} />
            </button>
          </form>
        </div>


        <aside className="rounded-3xl border border-[#29354D] bg-[#141D33] p-6 sm:p-8">
          <div className="inline-flex rounded-2xl border border-[#29354D] bg-[#10172A] p-4 text-[#F5A623]">
            <MessagesSquare size={28} />
          </div>


          <h2 className="mt-6 text-xl font-semibold tracking-tight">
            Suggested questions
          </h2>


          <div className="mt-5 space-y-3">
            {SUGGESTED_QUESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestedQuestion(suggestion)}
                className="w-full rounded-2xl border border-[#29354D] bg-[#10172A] px-4 py-4 text-left text-sm text-[#DCE4F0] transition hover:bg-[#19243B]"
              >
                {suggestion}
              </button>
            ))}
          </div>


          <div className="mt-8 rounded-2xl border border-[#29354D] bg-[#10172A] p-5">
            <div className="flex items-center gap-2 text-[#F5A623]">
              <Sparkles size={18} />
              <p className="text-sm font-medium">Connected AI</p>
            </div>


            <p className="mt-3 text-sm leading-relaxed text-[#9AA8BC]">
              Vyapaar IQ AI provides general explanations only. It does not
              provide financial, tax, or investment advice.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}