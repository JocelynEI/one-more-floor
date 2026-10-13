# Checklist QA manuelle

Cocher sur **au moins un iPhone, un Android et un navigateur**. Noter l'appareil, l'OS et la version de l'appli.

## Automatique (avant chaque session)

- [ ] `npm run typecheck` sans erreur
- [ ] `npm run lint` sans erreur
- [ ] `npm test` : tout passe

## Premier lancement

- [ ] Image de lancement sombre avec le logo, sans attente artificielle
- [ ] Langue du téléphone détectée (FR ou EN, sinon anglais)
- [ ] « Réduire les animations » reprend le réglage du téléphone
- [ ] Accueil : 0 pièce, « Ton premier service t'attend », JOUER bien visible
- [ ] JOUER lance le tutoriel : étage 3 → étage 8 → deux passagers → « Ton service commence »
- [ ] « Passer le tutoriel » démarre directement la partie
- [ ] Le tutoriel ne revient plus aux parties suivantes

## Partie

- [ ] Toucher un étage : départ immédiat
- [ ] Toucher un autre étage pendant le trajet : changement de cap sans à-coup
- [ ] Toucher pendant l'ouverture des portes : départ dès la fermeture
- [ ] Taps très rapides et répétés : aucun blocage ni saut
- [ ] Capacité respectée (4, ou plus avec « Espace en plus ») ; un duo ou un livreur prend 2 places
- [ ] Badge = étage + flèche ; l'anneau se vide ; le visage change d'humeur
- [ ] Un passager qui part : son, vibration, « +13 % », jauge de stress, combo cassé
- [ ] Livraison : son, points qui montent, particules, passager qui repart content
- [ ] Combo x2 / x3 / x5 / x8 : badge doré, rebond, son
- [ ] ÉTAGE PARFAIT, CABINE VIDÉE et TRAJET PARFAIT s'affichent sans cacher le jeu
- [ ] Chaque événement est annoncé puis décompté ; maintenance et double rush sont visibles sur les étages
- [ ] Touriste : message « Changement d'avis ! » et nouveau badge
- [ ] Choix d'amélioration : pause du jeu, 3 cartes, l'effet est visible (vitesse, capacité…)
- [ ] Stress à 70 % : alerte ; à 100 % : fin de partie après un court délai

## Fin de partie et relance

- [ ] Score animé, record, statistiques, pièces gagnées
- [ ] Nouveau record : badge doré, son, vibration
- [ ] REJOUER : nouvelle partie **immédiate**, sans fenêtre intermédiaire
- [ ] 20 relances d'affilée sans ralentissement ni fuite mémoire
- [ ] Accueil : le record et les pièces sont à jour

## Pause et interruptions

- [ ] Pause pendant un trajet, puis Reprendre : même état
- [ ] Pause pendant l'ouverture des portes : même état
- [ ] Mise en arrière-plan : pause automatique ; au retour, le jeu reste en pause
- [ ] Appel entrant, alarme, centre de contrôle : pause automatique
- [ ] Android, bouton retour : jeu → pause ; pause → reprendre ; fin de partie → accueil ; écrans → écran précédent
- [ ] Fermer l'appli juste après une fin de partie, puis la rouvrir : record et pièces conservés

## Réglages

- [ ] Musique et effets : 5 niveaux, pris en compte immédiatement
- [ ] Tout couper : plus aucun son
- [ ] Mode silencieux iPhone : pas de son (comportement normal d'un jeu)
- [ ] Vibrations désactivées : plus aucune vibration
- [ ] Réduire les animations : plus de tremblement, de traînée ni de déformation
- [ ] Langue Appareil / English / Français : tout l'écran change, y compris en pleine partie
- [ ] Revoir le tutoriel : il revient à la partie suivante
- [ ] Réinitialiser : confirmation obligatoire ; record, pièces, ascenseurs et stats effacés, réglages conservés
- [ ] Le numéro de version s'affiche

## Collection et progression

- [ ] Prix, aperçu, « Possédé », « Équipé »
- [ ] Pièces insuffisantes : bouton désactivé « Encore X »
- [ ] Achat : pièces débitées, ascenseur équipé et visible en jeu et sur l'accueil
- [ ] Progression vide (0 partie) : message et bouton JOUER
- [ ] Grade et barre de progression cohérents avec le total livré

## Écrans et accessibilité

- [ ] Petit écran (iPhone SE, Android 5,5") : rien n'est coupé, tout est touchable
- [ ] Grand écran (Pro Max, Android 20:9) et tablette : contenu centré, lisible
- [ ] Encoche / Dynamic Island / barre de gestes : rien de caché
- [ ] Rotation : l'appli reste en portrait
- [ ] Texte agrandi dans les réglages du téléphone : lisible, rien ne se chevauche
- [ ] VoiceOver / TalkBack : boutons, étages (« Étage 3, 1 en attente »), stress et combo sont annoncés
- [ ] Simulation de daltonisme : les destinations restent lisibles grâce aux numéros et aux flèches

## Performance

- [ ] 60 images/s pendant une heure de pointe avec des files pleines (téléphone milieu de gamme)
- [ ] 30 minutes de jeu continu : pas de ralentissement, chauffe raisonnable
- [ ] Démarrage à froid en moins de 2 s sur un téléphone récent

## Web (GitHub Pages)

- [ ] L'adresse `/tower-ding/` s'ouvre ; recharger sur `/tower-ding/settings` ramène au bon écran
- [ ] Les sons démarrent après le premier toucher (règle des navigateurs)
- [ ] Changer d'onglet met le jeu en pause
