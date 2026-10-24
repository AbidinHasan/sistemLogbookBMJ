<script setup>
import { ref, onMounted } from "vue";
import { backendApi } from "../services/api.js";

const notes = ref([]);

const form = ref({
  id: null,
  caption: "",
  tanggal: "",
});

defineProps({
  form: Object,
});

const emit = defineEmits(["submitForm", "handleFile", "tanggal"]);

const editData = (item) => {
  form.value.id = item.id;
  form.value.caption = item.caption;
  form.value.tanggal = item.tanggal;
};

const selectedFile = ref(null);

const handleFile = (e) => {
  selectedFile.value = e.target.files[0];
};

const loadNotes = async () => {
  try {
    const response = await backendApi.get("/uptod1");

    notes.value = response.data.results || [];
    console.log("Sukses");
  } catch (err) {
    console.error(err);
  }
};

const submitForm = async () => {
  try {
    const formData = new FormData();

    formData.append("caption", form.value.caption);
    formData.append("tanggal", form.value.tanggal);

    if (selectedFile.value) {
      formData.append("file", selectedFile.value);
    }

    if (!form.value.id) {
      await backendApi.post("/uptod1", formData);
    } else {
      await backendApi.put(`/uptod1/${form.value.id}`, formData);
    }

    resetForm();
    loadNotes();
    console.log({
      response: "Form submitted successfully",
    });
  } catch (err) {
    console.error("Error:", err);
    console.error("Response:", err.response?.data);
    console.error("Status:", err.response?.status);
  }
};

const deleteNote = async (id) => {
  if (!confirm("Yakin ingin menghapus?")) {
    return;
  }

  try {
    await backendApi.delete(`/uptod1/${id}`);

    loadNotes();
  } catch (err) {
    console.error(err);
  }
};

const resetForm = () => {
  form.value = {
    id: null,
    caption: "",
    tanggal: "",
  };

  selectedFile.value = null;
};

onMounted(() => {
  loadNotes();
});
</script>

<template>
  <div class="form-container">
    <form
      class="form"
      @submit.prevent="emit('submitForm')"
      enctype="multipart/form-data"
    >
      <div class="form-group">
        <label for="date">Tanggal</label>
        <input
          required=""
          name="date"
          id="date"
          type="date"
          v-model="form.tanggal"
        />
      </div>
      <div class="form-group">
        <label for="file">Upload File</label>
        <input
          name="file"
          id="file"
          type="file"
          @change="emit('handleFile', $event)"
        />
      </div>
      <div class="form-group">
        <label for="caption">Catatan</label>
        <textarea
          required=""
          cols="50"
          rows="10"
          id="caption"
          name="caption"
          v-model="form.caption"
        ></textarea>
      </div>
      <button type="submit" class="form-submit-btn">
        {{ form.id ? "Update" : "Submit" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  width: 400px;
  background:
    linear-gradient(#212121, #212121) padding-box,
    linear-gradient(145deg, transparent 35%, #e81cff, #40c9ff) border-box;
  border: 2px solid transparent;
  padding: 32px 24px;
  font-size: 14px;
  font-family: inherit;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  border-radius: 16px;
  background-size: 200% 100%;
  animation: gradient 5s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.form-container button:active {
  scale: 0.95;
}

.form-container .form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-container .form-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.form-container .form-group label {
  display: block;
  margin-bottom: 5px;
  color: #717171;
  font-weight: 600;
  font-size: 12px;
}

.form-container .form-group input {
  width: 300px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #fff;
  font-family: inherit;
  background-color: transparent;
  border: 1px solid #414141;
}

.form-container .form-group textarea {
  width: 300px;
  padding: 12px 16px;
  border-radius: 8px;
  resize: none;
  color: #fff;
  height: 96px;
  border: 1px solid #414141;
  background-color: transparent;
  font-family: inherit;
}

.form-container .form-group input::placeholder {
  opacity: 0.5;
}

.form-container .form-group input:focus {
  outline: none;
  border-color: #e81cff;
}

.form-container .form-group textarea:focus {
  outline: none;
  border-color: #e81cff;
}

.form-container .form-submit-btn {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  align-self: flex-start;
  font-family: inherit;
  color: #717171;
  font-weight: 600;
  width: 40%;
  background: #313131;
  border: 1px solid #414141;
  padding: 12px 16px;
  font-size: inherit;
  gap: 8px;
  margin-top: 8px;
  cursor: pointer;
  border-radius: 6px;
}

.form-container .form-submit-btn:hover {
  background-color: #fff;
  border-color: #fff;
}
</style>
