import axios from "axios";
import { store } from "../store";
import { setLogout } from "../store/slices/userSlice";

axios.defaults.baseURL = "https://stanford-parents-bot-backend-production.up.railway.app/api/";

axios.interceptors.request.use(
  (config) => {
    const token = store.getState().user.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      location.href = "/login";
      store.dispatch(setLogout());
      console.error("Avtorizatsiya muddati tugagan. Qayta kiring.");
    }
    return Promise.reject(error);
  }
);

const api = {
  get: (url, params) => axios.get(url, { params }),
  post: (url, data) => axios.post(url, data),
  put: (url, data) => axios.put(url, data),
  delete: (url) => axios.delete(url),
  patch: (url, data) => axios.patch(url, data),
};

export default api;
