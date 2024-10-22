import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      nextImage();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const nextImage = () => {
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevImage = () => {
    setIsTransitioning(true);
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`Slide ${index + 1}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          } ${isTransitioning ? "blur-sm" : ""}`}
        />
      ))}
      <div className="absolute bottom-4 right-4 flex space-x-2 z-30">
        {" "}
        {/* Higher z-index */}
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
          <ChevronRight size={30} className="font-bold" />
        </button>
      </div>
    </div>
  );
};

export default ImageSlider;
