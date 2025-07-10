import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarOpen: false,
  theme: 'light',
  notifications: [],
  loading: false,
  currentPage: 'dashboard',
  breadcrumbs: [],
  modals: {
    addDomain: false,
    addRule: false,
    billing: false,
    profile: false,
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      })
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false
      })
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setCurrentPage,
  setBreadcrumbs,
  setLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
} = uiSlice.actions

export default uiSlice.reducer
