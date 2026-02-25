import Layout from '../components/Layout'

export default function TermsAndConditions() {
  const sections = [
    {
      icon: 'ri-file-text-fill',
      title: 'I. Service Agreement',
      content: 'By accessing JankariTag, you agree to these Terms as a binding legal contract. Our services provide digital asset identification through QR-based technology. Use of our services implies acceptance of all terms described herein.'
    },
    {
      icon: 'ri-user-follow-fill',
      title: 'II. Eligibility',
      content: 'You must be at least 13 years of age to use JankariTag. Institutional accounts must be created by authorized representatives. You are responsible for maintaining the confidentiality of your account credentials.'
    },
    {
      icon: 'ri-qr-code-fill',
      title: 'III. Asset Registration',
      content: 'Users register assets with a unique custom identifier. You must provide accurate and truthful information. JankariTag is not liable for inaccurate data entries. Each QR code is permanently linked to its registered identifier.'
    },
    {
      icon: 'ri-money-dollar-circle-fill',
      title: 'IV. Service Charges',
      content: 'Digital QR registration is free. Physical QR sticker orders are charged at the listed price (currently ₹59). Prices may change with prior notice. Payments are processed through secure third-party channels.'
    },
    {
      icon: 'ri-forbid-2-fill',
      title: 'V. Restrictions',
      content: 'Users must not: register assets they do not own, use the service for illegal activities, attempt to reverse-engineer the QR encoding, share account credentials, or create multiple accounts for the same entity.'
    },
    {
      icon: 'ri-scales-3-fill',
      title: 'VI. Liability',
      content: 'JankariTag provides services "as-is." We are not liable for losses arising from QR code damage, misuse by third parties, or service interruptions. Maximum liability is limited to fees paid in the preceding 12 months.'
    },
    {
      icon: 'ri-refresh-fill',
      title: 'VII. Updates',
      content: 'We reserve the right to update these terms at any time. Continued use of JankariTag after changes constitutes acceptance. Material changes will be communicated via email or in-app notification.'
    }
  ]

  return (
    <Layout>
      <div className="bg-white min-h-screen py-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="w-16 h-16 rounded-sm bg-black flex items-center justify-center mx-auto mb-5 border-2 border-black shadow-[4px_4px_0px_#ea580c]">
              <i className="ri-book-2-fill text-3xl text-orange-600"></i>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-black tracking-tight mb-3">Terms of Service</h1>
            <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-widest">Effective: February 2026</p>
          </div>

          {/* Intro */}
          <div className="brutal-card p-8 md:p-10 mb-10 animate-fade-in-up">
            <p className="text-neutral-600 text-[14px] leading-relaxed font-medium">
              These terms govern your use of the JankariTag asset identification platform and all related services.
              Please read carefully before creating an account or registering any assets.
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

          {/* Contact */}
          <div className="border-2 border-black rounded-sm p-8 mt-12 bg-black animate-fade-in-up">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 min-w-10 rounded-sm bg-orange-600 text-white flex items-center justify-center">
                <i className="ri-customer-service-2-fill text-xl"></i>
              </div>
              <div>
                <h4 className="font-black text-white text-sm uppercase tracking-widest mb-2">Legal Inquiries</h4>
                <p className="text-neutral-400 text-[13px] font-medium leading-relaxed">
                  For questions about these terms, contact{' '}
                  <a href="mailto:support@jankaritag.com" className="text-orange-600 font-bold underline underline-offset-4 decoration-2">support@jankaritag.com</a>.
                  Disputes are subject to the jurisdiction of courts in New Delhi, India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
