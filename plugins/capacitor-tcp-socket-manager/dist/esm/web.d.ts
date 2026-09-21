import { WebPlugin } from '@capacitor/core';
import type { TcpSocketManagerPlugin } from './definitions';
export declare class TcpSocketManagerWeb extends WebPlugin implements TcpSocketManagerPlugin {
    constructor();
    startServer(): Promise<{
        success: boolean;
        message?: string;
        ipAddress: string;
        port: number;
    }>;
    stopServer(): Promise<{
        success: boolean;
    }>;
    receiveMessage(): Promise<{
        message: string;
    }>;
    getClientCount(): Promise<{
        count: number;
    }>;
    connectToServer(): Promise<{
        success: boolean;
    }>;
    disconnectFromServer(): Promise<{
        success: boolean;
    }>;
    sendMessageToServer(): Promise<{
        success: boolean;
    }>;
    addListener(eventName: 'receiveMessage', listenerFunc: (data: {
        message: string;
    }) => void): any;
}
declare const TcpSocketManager: TcpSocketManagerWeb;
export { TcpSocketManager };
