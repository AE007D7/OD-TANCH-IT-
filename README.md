# OD ÉTANCHÉITÉ

Site français adapté au mobile : vidéo de drone, intro progressive, pages métiers, estimateur de budget HT, galerie administrable et assistant conversationnel.

## Déploiement Vercel

Importer ce dépôt dans Vercel avec Node 24 et les paramètres de `vercel.json`.

1. Créer et connecter un store Vercel Blob privé au projet. La connexion fournit `BLOB_STORE_ID` et l’authentification OIDC (ou `BLOB_READ_WRITE_TOKEN` selon le mode de connexion).
2. Configurer `ADMIN_ACCESS_CODE` comme variable chiffrée, avec un code aléatoire d’au moins 24 caractères. Le communiquer uniquement au responsable du site. Il n’existe aucun code par défaut dans les sources.
3. Activer Vercel AI Gateway pour le projet. Le SDK utilise l’identité OIDC de Vercel ; `AI_GATEWAY_API_KEY` peut être configurée si nécessaire. Le modèle par défaut, vérifié dans le catalogue live, est `google/gemini-3.1-flash-lite`. Il peut être changé avec `AI_GATEWAY_MODEL`.
4. `npm ci && npm test && npm run build`.

L’assistant indique explicitement son mode guidé si l’IA n’est pas disponible. Les réponses sont limitées au contexte de l’entreprise. Il ne réserve aucune intervention et ne fait pas de devis contractuel. Les messages ne sont pas enregistrés dans le stockage de ce site ; la confidentialité explique leur traitement par le service IA.

L’espace `/publier.html` demande le code administrateur. Les écritures contrôlent ce code côté serveur et l’origine de la requête. Les photos sont optimisées avant l’envoi ; projets et photos persistent dans le store privé et sont servis par l’API.

## Informations de démonstration

Coordonnées d’exemple, ville et zone à confirmer ; aucune qualification ou référence inventée. Les barèmes de l’estimateur sont à valider. Le formulaire Contact télécharge une demande localement : aucun envoi à l’entreprise n’est activé. Trois images IA sont identifiées comme illustrations. Vidéo d’illustration de drone : 8K / Pexels, source et licence dans les mentions légales.

Le domaine canonique par défaut est `https://od-etancheite.vercel.app`, à adapter dans `scripts/build.mjs` si Vercel attribue une autre adresse ou lors de l’ajout d’un domaine client.

## Validation

Tests d’accès serveur, protection contre les requêtes tierces, tailles de fichiers et routes médias ; vérification du formulaire, de la galerie, du robot et du mobile dans l’aperçu. Le test réel IA exige un compte Gateway autorisé et provisionné.
