<script setup>
import { onMounted } from "vue";

onMounted(() => {
  window.location.href = "https://ipal.bidin.bid";
});
</script>

<template>
  <section id="center">
    <div class="hero">
      <img :src="heroImg" class="base" width="170" height="179" alt="" />
      <img
        src="https://storage-ipal.bidin.workers.dev/document/LOGO_ABDN_white.png"
        class="framework"
        alt="Vue logo"
      />
      <img :src="vueLogo" class="vite" alt="vue" />
    </div>
    <div>
      <h1>Get started</h1>
    </div>
  </section>
</template>
