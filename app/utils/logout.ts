import { store, persistor } from '@/stores/rootStore';
import { authApi } from '@/stores/api/authApi';

/**
 * Comprehensive logout utility that clears all application state.
 * This function:
 * 1. Clears RTK Query cache
 * 2. Dispatches LOGOUT action to reset Redux state
 * 3. Purges persisted state
 * 4. Ensures complete cleanup of user data
 */
export const logoutAndClearState = async (): Promise<void> => {
  try {
    console.log('🔄 Starting logout and state cleanup...');
    
    // 1. Clear RTK Query cache first to avoid any pending requests
    store.dispatch(authApi.util.resetApiState());
    
    // 2. Dispatch LOGOUT action to reset all Redux slices
    store.dispatch({ type: 'LOGOUT' });
    
    // 3. Purge persisted state (this will trigger persist/PURGE action)
    await persistor.purge();
    
    // 4. Small delay to ensure all async operations complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('✅ Application state cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing application state:', error);
    // Don't throw the error to prevent logout from failing completely
    console.warn('⚠️ Logout will continue despite cleanup errors');
  }
}; 