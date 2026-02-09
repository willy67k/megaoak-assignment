import { defineStore } from "pinia";
import type { AuthUser } from "@/types";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as AuthUser | null,
    googleReady: false,
    facebookReady: false,
  }),

  getters: {
    isGoogleLogin: (state) => !!state.user?.google,
    isFacebookLogin: (state) => !!state.user?.facebook,
    isFullyAuthed: (state) => !!state.user?.google && !!state.user?.facebook,
  },

  actions: {
    setGoogleUser(payload: AuthUser["google"]) {
      this.user = { ...this.user, google: payload };
    },

    setFacebookUser(payload: AuthUser["facebook"]) {
      this.user = { ...this.user, facebook: payload };
    },
  },
});
