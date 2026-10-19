import type common from "@/i18n/locales/en/common.json";
import type home from "@/i18n/locales/en/home.json";

type Namespaces = {
    common: typeof common;
    home: typeof home;
};

type Namespace = keyof Namespaces;

export type Translation = { [K in Namespace]: Namespaces[K] } & {};

export namespace Translation {
    export type Of<N extends Namespace = never> = { [K in "common" | N]: Namespaces[K] } & {};

    export type Captcha = Namespaces["common"]["captcha"];
    export type LoginModal = Namespaces["home"]["loginModal"];
    export type SignInForm = LoginModal["signIn"];
    export type SignUpForm = LoginModal["signUp"];
}

export const locales = [
  	{ code: "en", language: "English" },
  	{ code: "es", language: "Español" },
] as const;

export type LocaleCode = (typeof locales)[number]["code"];

export const localeCodes = locales.map(({ code }) => code);

export const defaultLocale: LocaleCode = "en";

export const isLocale = (value?: string): value is LocaleCode => localeCodes.some((code) => code === value);

export const resolveLocale = (locale?: string): LocaleCode => isLocale(locale) ? locale : defaultLocale;

export const getLocaleHref = (locale: LocaleCode, path?: string) => {
    const prefix = locale === defaultLocale ? "" : `/${locale}`;
 
    return path ? `${prefix}/${path}` : prefix || "/";
};

const loaders = import.meta.glob<Namespaces[Namespace]>("/src/i18n/locales/*/*.json", {
    import: "default",
});

export const getI18n = async <N extends Namespace = never>(locale: LocaleCode, namespaces: readonly N[] = [],): Promise<Translation.Of<N>> => {
    const names = new Set<Namespace>(["common", ...namespaces]);

    const entries = await Promise.all(
        [...names].map(async (name) => {
            const load = loaders[`/src/i18n/locales/${locale}/${name}.json`];

            if (!load) throw new Error(`Falta el archivo de traducción: ${locale}/${name}.json`);

            return [name, await load()] as const;
        }),
    );

    return Object.fromEntries(entries) as Translation.Of<N>;
};