# Nebula - Documentation Complète

**Nebula** est un utilitaire puissant qui génère des fichiers `distribution.json` pour [HeliosLauncher](https://github.com/dscalzi/HeliosLauncher). Cet outil vous aide à créer et gérer des distributions de serveurs Minecraft avec support pour les modloaders Forge, Fabric et NeoForge.

## 📋 Table des Matières

- [Prérequis](#prérequis)
- [Installation Rapide](#installation-rapide)
- [Configuration de l'Environnement](#configuration-de-lenvironnement)
- [Référence des Commandes](#référence-des-commandes)
- [Guide de Structure des Fichiers](#guide-de-structure-des-fichiers)
- [Exemples](#exemples)
- [Dépannage](#dépannage)

## 🔧 Prérequis

- **Node.js 20** ou supérieur
- **Java 8+** ([Télécharger depuis Adoptium](https://adoptium.net/))
  - Requis pour l'installateur Forge, le traitement des fichiers XZ et l'analyse du bytecode des mods
  - Java 16+ requis pour Minecraft 1.17+, mais l'installateur Forge fonctionne avec Java 8

## ⚡ Installation Rapide

### 1. Cloner et Installer
```bash
git clone https://github.com/dscalzi/Nebula.git
cd Nebula
npm install
```

### 2. Créer le Fichier d'Environnement
Créez un fichier `.env` dans le répertoire racine :

```properties
# Chemin vers l'exécutable Java
JAVA_EXECUTABLE=C:\Program Files\Eclipse Adoptium\jdk-17.0.12.7-hotspot\bin\java.exe

# Répertoire racine pour tous les fichiers de distribution
ROOT=D:\MaDistributionMinecraft

# URL de base où les fichiers seront hébergés
BASE_URL=https://files.monserveur.com/

# Dossier de données Helios Launcher (optionnel - pour les tests)
HELIOS_DATA_FOLDER=C:\Users\VotreNom\AppData\Roaming\Helios Launcher
```

### 3. Initialiser le Projet
```bash
npm run start -- init root
```

## 🔧 Configuration de l'Environnement

### Variables Requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `JAVA_EXECUTABLE` | Chemin complet vers l'exécutable Java | `C:\Program Files\Eclipse Adoptium\jdk-17.0.12.7-hotspot\bin\java.exe` |
| `ROOT` | Répertoire racine pour les fichiers de distribution | `D:\MaDistributionMinecraft` |
| `BASE_URL` | URL de base pour l'hébergement des fichiers | `https://files.monserveur.com/` |

### Variables Optionnelles

| Variable | Description | Exemple |
|----------|-------------|---------|
| `HELIOS_DATA_FOLDER` | Dossier de données Helios pour les tests | `C:\Users\VotreNom\AppData\Roaming\Helios Launcher` |

## 🚀 Référence des Commandes

### Comment Exécuter les Commandes

**Méthode recommandée** (compile automatiquement) :
```bash
npm run start -- <COMMANDE>
```

**Méthodes alternatives** :
```bash
# Compiler d'abord, puis exécuter
npm run build
node dist/index.js <COMMANDE>
# ou
npm run faststart -- <COMMANDE>
```

### Commandes d'Initialisation

#### `init root`
Crée la structure de fichiers de base et les schémas JSON.

```bash
npm run start -- init root
```

**Ce que ça crée :**
- `/servers/` - Répertoire pour toutes les configurations de serveur
- `/schemas/` - Schémas JSON pour la validation
- `/meta/distrometa.json` - Métadonnées de distribution
- `/modpacks/curseforge/` - Répertoire des modpacks CurseForge

### Commandes de Génération

#### `generate server <id> <version> [options]`
Crée une nouvelle configuration de serveur.

**Usage basique :**
```bash
npm run start -- generate server MonServeur 1.20.1
```

**Avec Forge :**
```bash
npm run start -- generate server MonServeur 1.20.1 --forge 47.2.20
npm run start -- generate server MonServeur 1.20.1 --forge latest
npm run start -- generate server MonServeur 1.20.1 --forge recommended
```

**Avec Fabric :**
```bash
npm run start -- generate server MonServeur 1.20.1 --fabric 0.15.11
npm run start -- generate server MonServeur 1.20.1 --fabric latest
```

**Options :**
- `--forge <version>` - Version Forge (sans la version Minecraft)
- `--fabric <version>` - Version du loader Fabric

> ⚠️ **Note :** Forge et Fabric ne peuvent pas être utilisés ensemble sur le même serveur.

#### `generate server-curseforge <id> <zipFile>`
Crée un serveur à partir d'un modpack CurseForge.

```bash
# 1. Télécharger le zip du modpack CurseForge
# 2. Le placer dans ${ROOT}/modpacks/curseforge/
# 3. Générer le serveur
npm run start -- generate server-curseforge MonModpack "Valhelsia 5-5.2.1.zip"
```

#### `generate distro [name] [options]`
Génère le fichier distribution.json final.

**Usage basique :**
```bash
npm run start -- generate distro
```

**Avec options :**
```bash
npm run start -- generate distro distribution_dev --installLocal --invalidateCache
```

**Options :**
- `--installLocal` - Installe une copie dans le dossier de données Helios pour test
- `--discardOutput` - Supprime la sortie mise en cache après utilisation (économise l'espace disque)
- `--invalidateCache` - Supprime les caches existants et régénère

#### `generate schemas`
Met à jour les schémas JSON pour la validation.

```bash
npm run start -- generate schemas
```

### Commandes Utilitaires

#### `latest-forge <version>`
Obtenir la dernière version de Forge pour une version Minecraft.

```bash
npm run start -- latest-forge 1.20.1
```

#### `recommended-forge <version>`
Obtenir la version recommandée de Forge (ou la dernière si aucune recommandée).

```bash
npm run start -- recommended-forge 1.20.1
```

## 📁 Guide de Structure des Fichiers

### Structure Racine
```
MaDistribution/
├── servers/                    # Toutes les configurations de serveur
├── schemas/                    # Schémas de validation JSON
├── meta/
│   └── distrometa.json        # Métadonnées de distribution
├── modpacks/
│   └── curseforge/            # Fichiers de modpacks CurseForge
└── distribution.json          # Fichier de distribution généré
```

### Structure de Serveur
```
servers/
└── MonServeur-1.20.1/        # Dossier serveur : {id}-{version}
    ├── files/                 # Fichiers de configuration, mondes, etc.
    ├── libraries/             # Dépendances de bibliothèques
    ├── forgemods/            # Mods Forge (si utilisation de Forge)
    │   ├── required/         # Mods requis
    │   ├── optionalon/       # Mods optionnels (activés par défaut)
    │   └── optionaloff/      # Mods optionnels (désactivés par défaut)
    ├── fabricmods/           # Mods Fabric (si utilisation de Fabric)
    │   ├── required/
    │   ├── optionalon/
    │   └── optionaloff/
    ├── MonServeur-1.20.1.png # Icône du serveur (optionnel)
    └── servermeta.json       # Métadonnées du serveur
```

### Fichiers de Métadonnées

#### `meta/distrometa.json`
Paramètres au niveau de la distribution :

```json
{
  "$schema": "file:///D:/MaDistribution/schemas/DistroMetaSchema.schema.json",
  "meta": {
    "rss": "https://monserveur.com/actualites.rss",
    "discord": {
      "clientId": "1234567890123456789",
      "smallImageText": "Joue à Minecraft",
      "smallImageKey": "minecraft_icon"
    }
  }
}
```

#### `servers/MonServeur-1.20.1/servermeta.json`
Paramètres spécifiques au serveur :

```json
{
  "$schema": "file:///D:/MaDistribution/schemas/ServerMetaSchema.schema.json",
  "meta": {
    "version": "1.0.0",
    "name": "Mon Serveur Génial (1.20.1)",
    "description": "Un serveur Minecraft incroyable avec des mods personnalisés",
    "icon": "",
    "address": "jouer.monserveur.com:25565",
    "discord": {
      "shortId": "Serveur Génial",
      "largeImageText": "Mon Serveur Génial",
      "largeImageKey": "logo_serveur"
    },
    "mainServer": true,
    "autoconnect": true
  },
  "forge": {
    "version": "47.2.20"
  },
  "untrackedFiles": [
    {
      "appliesTo": ["files"],
      "patterns": [
        "config/*.cfg",
        "config/**/*.yml",
        "logs/**/*"
      ]
    }
  ]
}
```

## 💡 Exemples

### Exemple 1 : Serveur Vanilla
```bash
# 1. Initialiser
npm run start -- init root

# 2. Créer un serveur vanilla
npm run start -- generate server ServeurVanilla 1.20.1

# 3. Ajouter vos fichiers dans servers/ServeurVanilla-1.20.1/files/
# 4. Générer la distribution
npm run start -- generate distro
```

### Exemple 2 : Serveur Forge Moddé
```bash
# 1. Initialiser
npm run start -- init root

# 2. Créer un serveur Forge
npm run start -- generate server ServeurModde 1.20.1 --forge 47.2.20

# 3. Ajouter des mods dans servers/ServeurModde-1.20.1/forgemods/required/
# 4. Ajouter des fichiers de config dans servers/ServeurModde-1.20.1/files/config/
# 5. Générer la distribution
npm run start -- generate distro
```

### Exemple 3 : Modpack CurseForge
```bash
# 1. Télécharger le zip du modpack depuis CurseForge
# 2. Le placer dans ${ROOT}/modpacks/curseforge/
# 3. Générer le serveur depuis le modpack
npm run start -- generate server-curseforge MonModpack "All the Mods 9-0.2.44.zip"

# 4. Générer la distribution
npm run start -- generate distro
```

### Exemple 4 : Distribution Multi-Serveurs
```bash
# Créer plusieurs serveurs
npm run start -- generate server Survie 1.20.1 --forge 47.2.20
npm run start -- generate server Creatif 1.20.1
npm run start -- generate server Skyblock 1.19.2 --forge 43.3.13

# Générer une seule distribution avec tous les serveurs
npm run start -- generate distro
```

## 🔧 Configuration Avancée

### Fichiers Non-Suivis
Empêcher certains fichiers d'être validés/mis à jour par le launcher :

```json
{
  "untrackedFiles": [
    {
      "appliesTo": ["files"],
      "patterns": [
        "config/config-client-seulement.cfg",
        "logs/**/*",
        "crash-reports/**/*"
      ]
    },
    {
      "appliesTo": ["forgemods"],
      "patterns": [
        "optionalon/mod-cote-client.jar"
      ]
    }
  ]
}
```

### Icônes de Serveur
Deux façons de définir les icônes de serveur :

1. **Basé sur fichier** (recommandé) : Placer `MonServeur-1.20.1.png` ou `.jpg` dans le répertoire du serveur
2. **Basé sur URL** : Définir le champ `icon` dans `servermeta.json` avec l'URL complète

### Flux de Développement
```bash
# Pour le développement/test
npm run start -- generate distro distribution_dev --installLocal

# Cela installe la distribution dans le dossier de données Helios pour test
```

## 🔍 Dépannage

### Problèmes Courants

**"JAVA_EXECUTABLE introuvable"**
- Assurez-vous que Java est installé et que le chemin est correct dans `.env`
- Utilisez des slashes normaux ou des backslashes échappés dans les chemins Windows

**Erreurs "Cannot find module"**
- Exécutez `npm install` pour vous assurer que toutes les dépendances sont installées
- Recompilez avec `npm run build`

**"Permission refusée" lors de l'exécution des commandes**
- Assurez-vous d'avoir les permissions d'écriture sur le répertoire ROOT
- Vérifiez qu'aucun fichier n'est verrouillé par d'autres applications

**L'installateur Forge échoue**
- Assurez-vous que la version Java est compatible avec la version Minecraft
- Vérifiez la connexion internet pour télécharger les fichiers Forge
- Essayez avec `--invalidateCache` pour effacer le cache corrompu

### Gestion du Cache
- Le cache est stocké dans `${ROOT}/.nebula_cache/`
- Utilisez `--invalidateCache` pour effacer le cache
- Utilisez `--discardOutput` pour ne pas mettre en cache (builds suivants plus lents)

### Obtenir de l'Aide
- Exécutez n'importe quelle commande avec `--help` pour les options détaillées
- Consultez la [documentation de distribution Helios](https://github.com/dscalzi/HeliosLauncher/blob/master/docs/distro.md)
- Rejoignez la communauté Discord pour le support

---

**Bon développement de serveur ! 🚀**