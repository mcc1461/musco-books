// File: mobile/store/authStore.js
// This file contains the Zustand store for authentication management in the mobile app.
import {create} from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,

    register : async (username, email, password) => {
        set({ isLoading: true });
        try {
            // Simulate API call
            const response = await fetch("http://localhost:3011/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                set({ user: data.user, token: data.token, isLoading: false });
            } else {
                console.error("Registration error:", data.message);
                set({ isLoading: false });
            }
            // Save token to AsyncStorage
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);

            set({token : data.token, user: data.user, isLoading: false});
            return { success: true, user: data.user };
        } catch (error) {
            console.error("Registration error:", error);
            set({ isLoading: false });
        }
    }
}));
