import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth.store";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

// Email is not allowed in development mode
const scopes = ["public_profile"];

export function useFacebookAuth() {
  const authStore = useAuthStore();

  function initFacebook() {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "1642334463870652",
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });

      authStore.facebookReady = true;
    };

    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/zh_TW/sdk.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  function loginFacebook() {
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
        }
      },
      { scope: scopes.join(",") }
    );
  }

  onMounted(initFacebook);

  return { loginFacebook };
}
