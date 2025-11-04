import React from 'react';

function IconInstagram() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      focusable="false"
    >
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7z"/>
      <path d="M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>
      <circle cx="17.5" cy="6.5" r="1.25"/>
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      focusable="false"
    >
      <path d="M23.5 7.5a4 4 0 0 0-2.8-2.8C18.7 4 12 4 12 4s-6.7 0-8.7.7A4 4 0 0 0 .5 7.5 41 41 0 0 0 0 12a41 41 0 0 0 .5 4.5 4 4 0 0 0 2.8 2.8C5.3 20 12 20 12 20s6.7 0 8.7-.7a4 4 0 0 0 2.8-2.8 41 41 0 0 0 .5-4.5 41 41 0 0 0-.5-4.5zM9.75 15.5v-7l6 3.5-6 3.5z"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-16 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="glass-card rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo e Copyright */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <img
                  src="/logo-paradigma-bg.svg"
                  alt="Paradigma"
                  className="w-6 h-6 brightness-0 invert"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://paradigma.education/favicon-196x196.png';
                  }}
                />
              </div>
              <div>
                <div className="font-bold text-gray-900">Paradigma Education</div>
                <div className="text-sm text-gray-600">© {new Date().getFullYear()} Todos os direitos reservados</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a 
                className="group flex items-center gap-2 px-4 py-2 bg-white hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 rounded-xl border-2 border-gray-200 hover:border-violet-300 transition-all duration-300 hover:shadow-lg" 
                href="https://x.com/ParadigmaEdu" 
                target="_blank" 
                rel="noreferrer"
              >
                <span className="text-lg" aria-hidden>𝕏</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-violet-600">Twitter</span>
              </a>
              
              <a 
                className="group flex items-center gap-2 px-4 py-2 bg-white hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 rounded-xl border-2 border-gray-200 hover:border-violet-300 transition-all duration-300 hover:shadow-lg" 
                href="https://www.instagram.com/paradigma.education/" 
                target="_blank" 
                rel="noreferrer"
              >
                <IconInstagram />
                <span className="text-sm font-medium text-gray-700 group-hover:text-violet-600">Instagram</span>
              </a>
              
              <a 
                className="group flex items-center gap-2 px-4 py-2 bg-white hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 rounded-xl border-2 border-gray-200 hover:border-violet-300 transition-all duration-300 hover:shadow-lg" 
                href="https://www.youtube.com/@ParadigmaEducation" 
                target="_blank" 
                rel="noreferrer"
              >
                <IconYouTube />
                <span className="text-sm font-medium text-gray-700 group-hover:text-violet-600">YouTube</span>
              </a>
              
              <a 
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl transition-all duration-300 hover:shadow-xl" 
                href="https://paradigma.education/" 
                target="_blank" 
                rel="noreferrer"
              >
                <img
                  src="/logo-paradigma-bg.svg"
                  alt="Paradigma"
                  className="w-4 h-4 brightness-0 invert"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://paradigma.education/favicon-196x196.png';
                  }}
                />
                <span className="text-sm font-bold text-white">Site Oficial</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


