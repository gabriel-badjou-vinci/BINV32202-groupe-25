| Cas à vérifier | Test existant et assertion utile | Manque confirmé ou constat écarté |
|---|---|---|
| Candidater sans message | `OffersPage.test.tsx:53` vérifie le body `{}` et le message de confirmation. | **Constat écarté : couvert.** |
| Candidater avec un message contenant des espaces | Aucun test frontend ne vérifie le contenu saisi et son nettoyage. | **Manque confirmé.** Ajouter un test vérifiant `{"message":"Message nettoyé"}`. |
| Afficher une erreur lors de la candidature | Aucun test frontend ne couvre une réponse 409 ou une erreur API. | **Manque confirmé.** |
| Rediriger après une erreur 401 lors de la candidature | Aucun test dédié au formulaire ne vérifie `onUnauthorized`. | **Manque confirmé.** |
| Retirer une candidature en cours | `ApplicationsPage.test.tsx:80` vérifie l’appel POST et le rechargement. | **Constat écarté : succès couvert.** |
| Afficher une erreur lors du retrait | Aucun test ne vérifie une réponse 409 ou une erreur d’API. | **Manque confirmé.** |
| Rediriger après une erreur 401 lors du retrait | Le test 401 existant concerne uniquement le chargement de la liste (`ApplicationsPage.test.tsx:98`). | **Manque confirmé.** |
| Ne proposer « Candidater » que pour une offre publiée | La condition existe dans `OfferTable.tsx:39`, mais aucun test étudiant ne vérifie l’absence du bouton pour une offre non publiée. | **Manque confirmé.** |
| Règles métier backend EF-32/EF-33 | `applications.test.ts:19` couvre création, validation, retrait, propriété, recandidature, statuts et autorisations. | **Constat écarté : couverture backend suffisante.** |
| Affichage des quatre statuts EF-33 | `ApplicationsPage.test.tsx:7` vérifie « En cours », « Retenue », « Non retenue » et « Retirée ». | **Constat écarté : couvert.** |