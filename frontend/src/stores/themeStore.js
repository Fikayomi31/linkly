import { create } from "zustand";

const getSavedTheme = () => {
    return localStorage.getItem("linkly_theme") || "dark"
}

export const useThemeStore = create((set) => ({
    theme: getSavedTheme(),

    toggleTheme: () =>
        set((state) => {
            const nextTheme = state.theme === "dark" ? "light" : "dark";

            localStorage.setItem("linkly_theme", nextTheme);

            return { theme: nextTheme };
        }),
}));


