# Google Play Console : Sécurité des données (Data safety)

Réponses proposées pour la V1.

| Question | Réponse |
|---|---|
| Does your app collect or share any of the required user data types? | **No** |
| Is all of the user data collected by your app encrypted in transit? | Sans objet : aucune donnée n'est transmise |
| Do you provide a way for users to request that their data is deleted? | Sans objet : aucune donnée collectée ; suppression locale via Réglages → Réinitialiser la progression |
| Account creation | L'appli ne permet pas de créer un compte |

**Architecture** : 100 % locale. Score, pièces, cosmétiques, statistiques et réglages sont enregistrés dans le stockage privé de l'appli et ne sont jamais envoyés.

**Permissions Android** : aucune demandée. `RECORD_AUDIO`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `POST_NOTIFICATIONS`, `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE` et `WRITE_EXTERNAL_STORAGE` sont explicitement bloquées dans `app.json` (`blockedPermissions`). Avant l'envoi, vérifier la liste finale dans l'onglet « App bundle explorer » de la Play Console. `INTERNET` (ajoutée par React Native), `VIBRATE` et `MODIFY_AUDIO_SETTINGS` (sons et vibrations) restent ; elles ne demandent rien au joueur, `INTERNET` n'est pas utilisée par le jeu et ne constitue pas une collecte de données.

**Publicité** : l'appli ne contient **pas** de publicité.

**Public cible** : tous publics. Voir `AGE_RATING_NOTES.md`.
