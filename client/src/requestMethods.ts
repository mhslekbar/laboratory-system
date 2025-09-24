// src/requestMethods.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

const port = "3052";
export const companyName: any = "lab_system";
export const hostName = `http://localhost:${port}/`;
// export const hostName = `https://api.medepratlab.com/`;

const BASE_URL = `${hostName}api/`;

export const publicRequest = axios.create({ baseURL: BASE_URL });

export const UserData: any = () => {
  const persist = localStorage.getItem(`persist:${companyName}`);
  let userData: any;
  if (persist) {
    const login = JSON.parse(persist).login;
    if (login) userData = JSON.parse(login).userData;
  }
  return userData;
};
const setUserData = (updater: (prev: any) => any) => {
  const key = `persist:${companyName}`;
  const raw = localStorage.getItem(key);
  if (!raw) return;
  const parsed = JSON.parse(raw);
  const login = parsed.login ? JSON.parse(parsed.login) : {};
  login.userData = updater(login.userData);
  parsed.login = JSON.stringify(login);
  localStorage.setItem(key, JSON.stringify(parsed));
};

export enum TypeMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

/* --------------------- axios instance with auth --------------------- */
const auth: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // needed to send/receive refresh cookie on /auth/refresh
});

// attach Authorization on each request
auth.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = UserData()?.accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  (config.headers as any)["Cache-Control"] = "no-cache";
  return config;
});

/* ------------------- refresh flow & 401 retry once ------------------ */
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const doRefresh = async (): Promise<string | null> => {
  // call /auth/refresh (uses refresh cookie)
  const res = await axios.post(`${BASE_URL}auth/refresh`, {}, { withCredentials: true });
  const newAccess = res?.data?.accessToken as string | undefined;
  if (newAccess) {
    setUserData(prev => ({ ...(prev || {}), accessToken: newAccess }));
    return newAccess;
  }
  return null;
};

auth.interceptors.response.use(
  r => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = doRefresh().finally(() => (isRefreshing = false));
        }
        const newToken = await refreshPromise!;
        if (!newToken) throw new Error("No new token");
        // re-attach header and retry
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newToken}`;
        return axios(original);
      } catch (e) {
        // optional: clear local storage on hard failure
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

/* ------------------------- export API helpers ------------------------ */

export const privateRequest = async (method: TypeMethod, url: string, data?: object) => {
  try {
    const response = await auth({ method, url, data });
    return response;
  } catch (error) {
    throw error;
  }
};

export const customPrivateRequest = async (method: TypeMethod, url: string, data?: object) => {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${url}`,
      data,
      headers: {
        Authorization: `Bearer public`,
        "Cache-Control": "no-cache",
      },
      withCredentials: true,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const get = async (url: string) => privateRequest(TypeMethod.GET, url);
export const getCustom = async (url: string) => customPrivateRequest(TypeMethod.GET, url);
export const post = async (url: string, data: object) => privateRequest(TypeMethod.POST, url, data);
export const postCustom = async (url: string, data: object) => customPrivateRequest(TypeMethod.POST, url, data);
export const put = async (url: string, data: object) => privateRequest(TypeMethod.PUT, url, data);
export const remove = async (url: string) => privateRequest(TypeMethod.DELETE, url);
