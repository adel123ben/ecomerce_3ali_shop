import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CarouselSlide {
  id: string;
  image_url: string;
  text?: string | null;
  show_button?: boolean;
  button_url?: string | null;
}

export const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  // Fetch slides from Supabase
  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .order('order');
      if (data && data.length > 0) {
        setSlides(data);
      } else {
        // fallback: hardcoded slides
        setSlides([
          {
            id: '1',
            image_url: 'https://cdn.dribbble.com/userupload/13118950/file/original-cfaebacb75910a02e08e618b7ab2a067.jpg?resize=752x&vertical=center',
            text: 'Premium Athletic Wear',
            show_button: true,
            button_url: '#products',
          },
          {
            id: '2',
            image_url: 'https://cdna.artstation.com/p/assets/images/images/065/569/746/large/harshraj-chauhan-nike-new-arrival-poster.jpg?1690717266',
            text: 'New Season Collection',
            show_button: true,
            button_url: '#new',
          },
          {
            id: '3',
            image_url: 'https://mostaql.hsoubcdn.com/uploads/thumbnails/1009333/60c770e9a2244/Blender-Project-100415.png',
            text: 'Performance Gear',
            show_button: true,
            button_url: '#performance',
          },
        ]);
      }
    };
    fetchSlides();
  }, []);

  // Reset currentSlide to 0 when slides change
  useEffect(() => {
    setCurrentSlide(0);
  }, [slides.length]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && slides.length > 0) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 2000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentSlide, isAutoPlaying, slides.length]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    // Resume auto-play after 3 seconds
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  if (slides.length === 0) {
    return (
      <section className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] flex items-center justify-center bg-gray-900">
        <div className="text-center text-white opacity-70">Chargement du carousel...</div>
      </section>
    );
  }

  return (
    <section 
      className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden bg-gray-900"
      ref={carouselRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Image carousel"
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentSlide
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
            aria-hidden={index !== currentSlide}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={slide.image_url}
                alt={slide.text || ''}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>

            {/* Content : bouton toujours centré, texte au-dessus si présent */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8">
              {slide.text && (
                <h1
                  className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white transition-all duration-700 ${
                    index === currentSlide
                      ? 'transform translate-y-0 opacity-100'
                      : 'transform translate-y-8 opacity-0'
                  }`}
                >
                  {slide.text}
                </h1>
              )}
              {slide.show_button && slide.button_url && (
                <button
                  className={`mt-4 bg-white text-gray-900 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg ${
                    index === currentSlide
                      ? 'translate-y-0 opacity-100 delay-400'
                      : 'translate-y-8 opacity-0'
                  }`}
                  onClick={() => window.location.href = slide.button_url!}
                  aria-label={slide.text ? `Voir ${slide.text}` : 'Voir'}
                >
                  Voir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        disabled={isTransitioning || slides.length === 0}
        className="hidden sm:flex absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 disabled:opacity-50"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        disabled={isTransitioning || slides.length === 0}
        className="hidden sm:flex absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 disabled:opacity-50"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
            className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-20 z-20">
        <div
          className="h-full bg-white transition-all duration-300 ease-linear"
          style={{
            width: `${slides.length > 0 ? ((currentSlide + 1) / slides.length) * 100 : 0}%`
          }}
        />
      </div>
    </section>
  );
};