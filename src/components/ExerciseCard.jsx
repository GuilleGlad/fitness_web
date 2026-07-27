import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faChevronCircleDown, faChevronCircleUp, faDumbbell, faVideo, faImage } from '@fortawesome/free-solid-svg-icons';

const ExerciseCard = ({ title, description, photo_url, video_url, onNavigate, index, total, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const videoRef = useRef(null);
  const textLimit = 200;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const displayText = isExpanded
    ? (description || '')
    : `${(description || '').substring(0, textLimit)}...`;

  const handleNavigate = (direction) => {
    if (onNavigate) {
      onNavigate(index + direction);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handleNavigate(-1);
    if (e.key === 'ArrowRight') handleNavigate(1);
    if (e.key === 'Escape' && onClose) onClose();
  };

  // Auto-play video when modal opens
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Pause video when modal closes
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) {
        video.pause();
      }
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      aria-label={`Ejercicio ${index + 1} de ${total}: ${title}`}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#141820] border border-slate-700 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-[#141820]/95 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faDumbbell} className="h-6 w-6 text-[#f1b80c]" />
            <div>
              <h2 className="text-lg font-semibold text-white truncate max-w-[300px]">{title}</h2>
              <p className="text-xs text-slate-400">Ejercicio {index + 1} de {total}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate(-1)}
              disabled={index === 0}
              className="rounded-full p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Ejercicio anterior"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleNavigate(1)}
              disabled={index === total - 1}
              className="rounded-full p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Siguiente ejercicio"
            >
              <FontAwesomeIcon icon={faChevronRight} className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
              aria-label="Cerrar ejercicio"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {/* Media Section */}
          <div className="mb-6">
            {video_url ? (
              <div className="mb-6 rounded-xl overflow-hidden border border-slate-700 relative">
                <video
                  ref={videoRef}
                  src={video_url}
                  className="mx-auto h-auto max-h-[60lvh] object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={photo_url || undefined}
                />
              </div>
            ) : photo_url ? (
              <div className="mb-6 rounded-xl overflow-hidden border border-slate-700">
                <img 
                  src={photo_url} 
                  alt={title} 
                  className="w-full h-64 object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="mb-6 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 h-64 flex items-center justify-center">
                <FontAwesomeIcon icon={faDumbbell} className="h-16 w-16 text-slate-600" />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-invert max-w-none text-slate-300">
            <h3 className="text-xl font-semibold text-white mb-3">Descripción</h3>
            <div className="whitespace-pre-wrap text-base leading-relaxed">
              {displayText}
            </div>
            
            {(description || '').length > textLimit && (
              <button
                onClick={toggleExpanded}
                className="mt-4 flex items-center gap-2 text-sm font-medium text-[#f1b80c] hover:text-[#d69e2e] transition"
              >
                {isExpanded 
                  ? <>Ver menos <FontAwesomeIcon icon={faChevronCircleUp} className="h-5 w-5" /></>
                  : <>Ver más <FontAwesomeIcon icon={faChevronCircleDown} className="h-5 w-5" /></>
                }
              </button>
            )}
          </div>

          {/* Media Info */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="flex flex-wrap gap-3">
              {photo_url && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-sm text-slate-300 border border-slate-700">
                  <FontAwesomeIcon icon={faImage} className="h-4 w-4 text-[#f1b80c]" />
                  Foto disponible
                </span>
              )}
              {video_url && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-sm text-slate-300 border border-slate-700">
                  <FontAwesomeIcon icon={faVideo} className="h-4 w-4 text-[#f1b80c]" />
                  Video disponible
                </span>
              )}
              {!photo_url && !video_url && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-sm text-slate-500 border border-slate-700">
                  Sin medios
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Hints */}
        <div className="hidden px-6 py-4 sm:flex sm:items-center sm:justify-between sm:border-t sm:border-slate-700">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <kbd className="rounded bg-slate-800 px-2 py-1 text-slate-300 border border-slate-700">←</kbd>
            <span>Anterior</span>
            <kbd className="rounded bg-slate-800 px-2 py-1 text-slate-300 border border-slate-700">→</kbd>
            <span>Siguiente</span>
            <kbd className="rounded bg-slate-800 px-2 py-1 text-slate-300 border border-slate-700">Esc</kbd>
            <span>Cerrar</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>{index + 1} / {total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;