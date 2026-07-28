// ---- helper: plain-text row (username, email, phone, address) ----
import PairRow from "./PairRow";  

const PairRowText = ({ icon, label, description, name, placeholder, settings, handleChange, handleClear}) => (
    <PairRow
      icon={icon}
      label={label}
      description={description}
      controlsLeft={
        <>
          <input
            name={name}
            value={settings[name] || ''}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#f1b80c]"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => handleClear(name)}
            className="w-fit rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            Limpiar
          </button>
        </>
      }
      previewRight={
        settings[name] ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 px-4 py-3">
            <p className="text-sm text-white leading-relaxed break-all">{settings[name]}</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/30 px-4 py-8">
            <span className="text-xl text-slate-600">{icon}</span>
            <p className="text-sm text-slate-500">Sin valor establecido.</p>
          </div>
        )
      }
    />
  );

  export default PairRowText;