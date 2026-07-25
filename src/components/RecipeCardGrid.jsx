import React, { useState, useEffect } from 'react';
import RecipeCard from './RecipeCard';

const RecipeCardGrid = ({ recipes, title = 'Recetas', loading = false }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (index) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const handleNavigate = (newIndex) => {
    if (newIndex >= 0 && newIndex < recipes.length) {
      setSelectedIndex(newIndex);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedIndex(null);
  };

  const handleKeyDown = (e) => {
    if (!isModalOpen) return;
    if (e.key === 'ArrowLeft') handleNavigate(selectedIndex - 1);
    if (e.key === 'ArrowRight') handleNavigate(selectedIndex + 1);
    if (e.key === 'Escape') handleClose();
  };

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
  }, [isModalOpen, selectedIndex, recipes.length]);

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

  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No hay recetas disponibles.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Grid Title */}
      {title && (
        <h3 className="mb-6 text-xl font-semibold text-white">{title}</h3>
      )}

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {recipes.map((recipe, index) => (
          <article
            key={recipe.id || index}
            onClick={() => handleCardClick(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(index);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Ver receta: ${recipe.title}`}
            className="group relative cursor-pointer rounded-2xl border border-slate-700 bg-[#141820] overflow-hidden transition-all duration-300 hover:border-slate-600 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#f1b80c] focus:ring-offset-2 focus:ring-offset-[#0d1117]"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              {recipe.image_url ? (
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
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
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  recipe.status 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {recipe.status ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              {/* Quick View Indicator */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transform transition-all duration-300 translate-y-2 group-hover:translate-y-0 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 shadow-lg">
                  Ver receta
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h4 className="mb-2 line-clamp-1 font-semibold text-white group-hover:text-[#f1b80c] transition-colors">
                {recipe.title}
              </h4>
              
              <div className="mb-3 line-clamp-2 text-sm text-slate-400">
                {recipe.ingredients || 'Sin ingredientes'}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {recipe.instructions ? `${recipe.instructions.split('\n').length} pasos` : 'Sin instrucciones'}
                </span>
              <span className="text-xs text-slate-500">
                  {recipe.ingredients ? recipe.ingredients.split('\n').filter(Boolean).length : 0} ingredientes
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Modal for detailed view */}
      {isModalOpen && selectedIndex !== null && (
        <RecipeCard
          title={recipes[selectedIndex].title}
          ingredients={recipes[selectedIndex].ingredients}
          instructions={recipes[selectedIndex].instructions}
          image_url={recipes[selectedIndex].image_url}
          onNavigate={handleNavigate}
          index={selectedIndex}
          total={recipes.length}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default RecipeCardGrid;