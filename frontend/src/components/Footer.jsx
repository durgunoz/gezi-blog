import React from "react";

export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white pt-6 pb-4 mt-10">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-lg font-bold mb-2">İletişim</h3>
        <p className="text-sm">Email: info@geziblog.com</p>
        <p className="text-sm mt-1">Telefon: +90 555 123 4567</p>

        <div className="text-xs mt-6 border-t border-blue-400 pt-3">
          &copy; {new Date().getFullYear()} GeziBlog. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
