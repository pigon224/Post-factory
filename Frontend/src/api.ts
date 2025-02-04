import axios from "axios";
const BCKND_HOST = process.env.REACT_APP_BCKND_HOST || "localhost";
const BCKND_PORT = process.env.REACT_APP_BCKND_PORT || "8000";
const baseurl = `http://${BCKND_HOST}:${BCKND_PORT}`;
const api = axios.create({
  baseURL: baseurl,
  withCredentials: true,
});
export default api;
