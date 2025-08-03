import {create} from "zustand";

export const useAuthStore = create((set) => ({
    user: { nameIt :"john" },

    sayHello: () => {
       console.log("Hello from authStore MCC!");

    }
}));
