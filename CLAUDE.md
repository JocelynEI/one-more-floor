@AGENTS.md

# Consignes pour ONE MORE FLOOR

Elles complètent AGENTS.md (règles Expo) et s'appliquent à chaque session.
Avant toute modification, lire le document de `docs/` qui concerne la demande : `GAME_DESIGN.md`, `ARCHITECTURE.md`, `BALANCING.md`, `UX_UI_SYSTEM.md`.

## Règles non négociables

Ne jamais les contourner, même pour « simplifier » ou « tester ». Si une demande semble les contredire, s'arrêter et poser la question.

- Aucun compte, aucun login, aucun backend.
- Aucune donnée ne sort du téléphone. Pas d'analytics, pas de SDK tiers qui envoie des identifiants, pas de publicité.
- La boutique fonctionne avec la monnaie du jeu. Ajouter de vrais achats intégrés est une décision à me demander d'abord (et il faudra alors un bouton « Restaurer les achats »).

## 1. Réfléchir avant de coder

- Dire ce que tu as compris de la demande et tes hypothèses avant de modifier quoi que ce soit.
- Si la demande peut se lire de deux façons, présenter les deux et demander. Ne pas choisir en silence.
- Si une solution plus simple existe, la proposer.

## 2. Faire simple

- Coder ce qui est demandé, rien de plus. Pas de fonctionnalité « au cas où ».
- Pas d'abstraction pour un code utilisé une seule fois.
- Pas de nouvelle dépendance sans l'annoncer et dire pourquoi.
- Si 200 lignes peuvent en faire 50, réécrire.

## 3. Modifier seulement ce qui est demandé

- Ne pas « améliorer » le code voisin, les commentaires ou la mise en forme.
- Ne pas toucher à la sauvegarde, à l'audio ou à l'équilibrage si la demande ne les concerne pas.
- Respecter le style existant.
- Code mort ou problème repéré ailleurs : le signaler, ne pas le corriger d'office.
- Supprimer seulement ce que ta propre modification a rendu inutile.

Le test : chaque ligne modifiée doit se rattacher à la demande.

## 4. Où va le code

Suivre `docs/ARCHITECTURE.md`. En résumé :

- Les règles du jeu vont dans `src/game/` (TypeScript pur, sans React Native), ce qui survit à une partie dans `src/meta/`.
- Sens des dépendances : `game` ← `meta` ← `state` ← `ui` ← `app`. Jamais l'inverse.
- Une seule source par réglage : gameplay dans `src/game/balance.ts`, visuel dans `src/ui/theme.ts`, textes dans `src/i18n/`.
- Tout nouveau texte va dans `en.ts` et `fr.ts`.
- Changer le format de sauvegarde (`src/meta/saveData.ts`) : augmenter `SAVE_VERSION`, ajouter la migration et son test. Une ancienne sauvegarde doit toujours se charger.
- Les tests vont dans `tests/`.

## 5. Vérifier avant de dire « c'est fait »

Pour une tâche en plusieurs étapes, annoncer un plan court :

```
1. [Étape] → vérification : [contrôle]
2. [Étape] → vérification : [contrôle]
```

À chaque modification, lancer :

- `npm run typecheck`
- `npm test`
- `npx expo lint`

Ne jamais annoncer qu'une tâche est terminée si l'un de ces contrôles échoue. Chaque envoi sur `main` publie la version web : rien n'y part si les contrôles échouent.

Pour un nouvel écran : faire d'abord une maquette HTML à 390 px de large, la regarder (textes qui débordent, éléments importants sous le pli), puis coder l'écran.

## 6. Des tests qui empêchent les régressions

- Chaque bug corrigé reçoit un test qui échoue si le bug revient.
- Une nouvelle règle de jeu (niveau, médaille, déblocage) reçoit son test dans `tests/game/` ou `tests/meta/`.

## 7. Ce que l'appli dit

- Féliciter ce qui a été réussi. Une partie perdue n'est jamais un reproche.
- Ton clair et neutre sur les écrans de réglages et de confidentialité.

## 8. Une version, un sujet

Chaque livraison porte un seul changement, avec :

- son numéro de version ;
- une ligne de changelog ;
- sa recette : la liste courte de ce que je dois essayer sur mon téléphone pour valider.

---

Ces consignes marchent si : les modifications restent petites, il y a peu de retours en arrière, et les questions arrivent avant le code plutôt qu'après les erreurs.
