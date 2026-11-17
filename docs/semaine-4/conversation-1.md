
/skills reload

11:28 AM
Skills reloaded. Found 15 skills.

11:28 AM
•
Copilot Fusion
/test-gap-audit les tests des canditatures (EF-32 et EF-33)

11:31 AM
test-gap-audit
test-gap-audit
Je vais auditer uniquement les candidatures EF-32/EF-33, en reliant leurs routes, services, composants et tests existants, puis vérifier les tests ciblés sans modifier le dépôt.

Le backend possède déjà une couverture d’intégration assez détaillée pour les scénarios métier. Je vérifie maintenant le parcours frontend de candidature et les branches d’erreur/retrait, qui sont les candidats les plus probables aux lacunes restantes.

Search for it\("(crée une candidature|autorise une nouvelle candidature|retire sa candid...

Test Gap Audit : candidatures EF-32 et EF-33

Aucun code modifié. Les tests backend couvrent correctement le contrat API et les règles métier principales. Aucun P0 identifié.

P2 : message facultatif non testé avec contenu côté frontend.
Gap : le formulaire doit transmettre un message nettoyé, mais le seul test frontend couvre l’envoi sans message.
Couverture actuelle : le test vérifie {} et la confirmation, pas un message saisi ni le trim.
Évidence : le formulaire appelle message.trim() dans OfferApplicationForm.tsx:30, tandis que le test ne couvre que le scénario sans message dans OffersPage.test.tsx:53.
Test suggéré : saisir "  Mon expérience Docker  ", soumettre, puis vérifier que le body vaut {"message":"Mon expérience Docker"}.

P2 : erreurs de candidature frontend insuffisamment couvertes.
Gap : les branches d’erreur API et de session expirée du formulaire ne sont pas testées.
Couverture actuelle : aucun test direct trouvé pour OfferApplicationForm; seul le succès est vérifié. Le code distingue pourtant erreur 401 et autres erreurs dans OfferApplicationForm.tsx:33.
Test suggéré : ajouter deux cas dans OffersPage.test.tsx : réponse 409 affichée comme alerte, puis réponse 401 appelant onUnauthorized.

P2 : échec du retrait non testé côté frontend.
Gap : l’interface doit afficher l’erreur lorsque POST /applications/:id/withdraw échoue, et déconnecter l’utilisateur en cas de 401.
Couverture actuelle : seul le retrait réussi est testé dans ApplicationsPage.test.tsx:80. Les branches correspondantes existent dans ApplicationsPage.tsx:27.
Test suggéré : tester une réponse 409 affichée dans role="alert", puis une réponse 401 appelant onUnauthorized sans rechargement réussi.

P2 : absence de test UI garantissant qu’une candidature n’est proposée que pour une offre publiée.
Gap : ce garde-fou est présent dans le composant mais non vérifié avec un étudiant.
Évidence : OfferTable.tsx:39 conditionne le bouton au statut PUBLISHED.
Test suggéré : rendre un étudiant avec une offre SUBMITTED ou ASSIGNED et vérifier l’absence du bouton « Candidater ».

Suggested Test Plan

Ajouter le test frontend du message trimé.
Ajouter les tests 401/409 de soumission.
Ajouter les tests 401/409 de retrait.
Ajouter le test d’absence du bouton pour une offre non publiée.
Existing Coverage Worth Keeping

Les scénarios backend EF-32/EF-33 : création, retrait, recandidature, propriété, statuts et autorisations dans applications.test.ts.
L’affichage des quatre statuts et le retrait réussi dans ApplicationsPage.test.tsx.
Le parcours étudiant de candidature sans message dans OffersPage.test.tsx.
Checks Run

git status --short : dépôt inchangé par l’audit ; seul .github/skills/ est non suivi.
python3 .github/skills/test-gap-audit/scripts/coverage_map.py --top 25 : 92 sources, 23 fichiers de test, 22 sources appariées ; résultat heuristique.
npm run test -w backend -- --run tests/applications.test.ts : 18 tests réussis.
npm run test -w frontend -- --run tests/ApplicationsPage.test.tsx tests/OffersPage.test.tsx : 11 tests réussis.
Not Tested

La suite complète npm run check n’a pas été relancée, car l’audit était ciblé et les tests concernés ont réussi.
11:35 AM
4m 3s