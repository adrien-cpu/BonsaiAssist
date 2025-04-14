# **App Name**: BonsAI Assist

## Core Features:

- Species ID: Species Identification: Automatically identify the bonsai species using the device's camera and AI analysis. This tool will analyze the trunk, leaves, and other visual characteristics.
- Pruning Guidance: Pruning Suggestions: Based on the identified species and user's goals, the app will suggest which branches to prune. The suggestions are determined by an AI that uses reasoning to achieve the user's goals.
- 3D Preview: 3D Visualization: Provide a 3D visualization of the bonsai with highlighted areas indicating suggested cuts. This allows users to preview the impact of the pruning.
- Care Schedule: Care Reminders: Set up intelligent reminders for watering and fertilizing based on the species, local weather, and user habits.

## Style Guidelines:

- Primary color: Earthy green (#386641) to reflect nature and growth.
- Secondary color: Light beige (#F0EAD6) for a clean, natural background.
- Accent color: Terracotta (#E07A5F) for highlights and interactive elements.
- Clean, minimalist design to focus on the bonsai visualizations.
- Use of clear, botanical-inspired icons.
- Subtle transitions and animations to guide the user.

## Original User Request:
# Cahier des charges - BonsAIcut

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
  