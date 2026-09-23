# Architecture

## Principes

1. **Le moteur ne connaît pas l'affichage.** `src/game/` est du TypeScript pur, déterministe (générateur aléatoire à graine) et entièrement testable sans téléphone.
2. **L'affichage ne décide rien.** Les composants lisent l'état du moteur à chaque image et traduisent ses *signaux* en sons, vibrations et effets.
3. **Une seule source pour chaque réglage** : gameplay dans `balance.ts`, visuel dans `ui/theme.ts`, textes dans `i18n/`.
4. **Pas de dépendance circulaire** : `game` ← `meta` ← `state` ← `ui` ← `app`.

## Couches

| Dossier | Rôle | Fichiers clés |
|---|---|---|
| `src/game/` | Simulation d'une partie | `engine.ts` (orchestration), `elevator.ts` (mouvement avec accélération/freinage), `passengers.ts`, `difficulty.ts` (courbes), `events.ts` (événements), `upgrades.ts` (roguelite), `combo.ts`, `random.ts`, `balance.ts`, `types.ts` |
| `src/meta/` | Tout ce qui survit à une partie | `saveData.ts` (format versionné + validation), `storage.ts` (lecture/écriture avec copie de secours), `progression.ts` (récompenses, grades, boutique), `cosmetics.ts` (apparences d'ascenseur) |
| `src/i18n/` | Localisation | `en.ts` (référence typée), `fr.ts`, `index.ts` (détection de langue, `format`) |
| `src/services/` | Accès au matériel | `audio.ts` (`SoundBoard` : catégories music / ambience / sfx / ui, lecteurs réutilisés), `haptics.ts`, `log.ts` |
| `src/state/` | État global React | `AppState.tsx` : charge la sauvegarde, applique les réglages, écrit sur disque (anti-rebond + écriture immédiate quand ça compte) |
| `src/ui/` | Présentation | `theme.ts` (design system), `components/` (boutons, écrans, réglages…), `game/` (tour, cabine, passagers, HUD, overlays, effets, boucle de jeu) |
| `src/app/` | Écrans / navigation | `_layout.tsx`, `index.tsx` (accueil), `play.tsx`, `progression.tsx`, `collection.tsx`, `settings.tsx`, `how-to-play.tsx`, `credits.tsx`, `privacy.tsx`, `+not-found.tsx` |

## Boucle de jeu

`ui/game/useGameSession.ts` possède la partie en cours :

1. `requestAnimationFrame` fournit le temps écoulé (plafonné à 100 ms pour absorber un retour d'arrière-plan).
2. `engine.update(dt)` avance la simulation par pas fixes de 1/60 s au maximum : résultat identique quel que soit l'écran (60 ou 120 Hz).
3. `engine.consumeSignals()` renvoie les événements de l'image (`delivered`, `lost`, `comboTier`, `callout`…). Chacun déclenche son, vibration et effet visuel.
4. `SceneFx.update` fait avancer les effets de présentation : particules (au plus 90), textes flottants, marche des passagers, tremblement.
5. Un compteur d'images force React à redessiner.

Rejouer remplace le moteur sur place : aucune navigation, aucun chargement.

La pause arrête la simulation. L'appli passe en pause automatiquement dès qu'elle quitte le premier plan (`AppState`), ce qui couvre un appel entrant, le multitâche ou un changement d'onglet sur le web.

## Machine à états de l'ascenseur

```
idle ──tap autre étage──▶ moving ──arrivée──▶ opening ──▶ exchanging ──▶ closing ──▶ idle
  │                          ▲  (tap = nouvelle cible, freinage/demi-tour naturel)
  └──tap même étage / passager qui peut monter──▶ opening
```

- Pendant `opening` / `exchanging` / `closing`, un tap mémorise la prochaine destination (`pendingTarget`), qui part dès la fermeture des portes.
- `exchanging` fait d'abord descendre les passagers arrivés, puis monter ceux qui tiennent dans la cabine, un par un (durée selon leur type).

## Performance

- Simulation sans allocation lourde par image. Les tableaux d'effets sont réutilisés et tronqués sur place.
- Les badges de patience sont **quantifiés en 24 paliers** et mémoïsés : le SVG d'un passager ne se redessine que quelques fois par seconde.
- Les silhouettes (`PassengerFigure`) sont mémoïsées par type, apparence et humeur.
- Les animations d'interface utilisent le pilote natif (`nativeDriver`), sauf sur le web où il n'existe pas.
- Les lecteurs audio sont créés une seule fois (`soundBoard.preload()`) et réutilisés en rotation.

## Sauvegarde

- Clés : `omf.save` (principale) et `omf.save.backup` (copie). La copie est écrite **avant** la principale : une coupure ne peut abîmer qu'une des deux.
- Au chargement : principale, puis copie, puis valeurs par défaut. Le jeu démarre toujours.
- `parseSaveData` valide chaque champ (types, bornes, apparences connues). Une valeur invalide est remplacée par sa valeur par défaut, jamais propagée.
- `SAVE_VERSION` et la table `MIGRATIONS` permettent de faire évoluer le format : ajouter une étape `n → n+1` à chaque changement.

## Debug / release

- `__DEV__` (vrai uniquement en développement) expose le moteur courant dans la console (`globalThis.__omfEngine`) et active les messages `reportError`.
- En release, aucun outil de développement n'est visible ni accessible, et aucun journal n'est émis.

## Monétisation future

Rien n'est payant en V1. Pour en ajouter plus tard sans réécrire le jeu :

- Les apparences ont déjà un prix, un statut possédé / équipé et un flux d'achat (`purchaseSkin`). Un achat intégré pourrait appeler la même fonction de déblocage.
- Le passage de React Native à un module d'achat natif exigera un *development build* EAS : Expo Go ne contient pas de module d'achat.
