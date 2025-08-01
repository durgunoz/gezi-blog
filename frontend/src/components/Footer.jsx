export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-600 to-blue-800 text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ✅ Outline görünürlüğü için gerekli başlık */}
        <h2 className="text-xl font-semibold text-white mb-6">Alt Bilgi</h2>

        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">GeziBlog</h3>
            <p className="text-sm text-blue-100">Seyahat tutkunları için ilham verici içerikler.</p>
          </div>

          <div>
            <h3 className="font-medium mb-1">İletişim</h3>
            <p className="text-sm">info@geziblog.com</p>
            <p className="text-sm">+90 555 123 4567</p>
          </div>

          <div>
            <h3 className="font-medium mb-1">Takip Et</h3>
            <div className="flex gap-4 justify-center">
              <a href="#" className="hover:text-blue-200 transition">Instagram</a>
              <a href="#" className="hover:text-blue-200 transition">Twitter</a>
              <a href="#" className="hover:text-blue-200 transition">Facebook</a>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-400 mt-8 pt-4 text-sm text-center text-blue-200">
          &copy; {new Date().getFullYear()} GeziBlog. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
