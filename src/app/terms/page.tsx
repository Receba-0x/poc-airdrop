"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <>
      <Header />
      <div className="min-h-screen text-white pt-20 bg-[#0F0F0F]">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {t("terms.title")}
            </h1>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-6">{t("terms.dataCollection.title")}</h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                {t("terms.dataCollection.description")}
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>{t("terms.dataCollection.ip")}</li>
                <li>{t("terms.dataCollection.isp")}</li>
                <li>{t("terms.dataCollection.browser")}</li>
                <li>{t("terms.dataCollection.time")}</li>
              </ul>
            </section>

            {/* Cookie DoubleClick DART */}
            <section>
              <h2 className="text-2xl font-bold mb-6">{t("terms.cookies.title")}</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>{t("terms.cookies.google")}</li>
                <li>{t("terms.cookies.dart")}</li>
              </ul>
            </section>

            {/* Política de Privacidade para Links Externos */}
            <section>
              <h2 className="text-2xl font-bold mb-6">{t("terms.externalLinks.title")}</h2>
              <p className="text-gray-300 leading-relaxed">
                {t("terms.externalLinks.description")}
              </p>
            </section>

            {/* Confidencialidade e Uso de Informações Pessoais */}
            <section>
              <h2 className="text-2xl font-bold mb-6">{t("terms.confidentiality.title")}</h2>
              <div className="text-gray-300 space-y-4 leading-relaxed">
                <p>{t("terms.confidentiality.description1")}</p>
                <p>{t("terms.confidentiality.description2")}</p>
                <p>{t("terms.confidentiality.description3")}</p>
                <p>{t("terms.confidentiality.description4")}</p>
              </div>
            </section>
          </div>


        </div>
      </div>
      <Footer />
    </>
  );
}
