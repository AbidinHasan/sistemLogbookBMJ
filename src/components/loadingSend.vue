<style scoped>
.textWrapper {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  height: fit-content;
  min-width: 3rem;
  width: fit-content;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.25ch;
  color: rgb(255, 255, 255);
  z-index: 9999;
}

.invertbox {
  position: absolute;
  height: 100%;
  aspect-ratio: 1/1;
  left: 0;
  top: 0;
  border-radius: 20%;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: invert(100%);
  animation: move 2s ease-in-out infinite;
}

@keyframes move {
  50% {
    left: calc(100% - 3rem);
  }
}
</style>

<template>
  <div class="textWrapper">
    <p class="text">Loading...</p>
    <div class="invertbox"></div>
  </div>
</template>
