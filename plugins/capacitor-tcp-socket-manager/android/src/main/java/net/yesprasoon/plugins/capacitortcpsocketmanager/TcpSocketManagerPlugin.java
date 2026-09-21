package net.yesprasoon.plugins.capacitortcpsocketmanager;

import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Enumeration;
import java.util.Collections;


@CapacitorPlugin(name = "TcpSocketManager")
public class TcpSocketManagerPlugin extends Plugin {

    private static final String TAG = "TcpSocketManager";

    private ServerSocket serverSocket;
    private Socket clientSocket;
    private final java.util.Map<String, Socket> clientConnections = Collections.synchronizedMap(new java.util.LinkedHashMap<>());
    private final java.util.concurrent.atomic.AtomicInteger clientIdCounter = new java.util.concurrent.atomic.AtomicInteger(0);
    private static final int MAX_CLIENTS = 10;
    private Thread heartbeatThread;
    private volatile boolean isHeartbeatRunning = false;
    private String serverIpAddress;
    private Integer serverPort;
    private volatile boolean isServerRunning = false; // Volatile ensures thread-safety


    private String getDeviceIpAddress() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface networkInterface = interfaces.nextElement();
                if (networkInterface.isLoopback() || !networkInterface.isUp()) continue;

                Enumeration<InetAddress> addresses = networkInterface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress address = addresses.nextElement();
                    if (address instanceof Inet4Address && !address.isLoopbackAddress()) {
                        return address.getHostAddress();
                    }
                }
            }
        } catch (SocketException e) {
            e.printStackTrace();
        }
        return "Unknown IP";
    }

    private boolean isValidIpAddress(String ipAddress) {
        try {
            InetAddress.getByName(ipAddress);
            return true;
        } catch (UnknownHostException e) {
            return false;
        }
    }

    // Start Server
    @PluginMethod
    public void startServer(PluginCall call) {
        int port = call.getInt("port", 8080);
        Log.d(TAG, "startServer called with port: " + port);
        try {
            if (port < 1 || port > 65535) {
                call.reject("Invalid port number. Port must be between 1 and 65535.");
                return;
            }

            // Check if the server is already running
            if (serverSocket != null && !serverSocket.isClosed()) {
                Log.w(TAG, "Server is already running on port: " + serverSocket.getLocalPort());
                String ipAddress = getDeviceIpAddress(); // Get the device's actual IP
                call.resolve(new JSObject()
                        .put("success", true)
                        .put("message", "Server already running")
                        .put("ipAddress", ipAddress)
                        .put("port", serverSocket.getLocalPort()));
                return;
            }

            // Reset client socket if previously connected
            if (clientSocket != null && !clientSocket.isClosed()) {
                try {
                    clientSocket.close();
                    clientSocket = null;
                    Log.i(TAG, "Resetting client socket before starting the server.");
                } catch (IOException e) {
                    Log.e(TAG, "Error closing client socket before restarting server: " + e.getMessage());
                }
            }

            // Initialize the server
            serverSocket = new ServerSocket(port);
            serverSocket.setSoTimeout(30000); // Optional: set timeout
            isServerRunning = true; // Set flag to true

            new Thread(() -> listenForClients()).start();
            String ipAddress = getDeviceIpAddress(); // Get the device's actual IP

            call.resolve(new JSObject()
                .put("success", true)
                .put("ipAddress", ipAddress)
                .put("port", port));
            Log.i(TAG, "Server started successfully on IP " + ipAddress + " and port " + port);
        } catch (IOException e) {
             Log.e(TAG, "Failed to start server on port " + port + ": " + e.getMessage(), e);
            call.reject("Error starting server. Please check logs for more details.", e);
        }
    }

    private void listenForClients() {
        while (isServerRunning && !serverSocket.isClosed()) {
            try {
                Socket client = serverSocket.accept();
                if (client == null || client.isClosed()) {
                    Log.w(TAG, "Connection attempt failed.");
                    continue;
                }
                handleClient(client); // Delegate each client connection
            } catch (SocketTimeoutException e) {
                Log.w(TAG, "Socket accept timed out, continuing...");
            } catch (IOException e) {
                Log.e(TAG, "Error accepting client connection", e);
            }
        }
    }


    private void handleClient(Socket client) {
        new Thread(() -> {
            String clientId = null;
            try {
                if (clientConnections.size() >= MAX_CLIENTS) {
                    cleanupClientSocket(client); // Reject the client and clean up
                    Log.w(TAG, "Connection rejected: Maximum client limit reached.");
                    return;
                }

                clientId = "client-" + clientIdCounter.incrementAndGet();
                synchronized (clientConnections) {
                    clientConnections.put(clientId, client);
                }

                JSObject connectedEvent = new JSObject();
                connectedEvent.put("clientId", clientId);
                connectedEvent.put("remoteAddress", client.getInetAddress().getHostAddress());
                notifyListeners("clientConnected", connectedEvent);

                BufferedReader in = new BufferedReader(new InputStreamReader(client.getInputStream()));
                String message;
                while ((message = in.readLine()) != null) {
                    if (message.trim().isEmpty()) continue; // ligne vide = heartbeat, on ignore
                    Log.i(TAG, "Received message from " + clientId + ": " + message);

                    // Notify the frontend with the received message
                    JSObject eventData = new JSObject();
                    eventData.put("clientId", clientId);
                    eventData.put("message", message);
                    notifyListeners("receiveMessage", eventData);
                }
            } catch (IOException e) {
                Log.e(TAG, "Error in client handling", e);
            } finally {
                cleanupClient(clientId, client);
            }
        }).start();
    }

    private void cleanupClientSocket(Socket client) {
        try {
            client.close();
        } catch (IOException e) {
            Log.e(TAG, "Error closing rejected client socket", e);
        }
    }

    private void cleanupClient(String clientId, Socket client) {
        try {
            if (clientId != null) {
                synchronized (clientConnections) {
                    clientConnections.remove(clientId);
                }
                JSObject disconnectedEvent = new JSObject();
                disconnectedEvent.put("clientId", clientId);
                notifyListeners("clientDisconnected", disconnectedEvent);
            }
            client.close();
            Log.i(TAG, "Client " + clientId + " disconnected and cleaned up.");
        } catch (IOException e) {
            Log.e(TAG, "Error closing client socket", e);
        }
    }

    @PluginMethod
    public void stopServer(PluginCall call) {
        try {
            isServerRunning = false; // Set flag to false
            if (serverSocket != null && !serverSocket.isClosed()) {
                synchronized (clientConnections) {
                    for (java.util.Map.Entry<String, Socket> entry : new java.util.LinkedHashMap<>(clientConnections).entrySet()) {
                        cleanupClient(entry.getKey(), entry.getValue()); // Ensure each client is properly cleaned up
                    }
                    clientConnections.clear();
                }
                serverSocket.close();
                Log.i(TAG, "Server stopped successfully.");
            }
            if (call != null) {
                call.resolve(new JSObject().put("success", true));
            }
        } catch (IOException e) {
            if (call != null) {
                call.reject("Error stopping server", e);
            }
        }
    }

    // Connect to Server (Client)
    @PluginMethod
    public void connectToServer(PluginCall call) {
        String ipAddress = call.getString("ipAddress", "");
        if (!isValidIpAddress(ipAddress)) {
            Log.w(TAG, "Invalid IP address: " + ipAddress);
            call.reject("Invalid IP address format.");
            return;
        }

        int port = call.getInt("port", 8080);
        if (port < 1 || port > 65535) {
            call.reject("Invalid port number. Port must be between 1 and 65535.");
            return;
        }

        if (ipAddress.isEmpty()) {
            call.reject("IP address is required.");
            return;
        }

        synchronized (this) {
            // Close and clean up if a previous connection exists
            if (clientSocket != null && !clientSocket.isClosed()) {
                try {
                    clientSocket.close();
                    clientSocket = null;
                } catch (IOException e) {
                    Log.e(TAG, "Error closing previous socket before reconnecting", e);
                }
            }
        }

        try {
            this.serverIpAddress = ipAddress;
            this.serverPort = port;

            clientSocket = new Socket(ipAddress, port);

            // Enable keep-alive
            clientSocket.setKeepAlive(true);

            // Set socket timeout (optional)
            clientSocket.setSoTimeout(30000);

            Log.i(TAG, "Connected to server at " + ipAddress + ":" + port);

            // Start the heartbeat after connection
            startHeartbeat(ipAddress, port);
            startClientReadLoop();

            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } catch (IOException e) {
            Log.e(TAG, "Error connecting to server: " + e.getMessage());
            call.reject("Failed to connect to server", e);
        }
    }

    // Disconnect from Server (Client)
    @PluginMethod
    public void disconnectFromServer(PluginCall call) {
        stopHeartbeat(); // Stop heartbeat

        synchronized (this) {
            if (clientSocket == null || clientSocket.isClosed()) {
                this.serverIpAddress = null;
                this.serverPort = null;
                JSObject result = new JSObject();
                result.put("success", true);
                result.put("message", "Already disconnected.");
                call.resolve(result);
                return;
            }

            try {
                clientSocket.close();
                clientSocket = null;
                Log.i(TAG, "Disconnected from server successfully.");

                this.serverIpAddress = null;
                this.serverPort = null;
                JSObject result = new JSObject();
                result.put("success", true);
                call.resolve(result);
            } catch (IOException e) {
                Log.e(TAG, "Error disconnecting from server: " + e.getMessage());
                call.reject("Failed to disconnect from server", e);
            }
        }
    }


    // Send Message to Server (Client)
    @PluginMethod
    public void sendMessageToServer(PluginCall call) {
        synchronized (this) {
            // Validate message input
            String message = call.getString("message", "").trim();
            if (message.isEmpty()) {
                call.reject("Message cannot be empty.");
                return;
            }
            // Check message size
            // if (message.length() > 1024) { // Example max size
            //     call.reject("Message exceeds maximum allowed length (1024 characters).");
            //     return;
            // }
            try {
                // Check if client is connected
                if (clientSocket == null || clientSocket.isClosed() || !clientSocket.isConnected()) {
                    Log.w(TAG, "Socket not connected. Attempting to reconnect...");
                    
                    // Get IP and port from parameters or fallback to stored values
                    String ipAddress = call.getString("ipAddress", this.serverIpAddress);
                    int port = call.getInt("port", this.serverPort);

                    // Validate the fallback values
                    if (ipAddress == null || ipAddress.isEmpty() || (port < 1 || port > 65535)) {
                        call.reject("Invalid IP address or port. Ensure valid connection details are set.");
                        return;
                    }

                    // Attempt reconnection
                    if (!reconnectToServer(ipAddress, port)) {
                        call.reject("Failed to reconnect to server.");
                        return;
                    }
                }

                // Send the message
                sendMessage(message);
                call.resolve(new JSObject().put("success", true));

            } catch (IOException e) {
                Log.e(TAG, "Error sending message: " + e.getMessage(), e);

                // Handle "broken pipe" or disconnection specifically
                if (e.getMessage() != null && (e.getMessage().contains("Broken pipe") || e.getMessage().contains("Not connected"))) {
                    Log.w(TAG, "Connection lost. Attempting to reconnect...");

                    // Use fallback values if not explicitly passed
                    String ipAddress = call.getString("ipAddress", this.serverIpAddress);
                    int port = call.getInt("port", this.serverPort);

                    // Validate the fallback values
                    if (ipAddress == null || ipAddress.isEmpty() || port <= 0) {
                        call.reject("Reconnection failed due to missing IP or port.");
                        return;
                    }

                    if (reconnectToServer(ipAddress, port)) {
                        Log.i(TAG, "Reconnected successfully. Retrying message send...");
                        try {
                            sendMessage(message);
                            call.resolve(new JSObject().put("success", true));
                        } catch (IOException retryException) {
                            Log.e(TAG, "Failed to send message after reconnection: " + retryException.getMessage(), retryException);
                            call.reject("Failed to send message after reconnection.", retryException);
                        }
                    } else {
                        call.reject("Reconnection failed. Cannot send message.");
                    }
                } else {
                    call.reject("Failed to send message to server.", e);
                }
            }
        }
    }


    private void sendMessage(String message) throws IOException {
        if (clientSocket == null || clientSocket.isClosed()) {
            throw new IOException("Not connected to server.");
        }
        clientSocket.getOutputStream().write((message + "\n").getBytes());
        clientSocket.getOutputStream().flush(); // Ensure message is sent immediately
        Log.i(TAG, "Message sent to server: " + message);
    }

    // Boucle de lecture côté client : reçoit les messages envoyés par le serveur
    // (sendMessageToClient / broadcastToClients côté hôte). Redémarrée à chaque
    // (re)connexion, y compris après une reconnexion automatique du heartbeat.
    private void startClientReadLoop() {
        final Socket socketRef = clientSocket;
        if (socketRef == null) return;
        new Thread(() -> {
            boolean disconnected = false;
            try {
                BufferedReader in = new BufferedReader(new InputStreamReader(socketRef.getInputStream()));
                readLoop:
                while (true) {
                    String line;
                    try {
                        line = in.readLine();
                    } catch (SocketTimeoutException e) {
                        // Rien reçu pendant le délai (ex: joueur inactif) — normal, pas une déconnexion.
                        if (socketRef.isClosed()) { disconnected = true; break readLoop; }
                        continue;
                    }
                    if (line == null) { disconnected = true; break; } // flux fermé par l'autre bout
                    if (line.trim().isEmpty()) continue; // ligne vide = heartbeat, on ignore
                    JSObject eventData = new JSObject();
                    eventData.put("message", line);
                    notifyListeners("receiveMessage", eventData);
                }
            } catch (IOException e) {
                Log.w(TAG, "Client read loop ended: " + e.getMessage());
                disconnected = true;
            }
            if (disconnected) {
                notifyListeners("serverDisconnected", new JSObject());
            }
        }).start();
    }

    private boolean reconnectToServer(String ipAddress, int port) {
        try {
            // Validate IP address and port
            if (!isValidIpAddress(ipAddress)) {
                Log.w(TAG, "Invalid IP address during reconnection: " + ipAddress);
                return false;
            }
            if (port < 1 || port > 65535) {
                Log.w(TAG, "Invalid port during reconnection: " + port);
                return false;
            }

            // Attempt reconnection
            clientSocket = new Socket(ipAddress, port);
            clientSocket.setSoTimeout(30000); // Optional: Timeout for reading data
            Log.i(TAG, "Reconnected to server at " + ipAddress + ":" + port);
            startClientReadLoop();
            notifyListeners("serverReconnected", new JSObject());
            return true;

        } catch (IOException e) {
            Log.e(TAG, "Reconnection failed: " + e.getMessage(), e);
            return false;
        }
    }


    @PluginMethod
    public void getClientCount(PluginCall call) {
        call.resolve(new JSObject().put("count", clientConnections.size()));
    }

    // Send Message to a Specific Client (Server -> one Client)
    @PluginMethod
    public void sendMessageToClient(PluginCall call) {
        String clientId = call.getString("clientId", "");
        String message = call.getString("message", "");
        if (clientId.isEmpty() || message.isEmpty()) {
            call.reject("clientId and message are required.");
            return;
        }
        Socket target;
        synchronized (clientConnections) {
            target = clientConnections.get(clientId);
        }
        if (target == null || target.isClosed()) {
            call.reject("Unknown or closed clientId: " + clientId);
            return;
        }
        try {
            target.getOutputStream().write((message + "\n").getBytes());
            target.getOutputStream().flush();
            call.resolve(new JSObject().put("success", true));
        } catch (IOException e) {
            Log.e(TAG, "Error sending message to client " + clientId, e);
            call.reject("Failed to send message to client.", e);
        }
    }

    // Send Message to All Connected Clients (Server -> all Clients)
    @PluginMethod
    public void broadcastToClients(PluginCall call) {
        String message = call.getString("message", "");
        if (message.isEmpty()) {
            call.reject("message is required.");
            return;
        }
        int sentCount = 0;
        java.util.Map<String, Socket> snapshot;
        synchronized (clientConnections) {
            snapshot = new java.util.LinkedHashMap<>(clientConnections);
        }
        for (java.util.Map.Entry<String, Socket> entry : snapshot.entrySet()) {
            Socket client = entry.getValue();
            if (client == null || client.isClosed()) continue;
            try {
                client.getOutputStream().write((message + "\n").getBytes());
                client.getOutputStream().flush();
                sentCount++;
            } catch (IOException e) {
                Log.e(TAG, "Error broadcasting to client " + entry.getKey(), e);
            }
        }
        call.resolve(new JSObject().put("success", true).put("sentCount", sentCount));
    }

    @PluginMethod
    public void getConnectedClientIds(PluginCall call) {
        JSArray ids = new JSArray();
        synchronized (clientConnections) {
            for (String id : clientConnections.keySet()) {
                ids.put(id);
            }
        }
        call.resolve(new JSObject().put("clientIds", ids));
    }

    @Override
    public void handleOnDestroy() {
        super.handleOnDestroy();

        // Clean up the client socket if it exists
        if (clientSocket != null && !clientSocket.isClosed()) {
            try {
                clientSocket.close();
                clientSocket = null;
                Log.i(TAG, "Client socket closed during app destruction.");
            } catch (IOException e) {
                Log.e(TAG, "Error closing client socket on app destroy: " + e.getMessage());
            }
        }

        // Stop the server if running
        stopServer(null);
    }

    private void startHeartbeat(String ipAddress, int port) {
        new Thread(() -> {
            while (true) {
                try {
                    // Pause for 5 seconds between heartbeats
                    Thread.sleep(5000);

                    synchronized (this) {
                        // Check if the client socket is connected and operational
                        if (clientSocket == null || clientSocket.isClosed() || !clientSocket.isConnected()) {
                            Log.w(TAG, "Connection lost. Attempting to reconnect...");
                            if (reconnectToServer(ipAddress, port)) {
                                Log.i(TAG, "Reconnected successfully during heartbeat.");
                            } else {
                                Log.e(TAG, "Heartbeat reconnection failed.");
                            }
                        } else {
                            // Send a lightweight heartbeat message
                            clientSocket.getOutputStream().write(("\n").getBytes());
                            clientSocket.getOutputStream().flush();
                            Log.i(TAG, "Heartbeat sent to server.");
                        }
                    }
                } catch (InterruptedException e) {
                    Log.e(TAG, "Heartbeat thread interrupted", e);
                    break; // Exit the loop if the thread is interrupted
                } catch (IOException e) {
                    Log.e(TAG, "Error during heartbeat operation", e);
                }
            }
        }).start();
    }


    private void stopHeartbeat() {
        isHeartbeatRunning = false;
        if (heartbeatThread != null) {
            heartbeatThread.interrupt();
            heartbeatThread = null;
        }
        Log.i(TAG, "Heartbeat stopped.");
    }


}
