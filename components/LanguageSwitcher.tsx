import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2 cursor-pointer self-center">
      <span
        onClick={() => changeLanguage("en")}
        className={`${i18n.language === "en" ? "font-bold" : "opacity-50"}`}
      >
        EN
      </span>
      <span>|</span>
      <span
        onClick={() => changeLanguage("es")}
        className={`${i18n.language === "es" ? "font-bold" : "opacity-50"}`}
      >
        ES
      </span>
    </div>
  );
};

export default LanguageSwitcher;
