# Game design : TOWER DING

## Promesse

« Je peux sûrement faire mieux. Encore une partie. »

Des parties de 2 à 5 minutes, jouables d'une main, comprises en moins de 10 secondes. La rejouabilité vient de la maîtrise, des événements et des choix d'améliorations, pas de mécaniques de frustration.

## Boucle

Accueil → **JOUER** → partie immédiate → livraisons → combos → événements → choix d'amélioration → pression croissante → fin de service → score, record, pièces → **REJOUER** (un seul tap, relance instantanée).

## Contrôles

- **Toucher un étage** (toute la largeur de la ligne) : l'ascenseur y part aussitôt.
- **Toucher un autre étage pendant le trajet** : changement de cap immédiat, avec freinage et demi-tour naturels.
- **Toucher pendant l'ouverture des portes** : la destination est mémorisée et l'ascenseur part dès la fermeture.
- Les portes, la montée et la descente sont automatiques. Un ascenseur à l'arrêt ouvre tout seul si quelqu'un peut monter à son étage.

## Tour

10 étages, numérotés de 1 à 10. Au début, seuls les 5 premiers génèrent des passagers ; tous sont ouverts vers 1 min 50. Les étages pas encore ouverts sont grisés.

## Passagers

| Type | Reconnaissable par | Règle |
|---|---|---|
| Standard | silhouette simple | référence |
| Livreur | casquette + colis | 2 places, ×1,6 points |
| Senior | cheveux gris + canne, légèrement penché | patience ×1,6, monte et descend 2,2× plus lentement |
| VIP | costume sombre, cravate et couronne dorées | patience ×0,62, ×3 points, stress ×1,7 s'il part |
| Duo | deux personnages | 2 places, ×2,2 points |
| Touriste | bob blanc + appareil photo | change **une fois** de destination pendant l'attente (le badge change, un message s'affiche, et il regagne 25 % de patience pour compenser) |

Chaque passager affiche un **badge** : numéro de l'étage de destination, flèche ↑/↓ et couleur de l'étage. La couleur n'est jamais le seul indice.

L'**anneau** autour du badge représente la patience. Sa longueur porte l'information ; sa couleur (blanc, orange, rouge) et l'expression du visage la renforcent.

Une fois dans la cabine, un passager ne perd plus patience : le risque est dans l'attente, et la capacité limitée empêche de tout ramasser.

## Stress et défaite

- Un passager qui perd patience s'en va : **+13 % de stress** (davantage pour un VIP ou un duo).
- Chaque livraison fait baisser le stress de 1,5 %. On peut donc se rattraper.
- Alerte douce (son, vibration, message) à 70 %. À **100 %**, le service est terminé.
- Le joueur voit toujours pourquoi il perd : jauge graduée, texte « +13 % » à l'endroit du départ, personnage qui s'en va en colère.

## Score et combos

Points de base 10 × type × bonus. Le bonus **EXPRESS** (×1,5) s'applique si le passager avait encore au moins 60 % de patience quand il est monté.

Multiplicateur de chaîne : **x1 → x2 (3 livraisons) → x3 (7) → x5 (12) → x8 (18)**. La chaîne casse si un passager part, ou après 11 s sans livraison.

Moments forts :

| Nom | Condition | Bonus |
|---|---|---|
| ÉTAGE PARFAIT | au moins 2 embarquements qui vident la file de l'étage | +30 × multiplicateur |
| CABINE VIDÉE | au moins 3 passagers descendent ensemble et vident la cabine | +60 × multiplicateur |
| TRAJET PARFAIT | 6 livraisons EXPRESS d'affilée | +120 × multiplicateur |
| COMBO RUSH | atteindre x5 puis x8 | annonce |

## Événements

Un seul à la fois, **annoncé 2,2 s à l'avance**, jamais deux fois de suite. Premier événement vers 1 min 10, puis toutes les 32 à 46 s.

| Événement | Effet | Décision créée |
|---|---|---|
| Heure de pointe | apparitions ×2,3 pendant 13 s, puis 6 s de calme | trier les urgences |
| Maintenance | un étage (jamais le rez-de-chaussée) embarque 2,6× plus lentement, sans nouvelle arrivée | le contourner ou non |
| Arrivée VIP | un VIP en surbrillance qui paie double | risque contre gain |
| Double rush | 2 étages : plus d'arrivées, points ×2 | se positionner |
| Express | ascenseur ×1,6 pendant 12 s | en profiter pour les longs trajets |

## Améliorations (roguelite)

Après 12, 26, 44, 66, 92, 122, 156… livraisons, la partie se met en pause : **1 carte parmi 3**, de familles différentes quand c'est possible.

| Famille | Cartes |
|---|---|
| Vitesse | Portes rapides (×3), Moteur turbo (×3), Ligne express (×2) |
| Capacité | Espace en plus (×2) |
| Calme | Ambiance zen (×3), Anti-stress (×2), Salon VIP (×1, seulement une fois les VIP apparus) |
| Score | Maître du combo (×2), Pourboires (×2) |

Builds possibles : « navette rapide » (vitesse), « bus » (capacité + cabine vidée), « zen » (patience + stress), « scoreur » (combo + pourboires).

## Courbe de difficulté

Plusieurs leviers, pas seulement la vitesse :

1. fréquence d'apparition : de 4,3 s à 1,2 s sur 5 min 30, avec une **vague** de ±22 % d'une période de 42 s qui crée des respirations ;
2. étages actifs : de 5 à 10 ;
3. patience : de 25 s à 14 s ;
4. types de passagers : livreur (45 s), senior (1 min 15), VIP (1 min 45), duo (2 min 20), touriste (3 min) ;
5. événements.

Garde-fous d'équité : au plus 4 personnes par étage, un plafond global de passagers en attente, jamais un passager qui veut aller à son propre étage.

## Premières minutes

| Moment | Ce qui se passe |
|---|---|
| 0–30 s | Tutoriel interactif : toucher l'étage 3, emmener au 8, deux passagers pour découvrir l'anneau de patience. Bouton « Passer ». |
| 30–60 s | Premières livraisons, premier x2 |
| 1–2 min | Tous les étages s'ouvrent, livreurs et seniors, premier événement |
| 2–3 min | Premier choix d'amélioration, VIP |

## Progression hors partie

- **Pièces** : score ÷ 150 + 0,3 par livraison (+25 si record). Environ 20 à 60 pièces par partie.
- **Ascenseurs** (cosmétiques uniquement) : Classique (offert), Néon 300, Rétro 450, Industriel 600, Or 900, Spatial 1 300.
- **Grades d'opérateur** selon le total de passagers livrés : Stagiaire → Opérateur (100) → Régulateur (400) → Superviseur (1 000) → Chef technicien (2 500) → Légende de la tour (6 000).

Pas de pay-to-win, pas de monnaie achetable, pas de loot box, pas de notification.
