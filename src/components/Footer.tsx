'use client';

import { Language, getTranslation } from '@/lib/translations';

interface FooterProps {
  language: Language;
}

export default function Footer({ language }: FooterProps) {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="sm:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                  <path d="M24 2L6 8v12c0 11.25 7.5 21.75 18 26 10.5-4.25 18-14.75 18-26V8L24 2z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1"/>
                  <path d="M24 4L8 9v11c0 10 6.5 19 16 23 9.5-4 16-13 16-23V9L24 4z" fill="#1e40af"/>
                  <text x="24" y="24" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontFamily="serif" fontSize="10" fontWeight="bold">e-CD</text>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {getTranslation('siteTitle', language)}
                </h3>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              {getTranslation('disclaimer', language)}
            </p>
            <div className="bg-red-900 border border-red-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  <p className="text-red-200 font-medium mb-1">Official Disclaimer</p>
                  <p className="text-red-300">
                    This website is not affiliated with or endorsed by the Indonesian Customs and Excise Directorate General (Direktorat Jenderal Bea dan Cukai). This is an independent helper tool designed to assist travelers in preparing their customs declarations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Important Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.beacukai.go.id/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                  Official Customs Website
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Duty-Free Allowances
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Prohibited Items
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Customs Regulations
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  How to Use
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Indonesia Customs Declaration Helper. Not affiliated with Indonesian Government.
            </p>
            <p className="text-gray-400 text-sm">
              Last updated: August 2024
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}