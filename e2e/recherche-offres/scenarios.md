# Scénarios end-to-end - Recherche d'offres

## Cas 1 - Un étudiant consulte uniquement les offres publiées

### Préconditions

- L'application est disponible en environnement de démonstration.
- La base contient les données de démonstration documentées dans `docs/seed.md`.
- Aucun filtre de date n'est appliqué.

### Étapes

1. Ouvrir l'application.
2. Sur la page de connexion de démonstration, choisir **Lucas Dupont** dans le groupe **Étudiants**.
3. Cliquer sur **Offres** dans la navigation principale.

### Résultat attendu

- La page affiche le titre « Offres de stage ».
- Le texte explicatif indique : « Les offres publiées. »
- Le tableau liste uniquement les offres publiées de l'année de démonstration :
  - Application React de gestion de flotte
  - API REST de facturation
  - Tableau de bord de qualité des données
  - Assistant conversationnel interne
- Le compteur annonce « 4 offres ».
- Chaque ligne affiche son entreprise, son année, sa période et le statut « Publiée ».
- Les offres soumises, en attente, attribuées ou archivées ne sont pas affichées.
- Chaque offre publiée présente un bouton **Candidater**.

---

## Cas 2 - Un administrateur filtre les offres par intervalle de dates

### Préconditions

- L'application est disponible en environnement de démonstration.
- La base contient les données de démonstration documentées dans `docs/seed.md`.
- Aucun filtre de date n'est appliqué.

### Étapes

1. Ouvrir l'application.
2. Sur la page de connexion de démonstration, choisir **Anne Leclercq** dans le groupe **Administrateurs**.
3. Cliquer sur **Offres** dans la navigation principale.
4. Saisir `2027-02-08` comme date de début.
5. Saisir `2027-05-28` comme date de fin.
6. Cliquer sur **Filtrer**.

### Résultat attendu après le filtrage

- Le compteur et le tableau sont actualisés sans rechargement complet de la page.
- Les offres dont la période chevauche l'intervalle du 8 février au 28 mai 2027 sont affichées :
  - Outil de planification des consultants
  - Automatisation des tests de bout en bout
  - Application React de gestion de flotte
  - Refonte du portail client
  - API REST de facturation
  - Tableau de bord de qualité des données
  - Migration d'une application vers le cloud
  - Assistant conversationnel interne
- Les offres hors période ne sont pas affichées.
- Les offres dont la période commence exactement le 8 février 2027 ou se termine exactement le 28 mai 2027 sont incluses.

### Étapes de réinitialisation

7. Cliquer sur **Réinitialiser**.

### Résultat attendu après la réinitialisation

- Les champs « Date de début » et « Date de fin » sont vides.
- Toutes les offres visibles pour l'administrateur sont à nouveau affichées, tous statuts confondus.
- Une sélection d'un intervalle sans aucune offre correspondante affiche l'état vide « Aucune offre à afficher. ».
