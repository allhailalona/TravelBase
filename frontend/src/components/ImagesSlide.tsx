import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextImage = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [images.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextImage();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, nextImage]);

  const prevImage = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [images.length]);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex justify-center items-center">
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Slide ${index + 1}`}
          className={`absolute h-full w-full object-cover transition-opacity duration-500 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{
            // Heavy blur and adjustments to create a mesh-like color field
            filter: "blur(15px) saturate(150%) contrast(125%)"
          }}
        />
      ))}
      <div className="absolute bottom-4 right-4 flex space-x-2 z-30">
        <button
          onClick={prevImage}
          className="glass"
          style={{ background: "rgba(255, 255, 255, 0.4)" }}
        >
          <ChevronLeft size={30} />
        </button>
        <button
          onClick={nextImage}
          className="glass"
          style={{ background: "rgba(255, 255, 255, 0.4)" }}
        >
          <ChevronRight size={30} />
        </button>
      </div>
    </div>
  );
};

export default ImageSlider;
