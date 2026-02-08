import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth.store";

declare global {
  interface Window {
    google: any;
  }
}

export function useGoogleAuth() {
  const authStore = useAuthStore();

  function decodeJwt(token: string) {
    const base64Url = token.split(".")[1];
    if (!base64Url) return;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
  }

  function handleCredentialResponse(response: any) {
    const payload = decodeJwt(response.credential);

    if (!payload) return;

    authStore.setGoogleUser({
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      avatar: payload.picture,
    });
  }

  function initGoogle() {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: "567448751226-h01v27amboln38il8t01v9dl07hiildu.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(document.getElementById("google-btn"), { theme: "outline", size: "large" });

    authStore.googleReady = true;
  }

  onMounted(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  });

  return { initGoogle };
}
