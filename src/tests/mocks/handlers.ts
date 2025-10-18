import { http, HttpResponse } from 'msw';

export const handlers = [
    // Mock API handlers
    http.get('/api/patients', () => {
        return HttpResponse.json([
            {
                id: '1',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }
        ]);
    }),

    http.get('/api/appointments', () => {
        return HttpResponse.json([
            {
                id: '1',
                patient_id: '1',
                appointment_date: '2024-01-15T10:00:00Z',
                status: 'scheduled',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }
        ]);
    }),

    http.get('/api/users', () => {
        return HttpResponse.json([
            {
                id: '1',
                first_name: 'Admin',
                last_name: 'User',
                email: 'admin@example.com',
                role: 'Admin',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }
        ]);
    }),

    http.get('/api/organizations', () => {
        return HttpResponse.json([
            {
                id: '1',
                name: 'Test Organization',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }
        ]);
    }),
];
