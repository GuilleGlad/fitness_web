  // ---- reusable pair row component ----
  const PairRow = ({ icon, label, description, controlsLeft, previewRight }) => (
    <div className="rounded-[32px] border border-slate-800 bg-[#141820]/90 shadow-xl overflow-hidden transition-all hover:border-slate-700/60">
      <div className="flex flex-col md:flex-row">
        {/* LEFT — controls */}
        <div className={`p-6 lg:p-8 ${previewRight ? 'flex-1 border-b md:border-b-0 md:border-r border-slate-800/50' : 'w-full'}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1b80c]/15 text-lg">
              {icon}
            </span>
            <div>
              <h3 className="text-base font-semibold text-white">{label}</h3>
              {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-3">{controlsLeft}</div>
        </div>

        {/* RIGHT — preview (only when supplied) */}
        {previewRight && (
          <div className="flex-[1.2] p-6 lg:p-8 bg-gradient-to-br from-slate-900/40 to-transparent">
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-slate-500">Vista previa</p>
            {previewRight}
          </div>
        )}
      </div>
    </div>
  );

  export default PairRow;