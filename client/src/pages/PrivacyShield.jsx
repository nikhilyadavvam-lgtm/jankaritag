import Layout from "../components/Layout";

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: "ri-shield-check-fill",
      title: "I. Data Governance",
      content:
        'JankariTag collects only the information necessary for asset registration and identity services. This includes your name, email, phone, and QR-linked asset details. We adhere to a "minimum viable data" principle.',
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: "ri-lock-2-fill",
      title: "II. Security Protocols",
      content:
        "All data is secured using industry-standard encryption (AES-256 at rest, TLS 1.3 in transit). Database access is restricted to authenticated personnel with role-based access control.",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: "ri-share-circle-fill",
      title: "III. Data Sharing",
      content:
        "We do not sell, rent, or trade your personal data with third parties. Information is only shared when legally required (court orders, regulatory compliance), or with your explicit consent.",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      icon: "ri-database-2-fill",
      title: "IV. Data Retention",
      content:
        "We retain your data as long as your account is active. Upon account deletion, personally identifiable information is purged within 30 days. Anonymous analytics data may be retained for product improvement.",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      icon: "ri-cookie-fill",
      title: "V. Cookies & Tracking",
      content:
        "We do not use invasive cookies. Only essential session cookies for authentication and functionality are stored. No third-party tracking scripts or advertising cookies are deployed.",
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      icon: "ri-user-settings-fill",
      title: "VI. Your Rights",
      content:
        "You have the right to access, modify, export, or delete your data at any time through your profile settings. Contact support@jankaritag.com for data portability requests.",
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  return (
    <Layout>
      <div className="bg-white min-h-screen py-24 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <i className="ri-shield-user-fill text-3xl text-yellow-600"></i>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Privacy Shield
            </h1>
            <p className="text-gray-400 text-xs font-medium">
              Last Updated: February 2026
            </p>
          </div>

          {/* Intro */}
          <div className="mm-card-lg p-8 md:p-10 mb-10 animate-fade-in-up">
            <p className="text-gray-600 text-sm leading-relaxed">
              JankariTag is committed to protecting your privacy and ensuring
              the security of your personal information. This policy outlines
              how we collect, use, store, and protect your data when you use our
              asset identification services.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-5 animate-fade-in-up">
            {sections.map((section, i) => (
              <div
                key={i}
                className="mm-card p-6 md:p-8 group hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-5">
                  <div
                    className={`w-12 h-12 min-w-12 rounded-xl ${section.bg} flex items-center justify-center ${section.color}`}
                  >
                    <i className={`${section.icon} text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg tracking-tight mb-2">
                      {section.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Advisory */}
          <div className="rounded-2xl p-8 mt-12 bg-yellow-50 border border-yellow-200 animate-fade-in-up">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 min-w-10 rounded-xl bg-yellow-400 text-gray-900 flex items-center justify-center">
                <i className="ri-information-fill text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-2">
                  Compliance Notice
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  For questions, data requests, or concerns about this privacy
                  policy, contact our Data Protection Officer at{" "}
                  <a
                    href="mailto:support@jankaritag.com"
                    className="text-yellow-600 font-semibold hover:underline"
                  >
                    support@jankaritag.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
