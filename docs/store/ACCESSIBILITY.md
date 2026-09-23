# Fonctionnalités d'accessibilité à déclarer

À déclarer uniquement si le test sur appareil le confirme (voir `docs/QA_CHECKLIST.md`, section « Écrans et accessibilité »).

| Fonctionnalité (App Store Connect) | Implémentée | Détail |
|---|---|---|
| Dark Interface | Oui | L'interface est toujours sombre |
| Reduced Motion | Oui | Réglage en jeu, qui reprend la préférence système au premier lancement |
| Sufficient Contrast | Oui | Texte principal ≈ 17:1, secondaire ≈ 9:1 |
| Differentiate Without Color Alone | Oui | Destinations en chiffres + flèches ; types de passagers par silhouette et accessoire ; stress gradué et en pourcentage |
| Larger Text | Partiel | Le texte des menus s'agrandit (jusqu'à ×1,4) ; les chiffres dans le jeu gardent une taille fixe pour ne pas masquer la tour. **À ne pas déclarer** tant que ce n'est pas validé sur appareil. |
| VoiceOver / Voice Control | Partiel | Libellés sur les boutons, les étages, le stress et le combo. Le jeu, en temps réel, reste difficile à jouer à l'aveugle. **Ne pas déclarer** VoiceOver. |
| Captions / Audio Descriptions | Sans objet | Aucune vidéo |

Autres : vibrations désactivables, musique et sons réglables ou coupés, zones tactiles d'au moins 48, jouable d'une main.
