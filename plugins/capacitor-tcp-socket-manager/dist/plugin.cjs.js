'use strict';

var core = require('@capacitor/core');

const TcpSocketManager$1 = core.registerPlugin('TcpSocketManager', {
    web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.TcpSocketManagerWeb()),
});

class TcpSocketManagerWeb extends core.WebPlugin {
    constructor() {
        super({
            name: 'TcpSocketManager',
            platforms: ['web'],
        });
    }
    // Server
    async startServer() {
        console.warn('Web does not support starting a TCP server.');
        return { success: false, message: 'Web platform does not support this functionality.', ipAddress: '192.168.0.100', port: 8080 };
    }
    async stopServer() {
        console.warn('Web does not support stopping a TCP server.');
        return { success: false };
    }
    async receiveMessage() {
        console.log('receiveMessage called (Web)');
        return { message: 'Not available on Web' };
    }
    getClientCount() {
        console.warn('getClientCount is not implemented on the web platform');
        return Promise.resolve({ count: 0 });
    }
    // Client
    async connectToServer() {
        console.warn('Web does not support TCP socket connections.');
        return { success: false };
    }
    async disconnectFromServer() {
        console.warn('Web does not support disconnecting from a TCP server.');
        return { success: false };
    }
    async sendMessageToServer() {
        console.warn('Web does not support sending messages to a TCP server.');
        return { success: false };
    }
    addListener(eventName, listenerFunc) {
        console.log(`Listener added for event: ${eventName}`);
        return super.addListener(eventName, listenerFunc);
    }
}
const TcpSocketManager = new TcpSocketManagerWeb();

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    TcpSocketManager: TcpSocketManager,
    TcpSocketManagerWeb: TcpSocketManagerWeb
});

exports.TcpSocketManager = TcpSocketManager$1;
//# sourceMappingURL=plugin.cjs.js.map
