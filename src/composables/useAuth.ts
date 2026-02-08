import { computed } from "vue";
import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  const store = useAuthStore();

  return {
    user: computed(() => store.user),
    isFullyAuthed: computed(() => store.isFullyAuthed),
  };
}
