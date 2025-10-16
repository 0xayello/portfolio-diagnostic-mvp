import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-black">
        <div className="flex items-center space-x-3">
          <img src="/logo-paradigma-bg.svg" alt="Paradigma" className="w-6 h-6" />
          <span>Paradigma Education © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center space-x-5 mt-4 md:mt-0">
          <a className="flex items-center space-x-2 hover:underline" href="https://x.com/ParadigmaEdu" target="_blank" rel="noreferrer">
            <span aria-hidden>𝕏</span><span>Twitter / X</span>
          </a>
          <a className="flex items-center space-x-2 hover:underline" href="https://www.instagram.com/paradigma.education/" target="_blank" rel="noreferrer">
            <span aria-hidden>📸</span><span>Instagram</span>
          </a>
          <a className="flex items-center space-x-2 hover:underline" href="https://www.youtube.com/@ParadigmaEducation" target="_blank" rel="noreferrer">
            <span aria-hidden>▶️</span><span>YouTube</span>
          </a>
          <a className="flex items-center space-x-2 hover:underline" href="https://paradigma.education/" target="_blank" rel="noreferrer">
            <span aria-hidden>🌐</span><span>Site oficial</span>
          </a>
          <a className="flex items-center space-x-2 hover:underline" href="https://www.bomdigma.com.br/" target="_blank" rel="noreferrer">
            <span aria-hidden>📰</span><span>Bom Digma</span>
          </a>
        </div>
      </div>
    </footer>
  );
}


