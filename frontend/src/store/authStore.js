import { create } from "zustand";
import api from "../services/api";


const getStoredUser = () => {
    try {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        return null;
    }
}

const useAuthStore = create((set) => ({
    user: getStoredUser(),
    token: localStorage.getItem("access_token"),
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post("/login", { email, password });
            const {access_token, user } = res.data;

            localStorage.setItem("access_token", access_token);
            localStorage.setItem("user", JSON.stringify(user));

            set({
                user: user, 
                token: access_token, 
                loading: false,
                error: null,
            })

            return {
                success: true,
                user: user,
                token: access_token
            }
        } catch (error) {
            console.error("Login error:", error);
            const message =
                error.res?.data?.error ||
                error.res?.data?.message ||
                "Login failed. Please try again."

            set({
                loading: false,
                error: message
            })
            return {
                success: false,
                error: message
            }
        }
    },

    register: async (username, email, password) => {
        set({
            loading: true,
            error: null
        })

        try {
            const res = await api.post("/register", { username, email, password });
            const { access_token, user } = res.data;

            if (access_token) {
                localStorage.setItem("access_token", access_token);
                localStorage.setItem("user", JSON.stringify(user));
            }

            set({
                user: user || null,
                token: access_token || null,
                isAuthenticated: !!access_token,
                loading: false,
                error: null
            })

            return {
                success: true,
                data: res.data
            }
        } catch (error) {
            console.error("Registration error:", error);
        }
    },

    logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        set({
            user: null,
            token: null,
            error: null
        })
    },
        
}))

export default useAuthStore;