# App Store Connect : App Privacy

Réponses proposées d'après le code **réellement présent** en V1.

| Question | Réponse |
|---|---|
| Do you or your third-party partners collect data from this app? | **No, we do not collect data from this app** |
| Tracking (ATT) | **Non** : aucun identifiant publicitaire, aucun SDK tiers de suivi |
| Privacy Nutrition Label | **Data Not Collected** |

**Justification**
- Aucune requête réseau dans le code du jeu (voir `docs/THIRD_PARTY_NOTICES.md`, « Audit réseau »).
- Stockage local uniquement (AsyncStorage). Pour Apple, des données qui ne quittent pas l'appareil ne sont pas « collectées ».
- Manifeste de confidentialité (`app.json` → `ios.privacyManifests`) : `NSPrivacyTracking = false`, aucun type de donnée collecté. API à justification requise : `UserDefaults` (raison `CA92.1`, lecture et écriture des propres données de l'appli, utilisées par React Native et le stockage).

**Si une V2 ajoute** analytics, crash reporting, achats intégrés ou classement en ligne, il faudra **refaire ces réponses** avant la soumission.
