<style scoped>
.radio-inputs {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  border-radius: 0.5rem;
  background-color: #eee;
  box-sizing: border-box;
  box-shadow: 0 0 0px 1px rgba(0, 0, 0, 0.06);
  padding: 0.25rem;
  width: 300px;
  font-size: 14px;
}

.radio-inputs .radio {
  flex: 1 1 auto;
  text-align: center;
}

.radio-inputs .radio input {
  display: none;
}

.radio-inputs .radio .name {
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: none;
  padding: 0.5rem 0;
  color: rgb(17, 22, 30);
  transition: all 0.15s ease-in-out;
}

.radio-inputs .radio input:checked + .name {
  background-color: #4d75cc;
  font-weight: 600;
}
</style>

<template>
  <div class="radio-inputs">
    <label class="radio">
      <input
        type="radio"
        name="radio"
        checked=""
        :value="null"
        v-model="model"
      />
      <span class="name">{{ judul }}</span>
    </label>
    <label class="radio">
      <input type="radio" name="radio" :value="judul1" v-model="model" />
      <span class="name">{{ judul1 }}</span>
    </label>
    <label class="radio">
      <input type="radio" name="radio" :value="judul2" v-model="model" />
      <span class="name">{{ judul2 }}</span>
    </label>
    <label class="radio">
      <input type="radio" name="radio" :value="judul3" v-model="model" />
      <span class="name">{{ judul3 }}</span>
    </label>
  </div>
</template>

<script setup>
defineProps({
  judul: String,
  judul1: String,
  judul2: String,
  judul3: String,
});

const model = defineModel();
</script>
