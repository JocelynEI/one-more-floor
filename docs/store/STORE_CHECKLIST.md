# Checklist store

## Fiche
- [ ] Nom, sous-titre, description courte et longue (FR + EN) : fichiers de ce dossier
- [ ] Mots-clés App Store
- [ ] Catégorie : **Jeux → Arcade** (secondaire : Puzzle)
- [x] Icône : `assets/icon.png` (1024, sans transparence) ; Play Store 512×512 : `graphics/play-icon-512.png`
- [x] Bannière Play (1024×500) : `graphics/play-feature-graphic-fr.png` et `-en.png`
- [x] 5 captures par langue : `screenshots/` (`SCREENSHOT_PLAN.md`)
- [x] URL de politique de confidentialité publique : https://jocelynei.github.io/tower-ding/privacy-policy.html
- [x] Adresse e-mail de support : jocelyn.lebon.ae@gmail.com

## Déclarations
- [ ] App Privacy (`APP_PRIVACY_APPLE.md`)
- [ ] Data safety (`DATA_SAFETY_GOOGLE_PLAY.md`)
- [ ] Classification (`AGE_RATING_NOTES.md`)
- [ ] Accessibilité (`ACCESSIBILITY.md`)
- [ ] Publicité : **non** ; Achats : **non**
- [ ] Export compliance : pas de chiffrement non exempté (`usesNonExemptEncryption: false`)

## Technique
- [ ] Bundle ID / package définitif
- [ ] Version et numéro de build incrémentés
- [ ] Build signé via EAS (`docs/RELEASE_CHECKLIST.md`)
- [ ] Niveau d'API cible et SDK iOS conformes aux exigences **du jour** (sites officiels)
- [ ] Test interne / TestFlight validé avec `docs/QA_CHECKLIST.md`
