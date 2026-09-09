// Single shared axios instance so every consumer (api/client, shared/api and
// all pages) gets the same same-origin baseURL + refresh-on-401 interceptor.
export { default } from "../shared/api/axios.js";