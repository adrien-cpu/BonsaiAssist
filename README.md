# BonsAIcut

## 1. Présentation du projet
**Nom du projet** : BonsAIcut  
**Objectif** : Développer une application assistée par intelligence artificielle permettant aux utilisateurs de tailler et entretenir leurs bonsaïs avec précision.

## 2. Contexte et justification
L'entretien des bonsaïs demande des connaissances avancées sur la taille, l'arrosage et les soins adaptés à chaque espèce. Peu d'outils numériques existent pour accompagner efficacement les amateurs et professionnels. **BonsAIcut** vise à répondre à ce besoin en intégrant une IA capable d'analyser la structure d'un bonsaï et de proposer des actions adaptées.

## 3. Fonctionnalités principales

### 3.1. Reconnaissance et analyse des bonsaïs
- Détection automatique de l'espèce via la caméra (analyse du tronc, feuilles, etc.).
- Identification des branches à tailler en fonction des objectifs de l'utilisateur.
- Suggestions de soins selon la saison et l'état de l’arbre.

### 3.2. Assistance à la taille
- Visualisation en **3D** des actions à effectuer.
- Simulation avant/après pour évaluer l'impact des coupes.
- Suivi des tailles précédentes et recommandations pour les sessions futures.

### 3.3. Gestion de l’arrosage et des soins
- Notifications intelligentes en fonction de la météo et des besoins du bonsaï.
- Système d’apprentissage basé sur les habitudes de l’utilisateur.
- Conseils sur les engrais et traitements phytosanitaires.

### 3.4. Interaction avec l'utilisateur
- Mode apprentissage : guides interactifs pour les débutants.
- Mode expert : options avancées pour les professionnels.
- Chatbot IA pour répondre aux questions spécifiques.

### 3.5. Intégration d’une IA évolutive
- **IA exploratrice et prédictive** pour identifier de nouvelles techniques d’entretien.
- **Apprentissage collaboratif** basé sur les retours des utilisateurs.
- **Mémoire multi-générationnelle** pour adapter les conseils selon l’évolution du bonsaï.

### 3.6. Espace administrateur
- **Monitoring en temps réel** des utilisateurs actifs.
- **Visualisation et modification des IA** utilisées.
- **Statistiques sur les corrections et évolutions** des IA.
- **Veille technologique** avec validation et sandbox pour les nouvelles fonctionnalités.

## 4. Architecture technique

### 4.1. Backend
- Langage : Python (FastAPI ou Flask).
- Base de données : PostgreSQL / MongoDB.
- Stockage des modèles IA : TensorFlow / PyTorch.
- API REST pour la communication avec le frontend et l’IA.

### 4.2. Frontend
- Framework : Flutter (compatibilité Android/iOS).
- Interface intuitive avec animations et guides interactifs.

### 4.3. Infrastructure
- Hébergement Cloud (AWS, GCP ou Azure).
- Docker pour conteneurisation des services.
- Sécurité renforcée avec authentification et chiffrement des données.

## 5. Contraintes et exigences
- **Ergonomie** : Interface fluide et accessible à tous les niveaux d’utilisateurs.
- **Performance** : Réponse rapide des modèles IA.
- **Accessibilité** : Support multilingue et compatibilité avec les lecteurs d’écran.
- **Évolutivité** : Possibilité d'ajouter de nouvelles fonctionnalités IA.

## 6. Délais et planification
- **Phase 1 (1-2 mois)** : Conception de l’architecture et développement du backend.
- **Phase 2 (2-3 mois)** : Développement du frontend et intégration des IA.
- **Phase 3 (1 mois)** : Tests et optimisation.
- **Phase 4 (déploiement)** : Lancement officiel et suivi des performances.

## 7. Conclusion
**BonsAIcut** est un projet ambitieux combinant IA et expertise horticole pour offrir un outil révolutionnaire d’aide à l’entretien des bonsaïs. Ce cahier des charges servira de base pour guider le développement et assurer le succès de l’application.

## État du projet et prochaines étapes

### 1. Finalisation de la barre latérale :

*   **État actuel :** Nous avons une barre latérale fonctionnelle, mais son affichage et son comportement doivent être améliorés, et la navigation rendue plus intuitive.
*   **Points à vérifier :**
    *   Le comportement de repliement/déploiement est-il fluide et réactif ?
    *   Les éléments de la barre latérale sont-ils bien alignés et espacés ?
    *   La barre latérale est-elle accessible aux utilisateurs de lecteurs d'écran ? (attributs ARIA)
    *   Le style de la barre latérale est-il cohérent avec le reste de l'application ?
*   **Améliorations potentielles :**
    *   Ajouter des animations subtiles pour rendre les transitions plus agréables.
    *   Permettre à l'utilisateur de personnaliser l'ordre des éléments dans la barre latérale.
    *   Intégrer un système de recherche pour faciliter la navigation dans la barre latérale.

### 2. Amélioration de l'identification de l'espèce :

*   **État actuel :** L'utilisateur peut identifier l'espèce en fournissant une URL de photo ou en utilisant la caméra.
*   **Points à vérifier :**
    *   Le modèle d'IA utilisé est-il le plus performant possible pour l'identification des espèces de bonsaïs ?
    *   Le prompt Genkit est-il optimisé pour fournir les informations les plus pertinentes au modèle d'IA ?
    *   L'application gère-t-elle correctement les erreurs (par exemple, si l'URL de la photo est invalide ou si la caméra n'est pas accessible) ?
*   **Améliorations potentielles :**
    *   Intégrer une fonctionnalité de recadrage de la photo pour aider l'IA à se concentrer sur le bonsaï.
    *   Ajouter des options pour spécifier des caractéristiques du bonsaï (par exemple, type de feuilles, forme du tronc) afin d'améliorer la précision de l'identification.
    *   Permettre à l'utilisateur de sélectionner plusieurs espèces possibles si l'IA n'est pas sûre de l'identification.

### 3. Amélioration des suggestions de taille :

*   **État actuel :** L'utilisateur peut obtenir des suggestions de taille en entrant ses objectifs.
*   **Points à vérifier :**
    *   Le prompt Genkit prend-il en compte tous les facteurs pertinents pour générer des suggestions de taille (par exemple, espèce, objectifs, description du bonsaï) ?
    *   Les suggestions de taille sont-elles claires, précises et faciles à comprendre pour l'utilisateur ?
    *   L'application permet-elle à l'utilisateur de donner un feedback sur les suggestions de taille (par exemple, "utile", "inutile") afin d'améliorer le modèle d'IA ?
*   **Améliorations potentielles :**
    *   Ajouter des options pour spécifier des contraintes de taille (par exemple, "conserver la forme actuelle", "favoriser la croissance").
    *   Générer des visualisations 3D des actions de taille suggérées.
    *   Intégrer un calendrier pour planifier les sessions de taille et suivre l'évolution du bonsaï.
