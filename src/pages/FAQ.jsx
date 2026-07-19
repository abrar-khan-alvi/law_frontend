import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const faqs = [
  {
    id: 1,
    question: 'Is the AAAT platform CJIS compliant?',
    answer:
      "Yes. Our infrastructure is built from the ground up to meet and exceed Criminal Justice Information Services (CJIS) security policies. Data is encrypted at rest and in transit, and we utilize dedicated, isolated tenant environments.",
  },
  {
    id: 2,
    question: "Will our department's case data be used to train public AI models?",
    answer:
      "Absolutely not. AAAT operates on isolated, private infrastructure. Your case data never leaves your secure tenant environment and is never used for model training or improvement of any shared model.",
  },
  {
    id: 3,
    question: 'How accurate are the generated legal documents?',
    answer:
      "Our AI models are fine-tuned specifically on law enforcement and legal frameworks, achieving industry-leading accuracy. All documents should still be reviewed by the officer before submission, as you are the subject matter expert on your case facts.",
  },
  {
    id: 4,
    question: 'What happens if a user hits their monthly document save limit?',
    answer:
      "Users on the Patrol plan receive a notification when they reach 80% of their limit. Upon reaching the limit, you can still draft documents but won't be able to save new ones until the next billing cycle or until you upgrade to the Detective plan.",
  },
  {
    id: 5,
    question: 'Can we integrate this with our existing RMS (Records Management System)?',
    answer:
      "Yes — Department-tier subscribers have access to our API integration suite which supports connections to most major RMS platforms. Our integration team will work with your IT department to establish a secure data pipeline.",
  },
]

function FAQItem({ faq }) {
  const [open, setOpen] = useState(faq.id === 1)

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-gray-50 transition-colors"
        aria-expanded={open}
        id={`faq-btn-${faq.id}`}
      >
        <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
        {open ? (
          <ChevronUp size={18} className="text-gray-500 shrink-0" />
        ) : (
          <ChevronDown size={18} className="text-gray-500 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-5 bg-white">
          <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <section className="pt-16 pb-8 bg-white text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Details on security, training data reliability, and subscription mechanics.
        </p>
      </section>

      {/* FAQ Accordion */}
      <section className="py-10 bg-white flex-1">
        <div className="w-full max-w-2xl mx-auto px-6 lg:px-10 xl:px-16 space-y-4">
          {faqs.map((faq) => (
            <FAQItem key={faq.id} faq={faq} />
          ))}
        </div>
      </section>

      {/* CTA link to pricing */}
      <div className="text-center py-12 bg-white">
        <p className="text-gray-500 mb-2">Have more questions about billing or compliance?</p>
        <Link to="/pricing" className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
          View our Pricing Plans →
        </Link>
      </div>

      <Footer />
    </div>
  )
}
