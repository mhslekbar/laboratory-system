// src/components/SettingsQuick.tsx
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../redux/store";
import { setLang, toggleTheme } from "../../redux/settings/settingsUiSlice";

const SettingsQuick: React.FC = () => {
  const { lang, theme, dir } = useSelector((s: State) => s.settings); // ← UI slice
  const dispatch = useDispatch();

  return (
    <div className="flex items-center gap-2">
      <button className="btn-primary px-3 py-1 rounded" onClick={() => dispatch(toggleTheme())}>
        {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
      </button>

      <select
        className="bg-white text-primary border border-white px-2 py-1 rounded"
        value={lang}
        onChange={(e) => dispatch(setLang(e.target.value as any))}
      >
        <option value="fr">FR</option>
        <option value="ar">AR</option>
        <option value="en">EN</option>
      </select>

      <span className="text-sm opacity-70">dir: {dir}</span>
    </div>
  );
};
export default SettingsQuick;
