// src/redux/store.ts

import { configureStore, combineReducers } from "@reduxjs/toolkit";

import loginReducer       from "./login/loginSlice";
import roleReducer       from "./roles/roleReducer";
import permissionReducer from "./permissions/permissionSlice";
import userReducer from "./users/userSlice";
import patientReducer from "./patients/patientSlice";
import typeReducer from "./measurementTypes/slice";
import caseReducer from "./cases/slice";
import todosReducer from "./todos/todoSlice";
import doctorCases from "./doctorCases/doctorCasesSlice";
import settings from "./settings/settingsUiSlice";
import generalSettings from "./settings/generalSlice";

import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { companyName } from "../requestMethods";

const persistConfig = {
  key: companyName,
  version: 1,
  storage,
};

const rootReducer = combineReducers({ 
  login: loginReducer,
  roles: roleReducer,
  permissions: permissionReducer,
  users: userReducer,
  patients: patientReducer,
  measurementTypes: typeReducer,
  cases: caseReducer,
  todos: todosReducer,
  doctorCases,
  settings, // for (language and dark mode) settings
  generalSettings,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export let persistor = persistStore(store);

export type State = ReturnType<typeof rootReducer>
