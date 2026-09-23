# Design system

Toutes les valeurs sont dans `src/ui/theme.ts`.

## Couleurs

| Rôle | Valeur | Usage |
|---|---|---|
| Fond | `#0E1420` | écrans |
| Surface | `#171F2E` | cartes |
| Surface élevée | `#202B3D` | panneaux, fenêtres |
| Texte principal | `#F7F9FC` | contraste d'environ 17:1 sur le fond |
| Texte secondaire | `#AAB4C3` | contraste d'environ 9:1 |
| Accent | `#34D5FF` | action principale, sélection |
| Combo / or | `#FFD45A` | combo, pièces, record |
| Danger | `#FF5E68` | stress élevé, suppression |
| Succès | `#58D68D` | stress bas, validations |
| Attention | `#FFA24C` | stress moyen, maintenance |

Les 10 couleurs d'étage (`floorPalette`) accompagnent **toujours** un numéro et une flèche.

## Typographie : Inter

| Style | Taille / interligne | Graisse |
|---|---|---|
| display | 40 / 42 | Black |
| h1 | 28 / 34 | ExtraBold |
| h2 | 20 / 26 | Bold |
| body | 16 / 22 | Medium |
| caption | 13 / 18 | SemiBold |
| overline | 12 / 16, majuscules, espacé | Bold |
| button | 17 / 22 | ExtraBold |

Les chiffres utilisent des largeurs fixes (`tabular-nums`), pour que les scores ne « sautent » pas. La taille du texte suit le réglage d'accessibilité du téléphone, jusqu'à ×1,4.

## Espacements et formes

- Grille de 4 px : 4, 8, 12, 16, 24, 32, 48.
- Rayons : 8, 14, 20, 28, pilule.
- Ombres : `shadow('low')` pour les boutons, `shadow('high')` pour les panneaux.
- Zones tactiles d'au moins **48** (au-dessus du minimum Apple de 44 pt et égal au minimum Android de 48 dp). Chaque étage entier est une zone tactile.

## Composants

| Composant | Rôle |
|---|---|
| `PressableScale` | base de tout élément touchable : réduction d'échelle au toucher, son de clic, vibration légère |
| `Button` | 4 variantes (primary, secondary, ghost, danger), 2 tailles, état désactivé |
| `IconButton` | bouton rond 48, avec libellé accessible obligatoire |
| `Screen` | écran secondaire : zone sûre, bouton retour, défilement, largeur max 520 |
| `Card` | carte avec titre de section |
| `ToggleRow`, `VolumeRow`, `SegmentedRow`, `LinkRow` | lignes de réglages accessibles |
| `ConfirmDialog` | confirmation destructive ; l'action sûre vient en premier |
| `CoinBadge`, `Icon`, `LiftMark`, `Wordmark` | éléments d'identité |

## Mouvement

- Durées : 90 ms (appui), 160 ms, 220 ms (entrées), 300 ms.
- Entrées : fondu + montée de 18 px avec *ease-out cubic* (`useEntrance`).
- Jeu : accélération et freinage de la cabine, légère déformation à l'arrivée et en vitesse, traînée lumineuse, rebond du combo, particules, textes flottants, léger tremblement quand un passager part.
- **Réduire les animations** : plus de tremblement, de déformation ni de traînée, particules réduites, entrées instantanées, transitions d'écran coupées. La valeur initiale reprend le réglage du téléphone.

## Hiérarchie de l'écran de jeu

1. la tour (≈ 80 % de l'écran) : étages, cabine, files ;
2. le stress (pleine largeur, graduations à 25, 50 et 75 %) ;
3. le score (à gauche) et le combo (au centre) ;
4. l'événement en cours (bandeau réservé, pour que la tour ne bouge pas) ;
5. la pause (en haut à droite, 48 px).

Les fenêtres (améliorations, pause, fin de partie) s'ouvrent **en bas de l'écran**, dans la zone du pouce.

## Zones sûres

Tous les écrans utilisent `useSafeAreaInsets` : rien sous l'encoche, la Dynamic Island ou la barre de gestes. Le contenu est limité à 520 px de large sur tablette et navigateur.
