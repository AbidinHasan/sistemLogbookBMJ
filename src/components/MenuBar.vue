<template>
  <nav id="navbar" ref="navbarRef">
    <!-- From Uiverse.io by vinodjangid07 -->
    <input
      id="checkbox"
      type="checkbox"
      @click="toggleMenu"
      ref="checkboxRef"
    />
    <label class="toggle" for="checkbox">
      <div id="bar1" class="bars"></div>
      <div id="bar2" class="bars"></div>
      <div id="bar3" class="bars"></div>
    </label>

    <div v-if="menuOpen" class="dropdown">
      <PathDropdown @click="closeMenu" />
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import PathDropdown from "./PathDropdown.vue";

const menuOpen = ref(false);
const navbarRef = ref(null);
const checkboxRef = ref(null);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function closeMenu() {
  menuOpen.value = false;
  if (checkboxRef.value) {
    checkboxRef.value.checked = false;
  }
}

function handleDocumentClick(event) {
  if (!navbarRef.value) return;
  if (!navbarRef.value.contains(event.target)) {
    closeMenu();
  }
}

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
});
</script>

<style scoped>
/* From Uiverse.io by vinodjangid07 */
#checkbox {
  display: none;
}

#navbar {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle {
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition-duration: 0.3s;
}

.bars {
  width: 100%;
  height: 4px;
  background-color: rgb(253, 255, 243);
  border-radius: 5px;
  transition-duration: 0.3s;
}

/*#checkbox:checked + .toggle .bars {
  margin-left: 17px;
} */

#checkbox:checked + .toggle #bar2 {
  transform: translateY(14px) rotate(40deg);
  margin-left: 0;
  transform-origin: right;
  transition-duration: 0.3s;
  z-index: 2;
}

#checkbox:checked + .toggle #bar1 {
  transform: translateY(28px) translateX(9px) rotate(-40deg);
  transition-duration: 0.3s;
  transform-origin: left;
  z-index: 1;
}

#checkbox:checked + .toggle {
  transform: rotate(-0deg);
}
#checkbox:checked + .toggle #bar3 {
  transform: rotate(40deg);
  transition-duration: 0.3s;
  transform-origin: right;
}
</style>
