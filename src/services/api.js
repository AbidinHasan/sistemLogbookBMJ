import axios from "axios";

export const backendApi = axios.create({
  baseURL: "https://tester.bidin.bid/",
});

export const API = {
  download: "https://tester.bidin.bid/download/",
  dokumen: "https://tester.bidin.bid/document/",
};
