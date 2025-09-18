"use client";
import { useRef, useState, useEffect } from "react";
import ProjectDialog from "@/components/project-dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectsCarousel({ projects }: { projects: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateVisibleCount() {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1280) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    }
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, projects.length - visibleCount);
      return prev < maxIndex ? prev + 1 : prev;
    });
  };
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  // Touch event handlers
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const threshold = 100;
    const maxIndex = Math.max(0, projects.length - visibleCount);
    if (distance > threshold && currentIndex < maxIndex) {
      nextSlide();
    } else if (distance < -threshold && currentIndex > 0) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="bg-gradient-to-r from-[#ffebe4] via-[#de6270] to-[#ba2990cc] rounded-lg p-3 md:p-6 relative shadow-xs hover:shadow-sm transition-shadow duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold">
          <span className="text-red-600">Featured</span> Projects
        </h2>
        <div className="flex gap-2 self-end md:self-center">
          <Button variant="outline" size="icon" onClick={prevSlide} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            disabled={currentIndex >= projects.length - visibleCount}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-hidden">
        <div
          ref={carouselRef}
          className="flex gap-4 transition-transform duration-300"
          style={{ transform: `translateX(-${currentIndex * 310}px)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {projects.map((project: any, idx: number) => (
            <div key={project._id || idx} className="min-w-[300px] max-w-[300px]">
              <ProjectDialog project={project} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}