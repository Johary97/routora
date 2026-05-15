# Routora

> Planifiez vos tournées en quelques clics.

Routora vous aide à construire un itinéraire à plusieurs étapes et trouve automatiquement l'ordre de visite le plus court. Idéal pour les commerciaux terrain, les techniciens en intervention, les livreurs ou tout déplacement multi-stops.

## Ce que Routora fait pour vous

- **Construisez votre liste d'étapes** par recherche d'adresse ou en cliquant sur la carte.
- **Réordonnez à la main** par glisser-déposer, ou **laissez Routora optimiser** l'ordre avec son algorithme dédié.
- **Visualisez l'itinéraire routier réel** sur la carte (pas seulement à vol d'oiseau), avec distance et durée estimées.
- **Bouclez la tournée** si vous devez revenir au point de départ.
- **Retrouvez votre itinéraire** au prochain lancement : tout est conservé localement, sans compte ni serveur.
- **Partagez** votre tournée à un collègue : un seul lien suffit, l'itinéraire est encodé dans l'URL.

## Démarrage

```bash
npm install
npm run dev      # serveur de développement
npm run build    # build de production (dossier dist/)
npm run preview  # prévisualiser le build
```

Ouvrez ensuite `http://localhost:5173`.

## Mode d'emploi

1. **Définissez votre point de départ** — recherchez une adresse ou cliquez sur la carte. Il s'affiche en vert avec une étoile.
2. **Ajoutez vos étapes** — chacune apparaît automatiquement sur la carte avec son numéro.
3. **Cliquez sur « Optimiser l'ordre »** — l'algorithme réorganise les étapes pour minimiser la distance totale et vous montre le gain en pourcentage.
4. **Ajustez si besoin** — glissez-déposez les étapes dans le panneau de gauche, déplacez les marqueurs sur la carte, supprimez une étape qui ne vous arrange pas.
5. **Partagez** — copiez le lien et envoyez-le ; le destinataire ouvre la même tournée, sans inscription.

## Confidentialité

Aucune donnée n'est envoyée à nos serveurs (Routora n'en a pas). Le traitement, la sauvegarde et l'optimisation se font dans votre navigateur. Routora utilise uniquement deux services tiers publics et anonymes pour fonctionner :

- **OpenStreetMap / Nominatim** — recherche d'adresses (geocoding).
- **OSRM** — calcul d'itinéraire routier.

Aucune information personnelle, aucun cookie de suivi.

## Algorithme

Routora s'appuie sur une heuristique éprouvée à deux temps :

1. **Voisin le plus proche** (nearest neighbor) pour construire une première solution.
2. **Recherche locale 2-opt** pour éliminer les croisements et améliorer la solution initiale.

Cette combinaison donne des résultats à quelques pourcents de l'optimum mathématique sur des problèmes de moins de 30 étapes, en quelques millisecondes — bien plus que ce dont une tournée terrain a besoin en pratique.

## Compatibilité

Tout navigateur moderne, sur ordinateur, tablette ou mobile.
