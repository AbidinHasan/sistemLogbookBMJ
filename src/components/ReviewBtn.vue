<style scoped>
button {
  padding: 0;
  margin: 0;
  border: none;
  background: none;
  cursor: pointer;
}

button {
  --primary-color: #ffffff;
  --hovered-color: #c724d6;
  position: relative;
  display: flex;
  font-weight: 600;
  font-size: 20px;
  gap: 0.5rem;
  align-items: center;
}

button p {
  margin: 0;
  position: relative;
  font-size: 20px;
  color: var(--primary-color);
}

button::after {
  position: absolute;
  content: "";
  width: 0;
  left: 0;
  bottom: -7px;
  background: var(--hovered-color);
  height: 2px;
  transition: 0.3s ease-out;
}

button p::before {
  position: absolute;
  /*   box-sizing: border-box; */
  content: attr(data-text);
  width: 0%;
  inset: 0;
  color: var(--hovered-color);
  overflow: hidden;
  transition: 0.3s ease-out;
}

button:hover::after {
  width: 100%;
}

button:hover p::before {
  width: 100%;
}

button:hover svg {
  transform: translateX(4px);
  color: var(--hovered-color);
}

button svg {
  color: var(--primary-color);
  transition: 0.2s;
  position: relative;
  width: 15px;
  transition-delay: 0.2s;
}
</style>

<template>
  <button>
    <p :data-text="judul">{{ judul }}</p>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="4"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      ></path>
    </svg>
  </button>
</template>

<script setup>
defineProps({
  judul: String,
});
</script>
