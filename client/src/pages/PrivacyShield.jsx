import Layout from '../components/Layout'

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: 'ri-shield-check-fill',
      title: 'I. Data Governance',
      content: 'JankariTag collects only the information necessary for asset registration and identity services. This includes your name, email, phone, and QR-linked asset details. We adhere to a "minimum viable data" principle.'
    },
    {
      icon: 'ri-lock-2-fill',
      title: 'II. Security Protocols',
      content: 'All data is secured using industry-standard encryption (AES-256 at rest, TLS 1.3 in transit). Database access is restricted to authenticated personnel with role-based access control.'
    },
    {
      icon: 'ri-share-circle-fill',
      title: 'III. Data Sharing',
      content: 'We do not sell, rent, or trade your personal data with third parties. Information is only shared when legally required (court orders, regulatory compliance), or with your explicit consent.'
    },
    {
      icon: 'ri-database-2-fill',
      title: 'IV. Data Retention',
      content: 'We retain your data as long as your account is active. Upon account deletion, personally identifiable information is purged within 30 days. Anonymous analytics data may be retained for product improvement.'
    },
    {
      icon: 'ri-cookie-fill',
      title: 'V. Cookies & Tracking',
      content: 'We do not use invasive cookies. Only essential session cookies for authentication and functionality are stored. No third-party tracking scripts or advertising cookies are deployed.'
    },
    {
      icon: 'ri-user-settings-fill',
      title: 'VI. Your Rights',
      content: 'You have the right to access, modify, export, or delete your data at any time through your profile settings. Contact support@jankaritag.com for data portability requests.'
    }
  ]

  return (
    <Layout>
      <div className="bg-white min-h-screen py-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="w-16 h-16 rounded-sm bg-black flex items-center justify-center mx-auto mb-5 border-2 border-black shadow-[4px_4px_0px_#ea580c]">
              <i className="ri-shield-user-fill text-3xl text-orange-600"></i>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-black tracking-tight mb-3">Privacy Shield</h1>
            <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-widest">Last Updated: February 2026</p>
          </div>

          {/* Intro */}
          <div className="brutal-card p-8 md:p-10 mb-10 animate-fade-in-up">
            <p className="text-neutral-600 text-[14px] leading-relaxed font-medium">
              JankariTag is committed to protecting your privacy and ensuring the security of your personal information. 
              This policy outlines how we collect, use, store, and protect your data when you use our asset identification services.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6 animate-fade-in-up">
            {sections.map((section, i) => (
              <div key={i} className="brutal-card p-8 group">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 min-w-12 rounded-sm bg-white flex items-center justify-center text-orange-600 border-2 border-black shadow-[3px_3px_0px_#0D0D0D] group-hover:shadow-[5px_5px_0px_#ea580c] transition-all">
                    <i className={`${section.icon} text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="font-black text-black text-lg tracking-tight mb-3">{section.title}</h3>
                    <p className="text-neutral-500 text-[13px] font-medium leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Advisory */}
          <div className="border-2 border-orange-600 rounded-sm p-8 mt-12 bg-orange-600/5 animate-fade-in-up">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 min-w-10 rounded-sm bg-orange-600 text-white flex items-center justify-center">
                <i className="ri-information-fill text-xl"></i>
              </div>
              <div>
                <h4 className="font-black text-black text-sm uppercase tracking-widest mb-2">Compliance Notice</h4>
                <p className="text-neutral-500 text-[13px] font-medium leading-relaxed">
                  For questions, data requests, or concerns about this privacy policy, contact our Data Protection Officer at{' '}
                  <a href="mailto:support@jankaritag.com" className="text-orange-600 font-bold underline underline-offset-4 decoration-2">support@jankaritag.com</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
