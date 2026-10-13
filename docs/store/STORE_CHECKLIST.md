# Checklist store

## Fiche
- [ ] Nom, sous-titre, description courte et longue (FR + EN) : fichiers de ce dossier
- [ ] Mots-clés App Store
- [ ] Catégorie : **Jeux → Arcade** (secondaire : Puzzle)
- [ ] Icône : `assets/icon.png` (1024, sans transparence) ; Play Store 512×512 à exporter depuis `assets/brand/icon-master-2048.png`
- [ ] Bannière Play (1024×500) : à créer (logo + cabine sur fond `#0E1420`)
- [ ] 5 captures par langue (`SCREENSHOT_PLAN.md`)
- [ ] URL de politique de confidentialité publique (`PRIVACY_POLICY.md` publiée)
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
