import { ArrowRight, Star, Truck, Shield, Zap } from "lucide-react"

export default function BnnerWelcome() {
  return (
    <div className="relative min-h-[80vh] lg:min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/placeholder.svg"
          alt="Athlète en action"
          className="w-full h-full object-cover object-center absolute inset-0"
          style={{ zIndex: 0 }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-[80vh] lg:min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-6 lg:space-y-8">
            {/* Badge */}
            <div className="flex justify-center lg:justify-start">
              <span className="inline-flex items-center bg-orange-500 text-white border-0 px-4 py-2 text-sm font-semibold rounded-full">
                <Zap className="w-4 h-4 mr-2" />
                NOUVELLE COLLECTION 2024
              </span>
            </div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight">
                DÉPASSEZ
                <span className="block text-orange-500">VOS LIMITES</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 font-medium max-w-2xl mx-auto lg:mx-0">
                Équipements sportifs premium pour athlètes exigeants.
                <span className="block mt-2 text-orange-400 font-bold">Performance garantie !</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                SHOP MAINTENANT
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                className="border-2 border-white text-white hover:bg-white hover:text-black font-bold px-8 py-4 text-lg rounded-full backdrop-blur-sm bg-transparent flex items-center justify-center"
              >
                VOIR CATALOGUE
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              <div className="flex items-center justify-center lg:justify-start space-x-3 text-white">
                <div className="bg-orange-500 rounded-full p-2">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">LIVRAISON</div>
                  <div className="text-xs text-gray-300">24-48h</div>
                </div>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-3 text-white">
                <div className="bg-orange-500 rounded-full p-2">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">GARANTIE</div>
                  <div className="text-xs text-gray-300">2 ans</div>
                </div>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-3 text-white">
                <div className="bg-orange-500 rounded-full p-2">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">QUALITÉ</div>
                  <div className="text-xs text-gray-300">Premium</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Promo Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-orange-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>

              {/* Main Card */}
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl max-w-sm w-full">
                <div className="text-center space-y-6">
                  {/* Discount Badge */}
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full">
                    <span className="text-2xl font-black text-white">-40%</span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">MÉGA PROMO</h3>
                    <p className="text-gray-300 text-sm">Sur toute la collection running et fitness</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="text-center">
                      <div className="text-2xl font-black text-orange-400">500+</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Produits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-orange-400">24h</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Livraison</div>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-full">
                    J'EN PROFITE !
                  </button>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-3 animate-bounce shadow-lg">
                <Star className="w-6 h-6 text-yellow-900" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-green-400 rounded-full p-3 animate-pulse shadow-lg">
                <Zap className="w-6 h-6 text-green-900" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-black text-orange-400">50K+</div>
              <div className="text-xs text-gray-400 uppercase">Clients</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-orange-400">1000+</div>
              <div className="text-xs text-gray-400 uppercase">Produits</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-orange-400">4.9★</div>
              <div className="text-xs text-gray-400 uppercase">Note</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-orange-400">24/7</div>
              <div className="text-xs text-gray-400 uppercase">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
