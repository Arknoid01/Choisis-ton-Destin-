# Modifications locales

Copie vendorisée de `@yesprasoon/capacitor-tcp-socket-manager` 1.2.2 (MIT, voir `LICENSE`),
intégrée au dépôt pour ne plus dépendre d'un patch `postinstall` qui pouvait échouer en silence.

Modifications par rapport à la 1.2.2 d'origine (fichier `android/src/main/java/.../TcpSocketManagerPlugin.java`) :

- chaque client TCP reçoit un `clientId` stable (`client-N`) ;
- les événements `clientConnected`, `clientDisconnected` et `receiveMessage` (côté serveur) portent ce `clientId` ;
- nouvelles méthodes `sendMessageToClient({ clientId, message })` et `broadcastToClients({ message })` ;
- les lignes vides (heartbeat) sont ignorées côté serveur.

Utilisé par `multiplayer.js` (multijoueur local wifi).
