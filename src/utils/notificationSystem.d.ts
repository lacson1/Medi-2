declare module '@/utils/notificationSystem' {
    export class NotificationSystem {
        sendNotification(userId: string, type: string, message: string, data?: any): Promise<void>;
        sendAccessNotification(data: any): Promise<void>;
    }
}

