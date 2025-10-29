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
    <footer className="mt-12 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-black">
        <div className="flex items-center space-x-3">
          <img
            src="/logo-paradigma-bg.svg"
            alt="Paradigma"
            className="w-6 h-6"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://paradigma.education/favicon-196x196.png';
            }}
          />
          <span>Paradigma Education © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center space-x-5 mt-4 md:mt-0">
          <a className="flex items-center space-x-2 hover:underline" href="https://x.com/ParadigmaEdu" target="_blank" rel="noreferrer">
            <span aria-hidden>𝕏</span><span>Twitter / X</span>
          </a>
          <a className="flex items-center space-x-2 hover:underline" href="https://www.instagram.com/paradigma.education/" target="_blank" rel="noreferrer">
            <IconInstagram /><span>Instagram</span>
          </a>
          <a className="flex items-center space-x-2 hover:underline" href="https://www.youtube.com/@ParadigmaEducation" target="_blank" rel="noreferrer">
            <IconYouTube /><span>YouTube</span>
          </a>
          <a className="flex items-center space-x-2 hover:underline" href="https://paradigma.education/" target="_blank" rel="noreferrer">
            <img
              src="/logo-paradigma-bg.svg"
              alt="Paradigma"
              className="w-4 h-4"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://paradigma.education/favicon-196x196.png';
              }}
            />
            <span>Site oficial</span>
          </a>
          <a className="flex items-center space-x-2 hover:underline" href="https://www.bomdigma.com.br/" target="_blank" rel="noreferrer">
            <span aria-hidden>📰</span><span>Bom Digma</span>
          </a>
        </div>
      </div>
    </footer>
  );
}


