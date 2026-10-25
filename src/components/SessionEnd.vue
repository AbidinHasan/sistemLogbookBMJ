<script setup>
const emit = defineEmits("oke");
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-box">
      <div class="modal-icon">⏰</div>
      <h3>Sesi Berakhir</h3>
      <p>
        Karena tidak ada aktivitas dalam beberapa waktu. Silakan login kembali
        untuk melanjutkan.
      </p>

      <button class="btn-login" @click="emit('oke')">Oke</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  backdrop-filter: blur(4px);
}

.modal-box {
  width: min(90%, 420px);
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  text-align: center;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  animation: popup 0.25s ease;
}

.modal-icon {
  font-size: 52px;
  margin-bottom: 10px;
}

.modal-box h3 {
  margin: 0 0 10px;
  color: #323130;
}

.modal-box p {
  margin: 0 0 20px;
  color: #605e5c;
  line-height: 1.5;
}

.btn-login {
  width: 100%;
  border: none;
  padding: 12px;
  border-radius: 12px;
  background: #0078d4;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.btn-login:hover {
  background: #106ebe;
}

@keyframes popup {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
