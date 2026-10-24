import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const username = ref(localStorage.getItem("username") || "");
  const fullname = ref(localStorage.getItem("fullname") || "");
  const grup = ref(localStorage.getItem("grup") || "");
  const role = ref(localStorage.getItem("role") || "");
  const id = ref(localStorage.getItem("id") || "");

  const login = (user) => {
    username.value = user.username;
    fullname.value = user.fullname;
    grup.value = user.grup;
    role.value = user.role;
    id.value = user.id;

    localStorage.setItem("username", user.username);
    localStorage.setItem("fullname", user.fullname);
    localStorage.setItem("grup", user.grup);
    localStorage.setItem("role", user.role);
    localStorage.setItem("id", user.id);
    localStorage.setItem("expiredTime", Date.now() + 43200000);
  };

  const logout = () => {
    username.value = "";
    fullname.value = "";
    grup.value = "";
    role.value = "";
    id.value = "";

    localStorage.removeItem("username");
    localStorage.removeItem("fullname");
    localStorage.removeItem("grup");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    localStorage.removeItem("expiredTime");
  };

  return {
    username,
    fullname,
    grup,
    role,
    id,
    login,
    logout,
  };
});
