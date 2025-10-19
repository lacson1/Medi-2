import React from 'react';
import { useAuth } from "@/hooks/useAuth";

export default function SimpleTest() {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <div>Not authenticated</div>;
    }

    return (
        <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh' }}>
            <h1>Simple Test Component</h1>
            <p>User: {user?.first_name} {user?.last_name}</p>
            <p>Role: {user?.role}</p>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
        </div>
    );
}
