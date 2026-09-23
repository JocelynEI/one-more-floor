# Permissions

| Plateforme | Permission | Demandée ? | Pourquoi |
|---|---|---|---|
| iOS | Micro, caméra, photos, localisation, contacts, suivi (ATT), notifications | **Non** | Inutiles au jeu |
| iOS | Audio en arrière-plan (`UIBackgroundModes: audio`) | **Non** | Désactivé dans le plugin expo-audio |
| Android | `RECORD_AUDIO` | **Non** (bloquée) | Ajoutée par défaut par expo-audio : retirée |
| Android | `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK` | **Non** (bloquées) | Lecture en arrière-plan désactivée |
| Android | `POST_NOTIFICATIONS` | **Non** (bloquée) | Aucune notification |
| Android | `VIBRATE` | Automatique, sans demande à l'utilisateur | Vibrations de jeu (désactivables) |
| Android | `INTERNET` | Automatique, sans demande | Ajoutée par React Native ; non utilisée par le jeu |
| Web | aucune | - | La vibration web ne demande pas d'autorisation |

Vérification après un build : `npx expo prebuild --platform android --clean`, puis lire `android/app/src/main/AndroidManifest.xml`. Le dossier `android/` est généré et ne doit pas être gardé dans le dépôt.
