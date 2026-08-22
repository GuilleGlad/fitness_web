// ---- helper: plain-text row (username, email, phone, address) ----
import PairRow from "./PairRow";

const PairRowText = ({ icon, label, description, name, type = 'text', placeholder, settings, handleChange, handleClear}) => (
    <PairRow
      icon={icon}
      label={label}
      description={description}
      controlsLeft={
        <>
          <input
            type={type}
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
    />
  );

  export default PairRowText;
