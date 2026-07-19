import { Link } from 'react-router-dom'
import { Shield, Lock, Server, Zap, CheckCircle, FileText, Search, BookOpen } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const modules = [
  {
    icon: <FileText size={28} className="text-blue-600" />,
    iconBg: 'bg-blue-50',
    title: 'AI Incident Reports',
    description:
      'Input the Who, What, When, Where, Why, and How. The engine drafts a chronological, professional narrative in either first or third person.',
  },
  {
    icon: <Search size={28} className="text-yellow-500" />,
    iconBg: 'bg-yellow-50',
    title: 'AI Search Warrants',
    description:
      'Structure probable cause statements with precision. Specialized prompts ensure all necessary legal elements are present for judicial review.',
  },
  {
    icon: <BookOpen size={28} className="text-teal-500" />,
    iconBg: 'bg-teal-50',
    title: 'AI Arrest Warrants',
    description:
      'Compile suspect details, witness statements, and evidence into a cohesive affidavit supporting the issuance of an arrest warrant.',
  },
]

const whyPoints = [
  {
    icon: <Lock size={20} className="text-blue-600" />,
    title: 'Absolute Confidentiality',
    desc: 'Zero data retention for model training. Your case facts never leave your secure tenant.',
  },
  {
    icon: <Server size={20} className="text-blue-600" />,
    title: 'CJIS Compliant Architecture',
    desc: 'Built to meet the stringent security requirements of law enforcement agencies.',
  },
  {
    icon: <Zap size={20} className="text-blue-600" />,
    title: 'Operational Efficiency',
    desc: 'Reduce report writing time by up to 70%, keeping officers on patrol, not behind desks.',
  },
  {
    icon: <CheckCircle size={20} className="text-blue-600" />,
    title: 'Specialized Police Workflows',
    desc: 'Models fine-tuned specifically on legal phrasing and law enforcement reporting standards.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero — full viewport height minus navbar (h-16 = 64px) */}
      <section className="relative flex items-center overflow-hidden bg-gray-900" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <img
          src="/assets/home.png"
          alt="Police officer using AAAT platform"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/50 to-transparent" />
        <div className="relative z-10 w-full px-6 lg:px-10 xl:px-16 py-24">
          <div className="max-w-2xl xl:max-w-3xl">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-sm font-semibold px-4 py-2 rounded-full mb-8">
              <Shield size={14} />
              Enterprise-Grade Security
            </span>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-8 tracking-tight">
              Secure, AI-Powered<br />Law Enforcement<br />Documentation
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl lg:text-2xl leading-relaxed mb-10 max-w-2xl">
              Transform hours of paperwork into minutes. Generate structured, legally sound incident reports and warrants using isolated AI models designed exclusively for police workflows.
            </p>


            <div className="flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-lg transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/pricing"
                className="border border-white/40 text-white font-semibold px-7 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                Start Subscription
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules */}
      <section className="py-20 bg-white">
        <div className="w-full px-6 lg:px-10 xl:px-16">
          <div className="text-center mb-12">
            <p className="section-tag text-blue-600 mb-2">Powerful Tools</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Core Operational Modules</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Purpose-built AI tools that guide officers through structured fact collection to produce comprehensive, court-ready narratives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map(({ icon, iconBg, title, description }) => (
              <div key={title} className="card">
                <div className={`${iconBg} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                  {icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Specialized AI Matters */}
      <section className="py-20 bg-gray-50">
        <div className="w-full px-6 lg:px-10 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Why Specialized{' '}
                <span className="text-blue-600">AI Matters</span>
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Public AI models train on your inputs, exposing sensitive case data. The AAAT platform is built on isolated, secure infrastructure ensuring your department's data remains strictly confidential.
              </p>
              <ul className="space-y-5">
                {whyPoints.map(({ icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-4">
                    <span className="mt-0.5 shrink-0">{icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/assets/why_specialized_aI_matters.png"
                alt="Police officer at command center using AAAT"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: '#1a3880', minHeight: '450px' }}
      >
        <div className="flex flex-col lg:flex-row items-center relative min-h-[450px]">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 px-6 lg:px-10 xl:px-16 pt-16 pb-8 lg:py-16 relative z-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
                Ready to modernize your department's workflow?
              </h2>
              <p className="text-blue-200 text-base sm:text-lg mb-8">
                Join the forward-thinking agencies reducing administrative burden and improving documentation quality.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/pricing"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg transition-colors"
                >
                  View Subscription Plans
                </Link>
                <Link
                  to="/contact"
                  className="border border-white/40 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Contact Sales Team
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Aesthetic Mockup */}
          <div className="w-full lg:w-1/2 flex justify-center lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 pointer-events-none pb-12 lg:pb-0 z-0">
            <div className="w-full px-6 lg:px-0 flex justify-center lg:block" style={{ maxWidth: '850px' }}>
              <img
                src="/assets/blue_bg_dashboard_mockup_1781562999749.png"
                alt="AAAT platform dashboard on laptop and mobile"
                className="w-full h-auto object-contain transform lg:translate-x-12"
              />
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  )
}
