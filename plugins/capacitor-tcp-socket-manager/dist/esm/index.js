import { registerPlugin } from '@capacitor/core';
const TcpSocketManager = registerPlugin('TcpSocketManager', {
    web: () => import('./web').then((m) => new m.TcpSocketManagerWeb()),
});
export * from './definitions';
export { TcpSocketManager };
//# sourceMappingURL=index.js.map