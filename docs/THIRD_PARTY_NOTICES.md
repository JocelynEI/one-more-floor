# Composants tiers

ONE MORE FLOOR n'intègre **aucun SDK publicitaire, analytique, de crash reporting ni de connexion**. Chaque dépendance a une raison d'être.

| Paquet | Version | Licence | Rôle |
|---|---|---|---|
| expo | 57.0.24 | MIT | Plateforme, build, modules |
| react / react-dom | 19.2.3 | MIT | Interface |
| react-native | 0.86.3 | MIT | Rendu natif |
| react-native-web | 0.21.2 | MIT | Version navigateur |
| expo-router | 57.0.22 | MIT | Navigation entre écrans, bouton retour |
| react-native-screens | 4.26.x | MIT | Écrans natifs (requis par la navigation) |
| react-native-safe-area-context | 5.7.0 | MIT | Encoches et zones sûres |
| react-native-svg | 15.15.4 | MIT | Personnages, icônes, logo |
| @react-native-async-storage/async-storage | 2.2.0 | MIT | Sauvegarde locale |
| expo-audio | 57.0.5 | MIT | Musique et effets |
| expo-haptics | 57.0.3 | MIT | Vibrations |
| expo-localization | 57.0.2 | MIT | Langue du téléphone (lecture locale uniquement) |
| expo-font / @expo-google-fonts/inter | 57.0.4 / 0.4.2 | MIT (code), OFL-1.1 (police) | Police Inter embarquée dans l'appli, sans téléchargement |
| expo-splash-screen | 57.0.9 | MIT | Écran de lancement |
| expo-status-bar / expo-system-ui | 57.x | MIT | Barre d'état, couleur de fond native |
| expo-constants / expo-linking | 57.x | MIT | Numéro de version, liens (requis par la navigation) |
| expo-asset | 57.x | MIT | Chargement des fichiers audio et images embarqués (requis par expo-audio) |

Outils de développement (non livrés dans l'appli) : TypeScript, Jest, jest-expo, ESLint (config Expo). Tous sous licence MIT ou Apache-2.0.

## Police Inter

Copyright 2020 The Inter Project Authors (https://github.com/rsms/inter).
Distribuée sous **SIL Open Font License 1.1** : texte complet dans [licenses/Inter-OFL-1.1.txt](licenses/Inter-OFL-1.1.txt).

## Assets originaux

Les sons, la musique, les personnages, les icônes, le logo et l'icône d'application ont été créés pour ce projet :
- sons et musique synthétisés par `scripts/generate_audio.py` ;
- dessins vectoriels écrits directement dans le code.

Ils n'utilisent aucune ressource tierce.

## Audit réseau

Recherche de `fetch`, `XMLHttpRequest`, `WebSocket` et `sendBeacon` dans le code livré de chaque dépendance, résultats :
- **expo-audio (web)** : ne lit que les fichiers audio du jeu lui-même ;
- **expo-router** : chargement de données serveur et écrans d'accueil développeur, deux fonctions que ce projet n'utilise pas ;
- **react-native-svg** : chargement d'images SVG distantes (`SvgUri`), non utilisé ici, puisque tous les dessins sont dans le code ;
- toutes les autres dépendances : aucune occurrence.

Le code du jeu ne fait **aucune** requête réseau. La version web charge seulement ses propres fichiers depuis GitHub Pages.
