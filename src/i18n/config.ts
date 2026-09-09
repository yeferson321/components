import type en from "@/i18n/locales/en.json";

export type Translation = typeof en;

const translationModules = import.meta.glob<{ default: Translation }>("/src/i18n/locales/*.json");

export namespace Translation {
    export type LoginModal = Translation["loginModal"];
	export type SignInForm = LoginModal["signIn"];
    export type SignUpForm = LoginModal["signUp"];
};

export const locales = [
  	{ code: "en", language: "English" },
  	{ code: "es", language: "Español" },
] as const;

export const localeCodes = locales.map(({ code }) => code);

export type LocaleCode = (typeof localeCodes)[number];

const defaultLocale: LocaleCode = "en";

export const isLocale = (value: string): value is LocaleCode => {
    return localeCodes.includes(value as LocaleCode);
};

export const resolveLocale = (locale?: string): LocaleCode => {
	if (!locale || !isLocale(locale)) return defaultLocale;

    return locale;
};

export const getLocaleHref = (locale: LocaleCode, url?: string) => {
  	if (!url) return locale === defaultLocale ? "/" : `/${locale}`;

  	return locale === defaultLocale ? `/${url}` : `/${locale}/${url}`;
};

export const getI18n = async (locale: LocaleCode): Promise<Translation> => {
    const loader = translationModules[`/src/i18n/locales/${locale}.json`];

    return (await loader()).default;
};