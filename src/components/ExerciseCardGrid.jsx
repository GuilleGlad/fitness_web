import React, { useState, useEffect, useCallback } from 'react';
import ExerciseCard from './ExerciseCard';
import Reveal from './Reveal';
import { createPortal } from 'react-dom';

const ExerciseCardGrid = ({ exercises, title = 'Ejercicios', loading = false }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = useCallback((index) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  }, []);

  const handleNavigate = useCallback((newIndex) => {
    if (newIndex >= 0 && newIndex < exercises.length) {
      setSelectedIndex(newIndex);
    }
  }, [exercises.length]);

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedIndex(null);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!isModalOpen) return;
    if (e.key === 'ArrowLeft') handleNavigate(selectedIndex - 1);
    if (e.key === 'ArrowRight') handleNavigate(selectedIndex + 1);
    if (e.key === 'Escape') handleClose();
  }, [isModalOpen, selectedIndex, handleNavigate, handleClose]);

  // Add keyboard listener when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, handleKeyDown]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <article key={i} className="rounded-2xl border border-slate-700 bg-[#141820] overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-slate-800" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-slate-700 rounded w-full" />
              <div className="h-3 bg-slate-700 rounded w-5/6" />
              <div className="h-3 bg-slate-700 rounded w-1/2" />
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No hay ejercicios disponibles.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Grid Title */}
      {title && (
        <h3 className="mb-6 text-xl font-semibold text-white">{title}</h3>
      )}

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {exercises.map((exercise, index) => (
          <Reveal key={exercise.id || index} delay={Math.min(index, 8) * 80}>
          <article
            onClick={() => handleCardClick(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(index);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Ver ejercicio: ${exercise.title}`}
            className="group relative cursor-pointer rounded-2xl border border-slate-700 bg-[#141820] overflow-hidden transition-all duration-300 hover:border-slate-600 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#f1b80c] focus:ring-offset-2 focus:ring-offset-[#0d1117]"
          >
            {/* Image/Video Thumbnail */}
            <div className="relative aspect-[4/3] overflow-hidden">
              {exercise.video_url ? (
                <div className="relative w-full h-full">
                  <video
                    src={exercise.video_url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    poster={exercise.photo_url || undefined}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <svg className="h-16 w-16 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              ) : exercise.photo_url ? (
                <img
                  src={exercise.photo_url}
                  alt={exercise.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-800">
                  <svg className="h-16 w-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Media Type Badge */}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-black/70 text-white border border-white/20 backdrop-blur-sm">
                  {exercise.video_url ? '🎥 Video' : exercise.photo_url ? '📷 Foto' : 'Sin medios'}
                </span>
              </div>

              {/* Quick View Indicator */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transform transition-all duration-300 translate-y-2 group-hover:translate-y-0 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 shadow-lg">
                  Ver ejercicio
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h4 className="mb-2 line-clamp-1 font-semibold text-white group-hover:text-[#f1b80c] transition-colors">
                {exercise.title}
              </h4>
              
              <div className="mb-3 line-clamp-2 text-sm text-slate-400">
                {exercise.description || 'Sin descripción'}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {exercise.video_url ? 'Con video' : 'Solo imagen'}
                </span>
              </div>
            </div>
          </article>
          </Reveal>
        ))}
      </div>

      {/* Modal for detailed view */}
      {isModalOpen && selectedIndex !== null && createPortal(
        <ExerciseCard
          title={exercises[selectedIndex].title}
          description={exercises[selectedIndex].description}
          photo_url={exercises[selectedIndex].photo_url}
          video_url={exercises[selectedIndex].video_url}
          onNavigate={handleNavigate}
          index={selectedIndex}
          total={exercises.length}
          onClose={handleClose}
        />
      ,document.body)}
    </div>
  );
};

export default ExerciseCardGrid;