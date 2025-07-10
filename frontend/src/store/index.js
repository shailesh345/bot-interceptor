import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import dashboardReducer from './slices/dashboardSlice'
import domainsReducer from './slices/domainsSlice'
import rulesReducer from './slices/rulesSlice'
import analyticsReducer from './slices/analyticsSlice'
import billingReducer from './slices/billingSlice'
import userReducer from './slices/userSlice';
import adminReducer from './slices/adminSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'], // Only persist auth and ui state
}

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  dashboard: dashboardReducer,
  domains: domainsReducer,
  rules: rulesReducer,
  analytics: analyticsReducer,
  billing: billingReducer,
  user: userReducer,
  admin: adminReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.DEV,
})

export const persistor = persistStore(store)

export default store
