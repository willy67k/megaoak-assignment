import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { useErrorHandle } from "./useErrorHandle";
import type { FacebookUser } from "@/types";
import { ERROR_MESSAGES } from "@/constants/errorMessages";

// Email is not allowed in development mode
const scopes = ["public_profile"];

export function useFacebookAuth() {
  const authStore = useAuthStore();
  const { handleError } = useErrorHandle();

  function initFacebook() {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: import.meta.env.VITE_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });

      authStore.facebookReady = true;
    };

    const script = document.createElement("script");
    script.src = import.meta.env.VITE_FACEBOOK_SOURCE;
    script.async = true;
    script.defer = true;
    script.onerror = (error) => {
      handleError({
        level: "toast",
        message: ERROR_MESSAGES.AUTH.FACEBOOK_SDK_LOAD_FAILED,
        error,
      });
    };
    document.head.appendChild(script);
  }

  function loginFacebook() {
    try {
      if (!window.FB) {
        handleError({ level: "toast", message: ERROR_MESSAGES.AUTH.FACEBOOK_SDK_NOT_READY });
        return;
      }
      window.FB.login(
        (response: any) => {
          if (response.status === "connected") {
            window.FB.api("/me", { fields: "id,name,picture" }, (profile: any) => {
              authStore.setFacebookUser({
                id: profile.id,
                name: profile.name,
                avatar: profile.picture?.data?.url,
              });
            });
          } else {
            handleError({ level: "toast", message: ERROR_MESSAGES.AUTH.FACEBOOK_LOGIN_CANCELLED });
          }
        },
        { scope: scopes.join(",") }
      );
    } catch (error) {
      handleError({
        level: "toast",
        message: ERROR_MESSAGES.AUTH.FACEBOOK_LOGIN_ERROR,
        error,
      });
    }
  }

  onMounted(initFacebook);

  return { loginFacebook };
}
