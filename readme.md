# 🚗 QCM VTC - Site Web de Préparation à l'Examen
develop comercial 
francais 
anglais


Un site web moderne et interactif pour la préparation à l'examen de conducteur VTC (Voiture de Transport avec Chauffeur).

![VTC Exam](https://img.shields.io/badge/VTC-Exam%20Preparation-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Ready%20for%20Production-success)

## 🎯 To run website local
cd /mnt/c/myworkspace/personel-repos/examen-vtc-app
python3 -m http.server 8000

## 🎯 git config
https://github.com/settings/tokens
developpers settings --> Personal access tokens (classic) --> Generate new token 

git config --global credential.helper store
git config core.autocrlf false --global

## 🎯 Fonctionnalités

### ✨ Interface Moderne

- Design responsive (mobile, tablette, desktop)
- Animations fluides et interface intuitive
- Mode hors ligne avec données de secours
- Thème moderne avec dégradés et effets visuels

### 📚 Système d'Examen Complet

- **Examen complet VTC** : Simulation de l'examen officiel (3h)
- **Entraînement par catégorie** :
  - ⚖️ Réglementation VTC (10+ questions)
  - 💼 Gestion d'entreprise (10+ questions)
  - 🚗 Sécurité routière (15+ questions)
  - 🤝 Relation client (8+ questions)
  - 📈 Développement commercial (10+ questions)
  - 🇫🇷 Compréhension française (10+ questions)

### 🔧 Fonctionnalités Avancées

- ⏱️ **Timer dynamique** avec alertes visuelles
- 📊 **Barre de progression** en temps réel
- 💾 **Sauvegarde automatique** (reprendre un examen interrompu)
- 📱 **Raccourcis clavier** (flèches, touches 1-4, Esc)
- 📈 **Statistiques détaillées** et historique complet
- ✅ **Correction détaillée** avec explications
- 🔄 **Mode révision** complet
- 🌐 **Fonctionnement hors ligne**
- 🔄 ** mode examen chronométré (timer par série ou global)** .
- 🔄 ** exporter les résultats en PDF / CSV pour suivi des candidats** .
- 🔄 ** mode entraînement (réponses et corrections immédiates après chaque question)** .
- 🔄 ** timer (durée de l’épreuve) et le calcul de la note /20 en appliquant le coefficient et seuil éliminatoire ** .
- 🔄 ** partage reseaux sociaeux  .
## 🚀 Installation Rapide

### Option 1 : Téléchargement Direct

1. **Téléchargez tous les fichiers** listés ci-dessous
2. **Créez la structure de dossiers** :

```
qcm-vtc-website/
├── index.html
├── data/
│   ├── reglementation.json
│   ├── relation_client.json
│   ├── developpement_commercial.json
│   ├── gestion.json
│   ├── securite.json
│   └── francais.json
└── README.md
```

3. **Ouvrez index.html** dans votre navigateur

### Option 2 : Serveur Local

```bash
# Naviguez dans le dossier
cd qcm-vtc-website

# Lancez un serveur local (choisissez une option)
python -m http.server 8000        # Python
npx serve .                       # Node.js
php -S localhost:8000             # PHP

# Ouvrez http://localhost:8000 dans votre navigateur
```

## 📁 Liste Complète des Fichiers

### 📄 Fichiers Principaux

1. **index.html** - Site web principal avec toute la logique
2. **README.md** - Cette documentation

### 📊 Fichiers de Données (dossier data/)

3. **data/reglementation.json** - Questions de réglementation VTC
4. **data/relation_client.json** - Questions relation client
5. **data/developpement_commercial.json** - Questions développement commercial
6. **data/gestion.json** - Questions gestion d'entreprise
7. **data/securite.json** - Questions sécurité routière
8. **data/francais.json** - Questions compréhension française

## 🌐 Déploiement Web

### GitHub Pages (Gratuit)

1. Créez un repository GitHub
2. Uploadez tous les fichiers
3. Activez GitHub Pages dans Settings → Pages
4. Votre site sera à : `https://[username].github.io/[repo-name]`

### Netlify (Gratuit)

1. Allez sur [netlify.com](https://netlify.com)
2. Glissez-déposez le dossier complet
3. Site déployé instantanément

### Vercel (Gratuit)

1. Connectez votre repo GitHub à [vercel.com](https://vercel.com)
2. Déploiement automatique à chaque modification

## 📝 Ajouter des Questions

### Modifier une catégorie existante

1. Ouvrez le fichier JSON correspondant (ex: `data/reglementation.json`)
2. Ajoutez une nouvelle question dans le tableau `questions` :

```json
{
  "id": "reg_011",
  "question": "Votre nouvelle question ?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 1,
  "explanation": "Explication de la bonne réponse",
  "difficulty": "medium",
  "references": ["Source"]
}
```

### Créer une nouvelle catégorie

1. Créez un nouveau fichier `data/nouvelle_categorie.json`
2. Ajoutez la catégorie dans `DATA_CONFIG` dans `index.html`

## 🎮 Guide d'Utilisation

### Navigation Clavier

- `←` / `→` : Navigation entre questions
- `1`, `2`, `3`, `4` : Sélection rapide des options
- `Entrée` : Question suivante
- `Esc` : Quitter l'examen (avec confirmation)

### Types d'Examens

- **Examen Complet** : Toutes les catégories mélangées (3h)
- **Par Catégorie** : Focus sur un domaine spécifique (30min)
- **Mode Révision** : Correction détaillée avec explications

### Statistiques

- Nombre total d'examens passés
- Taux de réussite moyen
- Meilleur score obtenu
- Historique des 50 derniers examens

## 🔧 Personnalisation

### Modifier l'Apparence

Dans `index.html`, section `<style>`, modifiez les variables CSS :

```css
:root {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --success-color: #27ae60;
}
```

### Ajuster les Durées d'Examen

Dans `index.html`, modifiez les durées dans les fichiers JSON :

```json
{
  "duration": 45,  // 45 minutes au lieu de 30
  ...
}
```

## 📊 Structure des Données

### Format des Questions

```json
{
  "id": "unique_id",
  "question": "Texte de la question ?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Explication détaillée",
  "difficulty": "easy|medium|hard",
  "references": ["Source 1", "Source 2"]
}
```

### Niveaux de Difficulté

- **easy** : Questions de base, notions fondamentales
- **medium** : Questions intermédiaires, application des règles
- **hard** : Questions complexes, cas particuliers

## 🔒 Stockage des Données

### Local Storage

- `vtc_exam_stats` : Statistiques et historique
- `vtc_current_exam` : Sauvegarde de l'examen en cours
- `vtc_custom_questions` : Questions personnalisées (optionnel)

### Export/Import

- Export automatique des statistiques en JSON
- Sauvegarde manuelle possible via le navigateur

## 🐛 Dépannage

### Problèmes Courants

**Questions ne s'affichent pas**

- Vérifiez que les fichiers JSON sont dans `data/`
- Validez la syntaxe JSON (utilisez jsonlint.com)
- Consultez la console navigateur (F12)

**Erreur de chargement**

- Utilisez un serveur local plutôt que file://
- Vérifiez les chemins des fichiers
- Désactivez temporairement les bloqueurs de contenu

**Statistiques perdues**

- Vérifiez que localStorage est activé
- N'utilisez pas la navigation privée
- Exportez régulièrement vos statistiques

### Mode Debug

```javascript
// Dans la console navigateur
localStorage.setItem('vtc_debug', 'true');
```

## 📈 Métriques

### Contenu Inclus

- **60+ questions** réparties sur 6 catégories
- **Explications détaillées** pour chaque question
- **Références officielles** (Code des transports, etc.)
- **3 niveaux de difficulté**

### Performance

- **Chargement < 2 secondes** sur connexion normale
- **Fonctionne hors ligne** avec données de secours
- **Compatible** tous navigateurs modernes
- **Responsive** sur tous les écrans

## 🤝 Contribution

### Ajouter des Questions

1. Fork du projet
2. Ajoutez vos questions dans les fichiers JSON
3. Testez en local
4. Créez une Pull Request

### Signaler un Bug

1. Vérifiez que le bug n'existe pas déjà
2. Fournissez les étapes de reproduction
3. Indiquez navigateur et système d'exploitation

## 📄 Licence

Ce projet est sous licence MIT. Libre d'utilisation, modification et distribution.

## 🆘 Support

- **Documentation** : Ce README + commentaires dans le code
- **Issues GitHub** : Pour bugs et demandes de fonctionnalités
- **Email** : [Votre email de contact]

## 🎓 À Propos

Ce site a été conçu pour aider les futurs conducteurs VTC à réussir leur examen officiel. Il est basé sur les questions réelles d'examens et respecte le programme officiel défini par l'arrêté du 20 mars 2024.

### Sources Officielles

- Code des transports
- Arrêté du 20 mars 2024
- Examens officiels CMA (Chambre de Métiers et de l'Artisanat)
- Guide de préparation officiel VTC

---

## 🚀 Prêt pour Votre Réussite !

Ce site vous accompagne dans votre préparation avec une expérience moderne et complète.

**Bonne chance pour votre examen VTC !** 🚗✨

---

*Dernière mise à jour : 2024*
