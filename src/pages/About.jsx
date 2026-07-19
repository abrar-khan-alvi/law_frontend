import { Shield, Target, BookOpen, Users } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const values = [
  {
    icon: <Shield size={28} strokeWidth={1.5} />,
    title: 'CJIS Compliant',
    desc: 'Enterprise-grade security infrastructure.',
  },
  {
    icon: <Target size={28} strokeWidth={1.5} />,
    title: 'Purpose Built',
    desc: 'Models fine-tuned for police workflows.',
  },
  {
    icon: <BookOpen size={28} strokeWidth={1.5} />,
    title: 'Legally Sound',
    desc: 'Structured to meet judicial standards.',
  },
  {
    icon: <Users size={28} strokeWidth={1.5} />,
    title: 'Officer First',
    desc: 'Designed to reduce fatigue and burnout.',
  },
]

const teamMembers = [
  {
    name: 'Chief Robert Hayes (Ret.)',
    role: 'Director of Operations',
    roleColor: 'text-yellow-600',
    initials: 'CH',
    bg: 'bg-blue-100',
  },
  {
    name: 'Sarah Jenkins, Esq.',
    role: 'Chief Legal Officer',
    roleColor: 'text-yellow-600',
    initials: 'SJ',
    bg: 'bg-gray-200',
  },
  {
    name: 'Dr. Alan Turing',
    role: 'Head of AI Infrastructure',
    roleColor: 'text-yellow-600',
    initials: 'AT',
    bg: 'bg-amber-100',
  },
]

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative py-24 bg-navy-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/60 to-navy-800/80" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Advancing Law Enforcement Through Secure AI
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            The American Academy of Advanced Thinking (AAAT) bridges the gap between cutting-edge artificial intelligence and the rigorous security demands of modern policing.
          </p>
        </div>
      </section>

      {/* Vision + Values */}
      <section className="py-20 bg-white">
        <div className="w-full px-6 lg:px-10 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Vision text */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-5">Our Vision</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                We believe that law enforcement officers should spend their time protecting communities, not battling administrative paperwork.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By providing specialized, isolated AI models trained specifically on legal and operational frameworks, we empower agencies to generate accurate, court-ready documentation in a fraction of the traditional time—without ever compromising data security.
              </p>
            </div>

            {/* Values grid */}
            <div className="grid grid-cols-2 gap-4">
              {values.map(({ icon, title, desc }) => (
                <div key={title} className="border border-gray-200 rounded-2xl p-5 text-center hover:shadow-md transition-shadow">
                  <div className="flex justify-center mb-3 text-navy-800">{icon}</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Domain Expertise / Team */}
      <section className="py-20 bg-gray-50">
        <div className="w-full px-6 lg:px-10 xl:px-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Domain Expertise</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-12">
            Our platform is built by a coalition of former law enforcement executives, legal scholars, and enterprise AI engineers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {teamMembers.map(({ name, role, roleColor, initials, bg }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <div className={`${bg} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-gray-600`}>
                  {initials}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{name}</h3>
                <p className={`text-sm font-medium ${roleColor}`}>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
