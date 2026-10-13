# Checklist de publication (App Store / Google Play)

> Le propriétaire a choisi de faire les démarches store **plus tard**. Cette checklist décrit ce qui est déjà prêt et ce qui restera à faire.
>
> Les exigences des stores changent souvent. **Avant chaque soumission**, relire les pages officielles : Apple Developer / App Store Connect (« Upcoming requirements »), Google Play Console (« Target API level requirements ») et Android Developers.
>
> Point de départ indiqué dans le cahier des charges (septembre 2026), **non revérifié** à ce stade : Google Play exige de cibler Android 16 (API 36) ou plus pour les nouvelles applis et mises à jour ; Apple exige une compilation avec Xcode 26 et le SDK iOS 26. Expo SDK 57 est prévu pour les SDK récents, mais la valeur de `targetSdkVersion` réellement produite doit être vérifiée dans le build.

## Déjà prêt

- [x] Nom, version 1.0.0, build 1 / versionCode 1 (`app.json`)
- [x] Portrait uniquement
- [x] Icône iOS 1024×1024 sans transparence ; icône adaptative Android (avant-plan, couleur de fond, monochrome)
- [x] Image de lancement sombre (`expo-splash-screen`)
- [x] Aucune permission demandée ; micro et audio en arrière-plan explicitement désactivés et bloqués (`blockedPermissions`)
- [x] Manifeste de confidentialité iOS : aucun tracking, aucune donnée collectée
- [x] `usesNonExemptEncryption: false` : aucun chiffrement propriétaire
- [x] Profils EAS `preview` (APK de test) et `production` (AAB) dans `eas.json`
- [x] Textes store FR/EN, politique de confidentialité, déclarations App Privacy / Data Safety : dossier `docs/store/`
- [x] Aucun secret ni clé de signature dans le dépôt (`.gitignore`)

## À faire par le propriétaire

1. **Identifiant définitif**
   - Identifiant choisi : `com.racles.towerding` (`app.json` : `ios.bundleIdentifier` et `android.package`).
   - Il ne peut plus changer après la première publication.
2. **Comptes**
   - Apple Developer Program : 99 $/an.
   - Google Play Console : frais uniques de 25 $.
   - Compte Expo gratuit pour EAS Build.
3. **Politique de confidentialité en ligne**
   - Publiée avec la version web : https://jocelynei.github.io/tower-ding/privacy-policy.html
   - Coller cette adresse dans les deux consoles.
4. **Build Android**
   ```bash
   npx eas-cli@latest login
   npx eas-cli@latest build --platform android --profile production
   ```
   - EAS propose de **générer et conserver la clé de signature** : c'est l'option recommandée pour débuter. Ne jamais mettre de fichier `.jks` dans le dépôt.
   - Dans la Play Console, activer **Play App Signing**.
   - *Vérification* : `aapt dump badging app.aab` (ou l'onglet « App bundle explorer » de la Play Console) indique le `targetSdkVersion`.
5. **Build iOS**
   ```bash
   npx eas-cli@latest build --platform ios --profile production
   npx eas-cli@latest submit --platform ios
   ```
   - EAS crée les certificats et profils de provisionnement avec ton compte Apple ; aucun Mac n'est nécessaire.
   - *Vérification* : le build apparaît dans App Store Connect → TestFlight.
6. **Consoles** : remplir les fiches avec `docs/store/`, faire les captures (`SCREENSHOT_PLAN.md`), le questionnaire de classification (`AGE_RATING_NOTES.md`), la confidentialité et les fonctionnalités d'accessibilité (`ACCESSIBILITY.md`).
7. **Tests** : TestFlight et test interne Play avec la checklist `QA_CHECKLIST.md`.
8. **Publication** : accepter les contrats et soumettre pour examen.

## Avant chaque nouvelle version

- [ ] Augmenter `version` (visible par les joueurs), ainsi que `ios.buildNumber` et `android.versionCode` (+1 à chaque envoi)
- [ ] Si le format de sauvegarde change : augmenter `SAVE_VERSION` et ajouter une migration
- [ ] `npm run typecheck && npm run lint && npm test`
- [ ] `npx expo-doctor`
- [ ] QA manuelle complète
- [ ] Notes de version FR/EN (`docs/store/RELEASE_NOTES.md`)
