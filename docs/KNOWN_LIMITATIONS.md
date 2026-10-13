# Limites connues

Recensées honnêtement à la fin de la V1.

## Tests

- **Pas encore testé sur de vrais téléphones.** Le jeu a été testé dans un navigateur, en taille iPhone (390×844), et par 64 tests automatiques. Le passage sur iOS et Android via Expo Go reste à faire avec `docs/QA_CHECKLIST.md`, en particulier : vibrations, sons en mode silencieux, fluidité sur un Android milieu de gamme, VoiceOver et TalkBack.
- **Équilibrage mesuré avec un robot**, pas avec des joueurs. Durée de partie, rythme des améliorations et prix des cosmétiques sont à ajuster après quelques sessions réelles (`docs/BALANCING.md`).
- **Profilage** : la performance a été pensée (pas fixes, mémoïsation, effets plafonnés), mais aucun profilage n'a encore été fait sur un appareil réel.

## Technique

- **Sur le web, la musique démarre au premier toucher**, jamais avant : c'est une règle des navigateurs.
- **Les sons sont en WAV** (1,7 Mo au total) : aucun outil de compression audio n'était disponible. Une conversion en AAC/M4A réduirait le poids.
- **Pas de retour haptique sur iPhone dans Safari** : la vibration web n'existe que sur Android.
- **Expo Go** convient aux tests. Pour les stores, les builds passent par EAS (`eas.json`), et aucun module natif hors Expo Go n'est utilisé.

## Contenu

- **Un seul environnement** (City Tower), volontairement : priorité à la qualité de la V1. Le moteur accepte d'autres configurations (`balance`), mais Hôtel, Hôpital, Tour de bureaux et Station spatiale ne sont pas développés.
- **Six apparences d'ascenseur** ; pas encore de thème de cabine ni d'éléments de décor.
- **Captures d'écran store** : le plan existe (`docs/store/SCREENSHOT_PLAN.md`), mais les images sont à réaliser sur appareil.

## Store

- Nom de studio, comptes développeur, signature : à fournir par le propriétaire (`docs/RELEASE_CHECKLIST.md`).
- Les exigences des stores (niveau d'API cible, version de Xcode) doivent être revérifiées sur les sites officiels au moment de la soumission.
