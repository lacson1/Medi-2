// Auth Hook - Separated from AuthContext to fix React Fast Refresh issues
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import type { AuthContextType } from '../contexts/AuthContext';

// Custom hook to use auth context
export function useAuth(): AuthContextType {
    console.log('🔍 useAuth hook called');
    const context = useContext(AuthContext);
    console.log('🔍 Context value:', context ? 'exists' : 'null');

    // Since we now have a default context, we don't need to check for null
    // But we can still log if we're getting the default context
    if (context.user === null && context.loading === true && !context.isAuthenticated) {
        console.log('🔍 Using default context (AuthProvider may not be initialized)');
    }

    return context;
}
