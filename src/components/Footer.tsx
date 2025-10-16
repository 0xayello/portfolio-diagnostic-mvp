import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-black">
        <div className="flex items-center space-x-3">
          <img src="/logo-paradigma-bg.svg" alt="Paradigma" className="w-6 h-6" />
          <span>Paradigma Education © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <a className="hover:underline" href="https://twitter.com/" target="_blank" rel="noreferrer">Twitter</a>
          <a className="hover:underline" href="https://instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
          <a className="hover:underline" href="https://youtube.com/" target="_blank" rel="noreferrer">YouTube</a>
          <a className="hover:underline" href="https://www.bomdigma.com.br/" target="_blank" rel="noreferrer">Site oficial</a>
        </div>
      </div>
    </footer>
  );
}


