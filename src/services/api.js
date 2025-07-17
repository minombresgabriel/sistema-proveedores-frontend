import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.PERRITO_DE_ARROZ,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `${token}`;
  return config;
});

export default instance;
