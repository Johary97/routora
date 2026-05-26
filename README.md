# Routora

Planificateur d'itinéraires multi-étapes côté navigateur. Construit une séquence d'arrêts, calcule un ordre de visite court, et trace l'itinéraire routier réel sur la carte.

## Fonctionnalités

- Ajout d'étapes par recherche d'adresse (Nominatim) ou clic sur la carte.
- Réordonnancement manuel par glisser-déposer.
- Optimisation automatique de l'ordre (nearest neighbor + 2-opt).
- Tracé routier via OSRM, avec distance et durée. Fallback ligne droite si OSRM est indisponible.
- Option « retour au départ » pour fermer la boucle.
- Sauvegarde locale (localStorage) — pas de compte, pas de serveur.
- Partage par lien : l'itinéraire est encodé dans le hash de l'URL.

## Démarrage

```bash
npm install
npm run dev      # serveur de développement
npm run build    # build de production (dossier dist/)
npm run preview  # prévisualiser le build
```

Puis `http://localhost:5173`.

## Utilisation

1. Définissez le point de départ (recherche d'adresse ou clic). Il apparaît en vert avec une étoile.
2. Ajoutez les étapes suivantes.
3. « Optimiser l'ordre » réorganise les étapes et affiche le gain en pourcentage.
4. Ajustez manuellement : glisser-déposer dans le panneau, déplacement des marqueurs, suppression.
5. « Partager » copie un lien qui restaure la tournée à l'ouverture.

## Services tiers

- **Nominatim** (OpenStreetMap) — géocodage et géocodage inverse.
- **OSRM** (`router.project-osrm.org`) — calcul d'itinéraire routier.

Aucune autre donnée ne quitte le navigateur. Pas de cookie de suivi.

## Algorithme

Heuristique en deux temps :

1. **Voisin le plus proche** depuis le point de départ pour une solution initiale.
2. **Recherche locale 2-opt** : inversions de sous-séquences tant que la distance totale baisse.

Distances calculées en grand cercle (Haversine). Sur moins de 30 étapes, le résultat est généralement à quelques pourcents de l'optimum, en quelques millisecondes.

## Stack

Vue 3, Vite, Leaflet, vuedraggable. CSS pur, pas d'i18n.
