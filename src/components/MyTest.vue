<template>
  <div class="flex items-center justify-between bg-black p-4 text-white">
    <p>Hi</p>
  </div>
</template>

<script setup lang="ts">
const foo = (a: number, b: number) => {
  console.log(a + b);
};
</script>

<style lang="scss" scoped>
.card {
  display: flex;
  padding: 16px;
  color: red;
  background: black;
}
</style>
