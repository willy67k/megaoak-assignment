<script setup lang="ts">
import { useGoogleAuth } from "@/composables/useGoogleAuth";
import { useFacebookAuth } from "@/composables/useFacebookAuth";
import { useAuth } from "@/composables/useAuth";
import { watch } from "vue";
import { RouterLink, useRouter } from "vue-router";

useGoogleAuth();
const { loginFacebook } = useFacebookAuth();
const { isFullyAuthed, user } = useAuth();
const router = useRouter();

watch(
  isFullyAuthed,
  (authed) => {
    if (authed) {
      router.push("/map");
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="mx-auto max-w-md space-y-4 rounded bg-white p-6 shadow-md">
    <div class="flex items-center justify-between">
      <div>
        <p class="font-semibold">Google Login</p>
        <p class="text-sm text-gray-500" v-if="user?.google">已登入: {{ user.google.name }}</p>
      </div>
      <div id="google-btn"></div>
    </div>

    <div class="flex items-center justify-between">
      <div>
        <p class="font-semibold">Facebook Login</p>
        <p class="text-sm text-gray-500" v-if="user?.facebook">已登入: {{ user.facebook.name }}</p>
      </div>
      <button type="button" class="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50" @click="loginFacebook" :disabled="!!user?.facebook">Facebook Login</button>
    </div>

    <div v-if="isFullyAuthed" class="mt-4 rounded bg-green-100 p-4 font-bold text-green-800">
      <RouterLink to="map">已完成雙重登入，將自動導向新北市都市更新地點查詢，若未導向請點擊此</RouterLink>
    </div>
  </div>
</template>
