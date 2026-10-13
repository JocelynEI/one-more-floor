# TOWER DING

Jeu mobile d'arcade stratégique en portrait : on pilote l'ascenseur d'une tour, on transporte des passagers impatients, on enchaîne les combos et on tient le plus longtemps possible avant que le stress de la tour n'atteigne 100 %.

- **Plateformes** : iOS, Android (via Expo) et navigateur web (GitHub Pages)
- **Stack** : Expo SDK 57 · React Native 0.86 · React 19.2 · TypeScript · Expo Router
- **Données** : 100 % locales, hors ligne, aucun compte, aucun tracking
- **Langues** : français, anglais (détection automatique, choix manuel dans Réglages)
- **Version** : 1.0.0 (build 1)

> Le prompt d'origine prévoyait Godot. Le projet a été réalisé avec Expo / React Native à la demande du propriétaire, pour pouvoir le tester dans **Expo Go** et le publier sur **GitHub Pages**.

---

## Démarrer

Prérequis : Node.js 20 ou plus récent (testé avec Node 24) et npm.

```bash
npm install          # installe les dépendances (une seule fois)
npm start            # lance le serveur de développement
```

- **Sur téléphone** : installe l'appli **Expo Go** (App Store / Play Store), puis scanne le QR code affiché dans le terminal. Le téléphone et l'ordinateur doivent être sur le même Wi-Fi.
- **Dans le navigateur** : `npm run web`, puis ouvre l'adresse affichée (`http://localhost:8081/one-more-floor`).

## Commandes utiles

| Commande | Rôle |
|---|---|
| `npm start` | Serveur de développement (Expo Go, web) |
| `npm test` | Tests automatiques (Jest) |
| `npm run typecheck` | Vérification des types TypeScript |
| `npm run lint` | Analyse de qualité du code (ESLint) |
| `npm run build:web` | Construit la version web statique dans `dist/` |
| `npx expo-doctor` | Diagnostic de la configuration Expo |

## Architecture

```
src/
  app/            Écrans (Expo Router : un fichier = un écran)
  game/           Moteur de jeu pur TypeScript, sans aucun affichage
  meta/           Sauvegarde, progression, cosmétiques
  i18n/           Textes FR / EN
  services/       Audio, vibrations, journal de développement
  state/          État global de l'appli (sauvegarde + réglages)
  ui/             Design system, composants, rendu du jeu
tests/            Tests Jest (moteur, sauvegarde, progression, traductions)
assets/           Icônes, sons générés, image de lancement
scripts/          Générateurs d'assets et finition du build web
docs/             Documentation (architecture, design, QA, store…)
```

Le détail est dans [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Équilibrage

Tous les réglages de gameplay (vitesse, patience, fréquence d'apparition, combos, événements, améliorations, économie) sont centralisés dans **`src/game/balance.ts`** (`DEFAULT_BALANCE`). Voir [docs/BALANCING.md](docs/BALANCING.md).

## Localisation

Les textes sont dans `src/i18n/en.ts` (référence) et `src/i18n/fr.ts`. TypeScript refuse la compilation si une clé manque, et un test vérifie que les deux langues ont les mêmes clés et les mêmes paramètres `{…}`. Pour ajouter une langue : créer `src/i18n/xx.ts` typé `Translations`, l'ajouter à `DICTIONARIES` dans `src/i18n/index.ts`, puis aux options de langue dans `src/app/settings.tsx`.

## Assets

- **Sons et musique** : synthétisés par `scripts/generate_audio.py` (Python 3, sans dépendance). Relancer : `python3 scripts/generate_audio.py`.
- **Icônes et image de lancement** : générées depuis `assets/brand/lift-mark.svg` par `scripts/render-icons.mjs` (`npm install --no-save sharp && node scripts/render-icons.mjs`).
- **Personnages, cabine, interface** : dessinés en SVG et en composants dans le code.
- **Police** : Inter (SIL Open Font License 1.1), voir [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md).

Tout est original ou sous licence libre compatible.

## Publication web (GitHub Pages)

Le fichier `.github/workflows/deploy-web.yml` vérifie les types, lance les tests, construit le site et le publie à chaque `push` sur la branche `main`.

Une seule fois, sur GitHub : **Settings → Pages → Source : GitHub Actions**.

Le site est servi sous `/one-more-floor` (réglage `experiments.baseUrl` dans `app.json`). Si le dépôt porte un autre nom, il faut mettre ce nom à cet endroit.

## Builds Android / iOS (plus tard)

La configuration est prête (`app.json`, `eas.json`). Les étapes, qui demandent tes comptes développeur, sont dans [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md). En résumé :

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile production   # produit un .aab
npx eas-cli@latest build --platform ios --profile production       # nécessite un compte Apple Developer
```

L'identifiant provisoire `com.yourstudio.onemorefloor` est défini dans `app.json` (`ios.bundleIdentifier` et `android.package`) : il faut le remplacer avant la première publication, car il ne pourra plus changer ensuite.

## Qualité

- Tests : `npm test` (64 tests)
- Checklist de tests manuels : [docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md)
- Limites connues : [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md)

## Licences

Le code et les assets de TOWER DING appartiennent à leur propriétaire (tous droits réservés). Les composants tiers et leurs licences sont listés dans [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md).
