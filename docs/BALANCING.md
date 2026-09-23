# Équilibrage

Tout se règle dans **`src/game/balance.ts`**, objet `DEFAULT_BALANCE`. Aucune valeur de gameplay n'est écrite ailleurs.

## Sections

| Section | Contenu |
|---|---|
| `tower` | nombre d'étages, étages actifs au départ, moment où tous sont ouverts |
| `elevator` | capacité, vitesse max (étages/s), accélération, durée des portes et des transferts, bonus express |
| `patience` | patience au départ et au plus dur, remboursement du touriste |
| `spawn` | intervalle d'apparition (départ / minimum / durée de la rampe), vague de respiration, plafonds par étage et global |
| `passengerTypes` | par type : moment d'apparition, poids, multiplicateurs de patience, points, places, lenteur, stress |
| `stress` | maximum, stress par départ, soulagement par livraison, seuil d'alerte |
| `combo` | paliers (livraisons → multiplicateur), délai d'expiration |
| `score` | points de base, bonus express, bonus des moments forts, multiplicateurs d'événements |
| `events` | premier événement, écart entre événements, annonce, paramètres de chaque événement |
| `upgrades` | seuils de livraisons, nombre de cartes, valeur de chaque amélioration |
| `economy` | points par pièce, pièces par livraison, bonus de record |
| `tutorial` | vitesse de perte de patience pendant la démonstration |

## Méthode

1. Modifier une valeur dans `balance.ts`.
2. `npm test` : les tests qui dépendent de l'équilibrage (seuils, combo, bot) signalent les incohérences.
3. Jouer au moins 5 parties.

Mesures relevées pendant le développement, avec un robot qui réagit instantanément (donc meilleur qu'un humain sur la réactivité, moins bon en anticipation) : parties de **4 à 6 minutes**, 70 à 190 livraisons, 4 à 7 améliorations. Un humain qui découvre le jeu devrait tenir environ 2 à 4 minutes. Ce point est à confirmer avec de vrais joueurs.

## Pistes si…

| Constat | Levier conseillé |
|---|---|
| Début trop lent | `spawn.initialInterval` ↓ (4,3 → 3,8) |
| Fin trop brutale | `patience.minimum` ↑ ou `spawn.minimumInterval` ↑ |
| Défaites incomprises | `stress.perLostPassenger` ↓, `stress.warningThreshold` ↓ |
| Combos trop faciles | `combo.timeout` ↓ ou paliers ↑ |
| Première amélioration trop tardive | `upgrades.thresholds[0]` ↓ |
| Cosmétiques trop longs à obtenir | `economy.pointsPerCoin` ↓ |

Pour tester une variante sans toucher aux valeurs par défaut, on peut passer un autre objet `balance` au constructeur `new GameEngine({ balance })`, comme le font les tests.
