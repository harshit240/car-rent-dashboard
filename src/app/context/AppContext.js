'use client';
import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  notifications: [],
  listings: [],
  loading: false
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };
    case 'SET_LISTINGS':
      return {
        ...state,
        listings: action.payload
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now(),
          ...action.payload
        }]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addNotification = (message, type = 'info') => {
    const notificationId = Date.now();
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { message, type, id: notificationId }
    });

    setTimeout(() => {
      dispatch({
        type: 'REMOVE_NOTIFICATION',
        payload: notificationId
      });
    }, 5000);
  };

  return (
    <AppContext.Provider value={{ state, dispatch, addNotification }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};