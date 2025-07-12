import { Heart, Mail, Linkedin, Github } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 text-white font-outfit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Section */}
          <div className="space-y-4 order-1">
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src="/fmw-logo.png"
                  alt="FuelMyWork Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                fuelmywork
              </h3>
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              Empowering creators and connecting them with supporters who believe in their work.
            </p>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4 order-2 lg:text-right">
            <h4 className="text-lg font-semibold text-gray-200">Connect</h4>
            <div className="space-y-3">
              <a
                href="mailto:moxitrewar777@gmail.com"
                className="flex items-center lg:justify-end justify-start space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <Mail className="h-4 w-4" />
                <span>moxitrewar777@gmail.com</span>
              </a>

              {/* Social Links */}
              <div className="flex lg:justify-end space-x-4 pt-2">
                <a
                  href="https://www.linkedin.com/in/moxit-rewar-b54928290"
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/MATE0014"
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 sm:pt-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 text-gray-400 text-sm text-center sm:text-left">
              <div className="flex items-center space-x-2">
                <span>© 2024 fuelmywork. Made with</span>
                <Heart className="h-4 w-4 text-red-500" />
                <span>in India</span>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-center">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
