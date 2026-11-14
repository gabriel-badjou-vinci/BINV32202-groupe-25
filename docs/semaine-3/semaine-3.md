# Inventaire des guides et senseurs

| Catégorie | Guide — feedforward | Senseur — feedback |
|---|---|---|
| **Inférentiel**<br>(interprété par une IA) | **`.github/copilot-instructions.md`**<br><br>Il impose des règles de build, de test, de lint, d’architecture, ainsi que des conventions de nommage, de fichiers et de documentation.<br><br>**Exemple :** les imports backend doivent conserver l’extension `.ts` et les erreurs API doivent utiliser `HttpError`.<br><br>**Exécution :** le fichier a été consulté par l’IA, car il est ajouté à son contexte. | **`backend/API.md`**<br><br>L’IA peut relire ce fichier pour vérifier que le code produit respecte la documentation de l’API.<br><br>**Exemple :** les requêtes d’exemple sont présentes dans [`backend/http/`](C:/Users/gabri/vinci/3220-1-Intelligence-Artificielle/S5/BINV32202-groupe-25/backend/http/).<br><br>**Exécution :** si l’IA ajoute une route HTTP à un autre endroit ou ne respecte pas le contrat documenté, elle peut le détecter et le corriger. |
| **Computationnel**<br>(règles ou calculs exécutables) | **`.vscode/settings.json`**<br><br>Il configure les permissions et les commandes autorisées, notamment la lecture automatique de `rg`, `grep` et `git status`, ainsi que les commandes de test, de lint et de build.<br><br>**Exemple :** `chat.tools.global.autoApprove` vaut `false` et les écritures hors du workspace sont bloquées.<br><br>**Exécution :** la configuration est présente et consultée ; elle est appliquée par VS Code et Copilot. | **`backend/tests/` et `frontend/tests/`**<br><br>Les tests vérifient le comportement de l’API et de l’interface React.<br><br>**Exemple :** un test vérifie qu’une offre avec un statut inconnu est refusée par une contrainte `CHECK` dans [`backend/tests/db/constraints.test.ts`](C:/Users/gabri/vinci/3220-1-Intelligence-Artificielle/S5/BINV32202-groupe-25/backend/tests/db/constraints.test.ts).<br><br>**Exécution :** les tests sont configurés dans les scripts npm. |

## Matrice de traçabilité EF-32 et EF-33

La source des exigences est le cahier des charges, section 7.4 :
[`docs/cdc_gesta_developpement.md`](../cdc_gesta_developpement.md). La couverture
est dite **couverte** seulement lorsque le test vérifie explicitement le statut,
le contenu ou l'isolement attendu, et pas uniquement le code HTTP.

| Exigence | Cas à vérifier | Test existant (fichier et nom) | Assertions utiles | Couverture |
|---|---|---|---|---|
| EF-32 | Candidater à une offre publiée avec un message facultatif | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « crée une candidature avec un message obligatoire » | `status` `201`, `offerId`, `studentId`, message trimé et statut `IN_PROGRESS` | Couvert |
| EF-32 | Candidater sans message, avec message absent ou blanc | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « accepte un message absent ou vide » | `status` `201`, `body.message` vaut `null` | Couvert |
| EF-32 | Refuser un message trop long ou d'un mauvais type | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « refuse un message trop long » / « refuse un message qui n'est pas une chaîne » | `status` `400`, code `INVALID_BODY` | Couvert |
| EF-32 | Refuser une candidature à une offre non publiée | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « refuse une offre non publiée » | `status` `400`, code `OFFER_NOT_ELIGIBLE` | Couvert |
| EF-32 | Refuser une seconde candidature active pour la même offre | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « refuse une candidature active en doublon » | `status` `409`, code `APPLICATION_EXISTS` | Couvert |
| EF-32 | Retirer sa candidature en cours | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « retire sa candidature en cours » | `status` `200`, statut `WITHDRAWN` | Couvert |
| EF-32 | Ne pas retirer la candidature d'un autre étudiant | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « refuse le retrait de la candidature d'un autre étudiant » | `status` `404`, code `APPLICATION_NOT_FOUND` | Couvert |
| EF-32 | Ne pas retirer une candidature déjà traitée | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « refuse le retrait d'une candidature déjà traitée » | `status` `409`, code `APPLICATION_NOT_WITHDRAWABLE` | Couvert |
| EF-32 | Re-candidater après retrait | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « autorise une nouvelle candidature après retrait » | retrait `WITHDRAWN`, nouvelle réponse `201`, nouvel identifiant | Couvert |
| EF-33 | Consulter uniquement ses candidatures | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « retourne uniquement les candidatures de l'étudiant » | `status` `200`, tableau exact contenant seulement l'ID et le `studentId` de Mateusz | Couvert |
| EF-33 | Voir une liste vide sans candidature | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « retourne une liste vide pour un étudiant sans candidature » | `status` `200`, tableau `[]` | Couvert |
| EF-33 | Voir le statut « En cours » et « Retirée » | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « conserve les statuts de toutes les candidatures de l'étudiant » | liste des statuts exactement `IN_PROGRESS`, `WITHDRAWN` | Couvert |
| EF-33 | Voir le statut « Retenue » | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « retourne uniquement les candidatures de l'étudiant » | statut `SELECTED` dans l'objet retourné | Couvert |
| EF-33 | Voir le statut « Non retenue » | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « expose le statut non retenue de sa candidature » | tableau exact, ID de Lea, `studentId` de Lea et statut `REJECTED` | Couvert |
| EF-33 | Refuser la consultation aux profils administrateur et contact | [`backend/tests/applications.test.ts`](../../backend/tests/applications.test.ts) — « refuse la consultation au profil %s » | `status` `403`, code `FORBIDDEN` | Couvert |

### Contrôles présents mais hors EF-32/EF-33

Les tests de validation du format de l'identifiant (`INVALID_QUERY`), les tests
d'accès aux offres ([`backend/tests/offers.test.ts`](../../backend/tests/offers.test.ts))
et les tests frontend de la page « Mes candidatures » vérifient d'autres
comportements. Ils ne sont donc pas réutilisés comme preuve de couverture
d'EF-32 ou EF-33.

### Manque traité et limite

Le statut « Non retenue » était le seul statut explicitement listé par EF-33
qui n'avait pas de test de consultation dédié. Le test ajouté échouerait si le
backend supprimait les candidatures rejetées, retournait le mauvais étudiant ou
traduisait mal le statut `REJECTED`. Le scénario est vérifié au niveau API avec
la base SQLite en mémoire de
[`backend/tests/helpers/testApp.ts`](../../backend/tests/helpers/testApp.ts) ;
aucun test end-to-end n'est nécessaire pour ce manque.

La matrice ne prétend pas vérifier EF-30/EF-31, ni l'affichage des libellés
français dans le navigateur : ces aspects ne sont pas nécessaires pour démontrer
le contrat API EF-32/EF-33 et relèvent des tests frontend distincts.

### Validation exécutée

La commande demandée `npm run check` a été exécutée le 14/11/2026 et a réussi
entièrement :

| Contrôle | Résultat |
|---|---|
| `npm run lint` | Réussi, backend et frontend, aucun avertissement |
| `npm run typecheck` | Réussi, backend et frontend |
| `npm run test` | Réussi : 135 tests backend et 54 tests frontend |
| `npm run build` | Réussi, compilation backend et build Vite frontend |

Le test ciblé ajouté a également été exécuté avec
`npm run test -w backend -- tests/applications.test.ts` : 18 tests réussis.

# Audit des guides du projet au regard de Web 2

## Périmètre et méthode

Les guides applicables ont été recherchés dans le dépôt. Aucun `AGENTS.md`,
`COPILOT.md` ou fichier `.instructions.md` n'a été trouvé. Les guides réellement
applicables sont :

- [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md),
  lu en entier : consignes de build, architecture, sécurité, tests et
  documentation ;
- [`README.md`](../../README.md), lu en entier : démarrage, commandes, choix
  techniques et limites du projet ;
- [`docs/architecture.md`](../architecture.md), lu en entier : découpage
  backend/frontend, flux d'authentification et tests ;
- [`backend/API.md`](../../backend/API.md), lu en entier : contrat HTTP,
  authentification, erreurs et routes.

Le cahier des charges ([`docs/cdc_gesta_developpement.md`](../cdc_gesta_developpement.md))
est utilisé comme contexte fonctionnel, mais ce n'est pas un guide de
développement destiné à l'agent.

Les références Web 2 sont les supports officiels publiés sur
<https://e-vinci.github.io/BINV2150A-slides/>. Les contenus Markdown sources
consultés sont les séances 02 (HTTP/REST/API), 03 (JWT), 04 (hachage et
sécurité), 07 (React), 12 (événements et formulaires), 13 (collection comme
état) et 15 (routage). Les liens directs sont indiqués dans le tableau.

## Matrice de comparaison

| Attente ou convention de Web 2 (source) | Guide examiné (fichier et passage) | Correspondance | Écart ou ajout proposé |
|---|---|---|---|
| Séparer authentification (« qui es-tu ? ») et autorisation (« que peux-tu faire ? »). [Séance 03, *Authentification vs Autorisation*](https://raw.githubusercontent.com/e-vinci/BINV2150A-slides/main/seance-03/slides.md) | [`docs/architecture.md`](../architecture.md), sections « Identification et droits » et « Backend » : `authenticate` produit 401, `authorize` produit 403 et le service filtre les données. Même règle dans [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) : l'authentification recharge le compte et l'autorisation est nommée dans `permissions.ts`. | Oui | Rien d'essentiel. Le guide pourrait toutefois rappeler qu'un 401 signifie non authentifié et un 403 authentifié mais interdit, ce que le contrat API documente déjà. |
| Utiliser les verbes, chemins, paramètres, corps JSON et codes HTTP de façon cohérente. [Séance 02, *Rappel : Requêtes HTTP*, *Conventions REST* et *Codes de retour HTTP*](https://raw.githubusercontent.com/e-vinci/BINV2150A-slides/main/seance-02/slides.md) | [`backend/API.md`](../../backend/API.md) documente `GET`, `POST`, les paramètres, les corps JSON et les statuts 200/201/400/401/403/404/409/500. [`docs/architecture.md`](../architecture.md) décrit le flux route → contrôleur → service → repository. | Oui | Ajouter dans le guide Copilot que toute nouvelle route doit être accompagnée de sa section API et d'au moins un exemple `.http`, car cette obligation est actuellement surtout implicite. |
| Documenter endpoints, paramètres, requêtes/réponses et erreurs. [Séance 02, *Documentation API*](https://raw.githubusercontent.com/e-vinci/BINV2150A-slides/main/seance-02/slides.md) | [`backend/API.md`](../../backend/API.md) fournit le contrat des routes, les formats JSON et les codes d'erreur. Le guide Copilot le désigne comme documentation canonique. | Oui | Préciser si OpenAPI est volontairement hors périmètre. Le support cite JSDoc, Markdown et OpenAPI ; le dépôt a choisi Markdown mais ne formalise pas ce choix comme convention obligatoire. |
| Utiliser un JWT signé, envoyé à chaque requête, avec une clé secrète hors du code et une expiration. [Séance 03, *Authentification par JWT*, *Clé secrète* et *Générer un JWT*](https://raw.githubusercontent.com/e-vinci/BINV2150A-slides/main/seance-03/slides.md) | [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) impose le rechargement serveur de l'utilisateur et précise que l'authentification démo est réservée au développement. [`README.md`](../../README.md), section « Mode démo », précise qu'il ne s'agit pas d'une authentification réelle et que le serveur refuse ce mode en production. | Partielle | Le dépôt utilise bien un JWT et une clé dans `.env`, mais le mode démo n'est pas le flux email + mot de passe du support et le guide ne demande pas explicitement une expiration dans ses conventions. Ajouter une exigence d'expiration et une vérification d'algorithme pour une authentification réelle ; conserver explicitement le mode démo comme exception de développement. |
| Ne jamais stocker de mot de passe en clair ; utiliser un hash salé adapté. [Séance 04, *NE PAS : Stocker les mots de passe en clair*, *Hachage avec Salt* et `bcrypt`](https://raw.githubusercontent.com/e-vinci/BINV2150A-slides/main/seance-04/slides.md) | [`README.md`](../../README.md) et [`backend/API.md`](../../backend/API.md) disent que la connexion réelle n'est pas implémentée et que le mode démo n'a pas de mot de passe. Le guide Copilot avertit aussi de ne pas traiter le mode démo comme une authentification réelle. | Partielle / non applicable au code actuel | Aucun mot de passe n'est actuellement stocké, donc il n'y a pas de contradiction observable. Pour une future connexion réelle, ajouter au guide une règle explicite : hash asynchrone avec sel, jamais de mot de passe ni de secret dans Git, et tests de non-exposition. |
| Organiser React en composants et gérer les événements avec des handlers JSX. [Séance 07, *React* et *Composants*](https://raw.githubusercontent.com/e-vinci/BINV2150A-slides/main/seance-07/slides.md), et [Séance 12, *Événements : DOM et React*](https://raw.githubusercontent.com/e-vinci/BINV2150A-slides/main/seance-12/slides.md) | [`docs/architecture.md`](../architecture.md), section « Frontend » : `pages → hooks → services/utils → models`, puis composants réutilisables ; `App.tsx` possède `useAuth`. Le guide Copilot reprend exactement ce flux. | Oui | Aucun écart important. Le guide pourrait préciser la convention de nommage `handleFoo` pour les handlers, explicitement enseignée en séance 12, mais ce n'est pas indispensable au fonctionnement. |
| Pour un formulaire React, utiliser `onSubmit`, empêcher le rechargement, contrôler les champs si l'état doit refléter la saisie et utiliser la validation HTML (`required`, `min`, `max`, `type`). [Séance 12, *Soumettre un formulaire* et *Pourquoi contrôler un champ ?*](https://raw.githubusercontent.com/e-vinci/BINV2150A-slides/main/seance-12/slides.md) | [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) impose la validation des réponses API avec des type guards et l'annulation des fetchs ; [`README.md`](../../README.md) documente le choix React/TypeScript. Les composants du frontend utilisent notamment des `label`, `onSubmit` et des messages `role="alert"`. | Partielle | Les guides détaillent surtout la validation backend et les réponses API, pas les règles de formulaires React. Ajouter : `onSubmit` plutôt que `onClick`, `preventDefault`, champs accessibles avec `label`, validation native quand pertinente, et messages d'erreur associés au champ. |
| Représenter les collections dans l'état React et dériver l'affichage de cet état. [Séance 13, *Collection comme état*](https://raw.githubusercontent.com/e-vinci/BINV2150A-slides/main/seance-13/slides.md) | [`docs/architecture.md`](../architecture.md) décrit les hooks comme état prêt à afficher (`useCompanies`, `useOffers`) et les pages comme assemblage. Le guide Copilot impose la séparation pages/hooks/services/models. | Oui | Ajouter éventuellement une phrase interdisant de dupliquer la même collection dans plusieurs composants sans nécessité, afin de rendre la règle de source unique plus explicite. |
| Utiliser un routeur pour plusieurs pages et distinguer l'URL de l'état local. [Séance 15, *Plusieurs pages* et *Routage*](https://raw.githubusercontent.com/e-vinci/BINV2150A-slides/main/seance-15/slides.md) | [`docs/architecture.md`](../architecture.md) décrit une page par route et `App.tsx` comme propriétaire des routes. [`README.md`](../../README.md) indique React Router dans les choix techniques. | Oui | Rien de nécessaire. Le guide pourrait préciser la politique des routes inconnues et de l'accès à une page authentifiée, actuellement dispersée entre `App.tsx` et les hooks. |
| Valider les entrées côté serveur et ne pas faire confiance aux données du client. [Séance 02, *Corps de la requête* et *Codes de retour HTTP*](https://raw.githubusercontent.com/e-vinci/BINV2150A-slides/main/seance-02/slides.md) ; la séance 03 distingue aussi identité et permissions | [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) impose que les contrôleurs parsèment/valident, que les services portent les règles métier et que les erreurs utilisent `HttpError`. [`docs/architecture.md`](../architecture.md) rappelle les validations de paramètres et les contraintes SQLite. | Oui | Ajouter une règle de validation systématique des champs inconnus, de taille des chaînes et de format JSON si le projet veut l'exiger. Le guide actuel couvre les cas prévus mais ne demande pas explicitement une stratégie pour les propriétés supplémentaires. |
| Accessibilité, responsive design et bonnes pratiques HTML | Aucun support Web 2 consulté dans les séances 01–15 ne fournit une consigne normative exploitable sur WCAG, ARIA, contraste, clavier ou responsive design. Le site d'index liste les séances mais ne présente pas une séance dédiée à ces sujets. | Non vérifiable comme attente de Web 2 | Ne pas attribuer ces exigences à Web 2 sans autre support. Indépendamment, le cahier des charges impose ENF-01 (responsive) et l'implémentation contient déjà quelques labels et rôles ARIA ; ajouter au guide une checklist accessibilité seulement si l'enseignant ou une source officielle du projet la demande. |

## Conclusion et recommandations

Les guides du dépôt sont bien alignés avec le noyau backend de Web 2 :
architecture en couches, API REST documentée, statuts HTTP explicites,
authentification/autorisation séparées, validation serveur et tests. Ils sont
également cohérents avec les séances React sur les composants, les hooks, l'état
et le routage.

Les écarts sont surtout des précisions manquantes, pas des contradictions :

1. documenter explicitement l'obligation d'expiration et de contrôle de
   l'algorithme pour un futur JWT réel ;
2. documenter la règle de hachage asynchrone salé dès que des mots de passe
   seront ajoutés ;
3. compléter les consignes frontend avec les conventions de formulaires
   (`onSubmit`, `preventDefault`, validation native et erreurs associées) ;
4. préciser le statut des propriétés JSON inconnues et la politique des routes
   authentifiées/inconnues ;
5. ne pas présenter WCAG ou l'accessibilité comme une consigne de Web 2 sur la
   seule base des supports consultés. Le cahier des charges reste une source
   distincte : il impose notamment ENF-01 à ENF-04.

Ce rapport est un audit uniquement : aucun guide du dépôt n'a été modifié.
