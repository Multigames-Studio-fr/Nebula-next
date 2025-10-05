# Nebula - Complete Documentation

**Nebula** is a powerful utility that generates `distribution.json` files for [HeliosLauncher](https://github.com/dscalzi/HeliosLauncher). This tool helps you create and manage Minecraft server distributions with support for Forge, Fabric, and NeoForge modloaders.

## 📋 Table of Contents

- [Requirements](#requirements)
- [Quick Setup](#quick-setup)
- [Environment Configuration](#environment-configuration)
- [Commands Reference](#commands-reference)
- [File Structure Guide](#file-structure-guide)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## 🔧 Requirements

- **Node.js 20** or higher
- **Java 8+** ([Download from Adoptium](https://adoptium.net/))
  - Required for Forge installer, XZ file processing, and mod bytecode analysis
  - Java 16+ required for Minecraft 1.17+, but Forge installer works with Java 8

## ⚡ Quick Setup

### 1. Clone and Install
```bash
git clone https://github.com/dscalzi/Nebula.git
cd Nebula
npm install
```

### 2. Create Environment File
Create a `.env` file in the root directory:

```properties
# Java executable path
JAVA_EXECUTABLE=C:\Program Files\Eclipse Adoptium\jdk-17.0.12.7-hotspot\bin\java.exe

# Root directory for all distribution files
ROOT=D:\MyMinecraftDistribution

# Base URL where files will be hosted
BASE_URL=https://files.myserver.com/

# Helios Launcher data folder (optional - for testing)
HELIOS_DATA_FOLDER=C:\Users\YourUsername\AppData\Roaming\Helios Launcher
```

### 3. Initialize Project
```bash
npm run start -- init root
```

## 🔧 Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JAVA_EXECUTABLE` | Full path to Java executable | `C:\Program Files\Eclipse Adoptium\jdk-17.0.12.7-hotspot\bin\java.exe` |
| `ROOT` | Root directory for distribution files | `D:\MyMinecraftDistribution` |
| `BASE_URL` | Base URL for file hosting | `https://files.myserver.com/` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `HELIOS_DATA_FOLDER` | Helios data folder for testing | `C:\Users\YourUsername\AppData\Roaming\Helios Launcher` |

## 🚀 Commands Reference

### How to Run Commands

**Recommended method** (auto-compiles):
```bash
npm run start -- <COMMAND>
```

**Alternative methods**:
```bash
# Build first, then run
npm run build
node dist/index.js <COMMAND>
# or
npm run faststart -- <COMMAND>
```

### Init Commands

#### `init root`
Creates the basic file structure and JSON schemas.

```bash
npm run start -- init root
```

**What it creates:**
- `/servers/` - Directory for all server configurations
- `/schemas/` - JSON schemas for validation
- `/meta/distrometa.json` - Distribution metadata
- `/modpacks/curseforge/` - CurseForge modpack directory

### Generate Commands

#### `generate server <id> <version> [options]`
Creates a new server configuration.

**Basic usage:**
```bash
npm run start -- generate server MyServer 1.20.1
```

**With Forge:**
```bash
npm run start -- generate server MyServer 1.20.1 --forge 47.2.20
npm run start -- generate server MyServer 1.20.1 --forge latest
npm run start -- generate server MyServer 1.20.1 --forge recommended
```

**With Fabric:**
```bash
npm run start -- generate server MyServer 1.20.1 --fabric 0.15.11
npm run start -- generate server MyServer 1.20.1 --fabric latest
```

**Options:**
- `--forge <version>` - Forge version (without Minecraft version)
- `--fabric <version>` - Fabric loader version

> ⚠️ **Note:** Forge and Fabric cannot be used together on the same server.

#### `generate server-curseforge <id> <zipFile>`
Creates a server from a CurseForge modpack.

```bash
# 1. Download CurseForge modpack zip
# 2. Place it in ${ROOT}/modpacks/curseforge/
# 3. Generate server
npm run start -- generate server-curseforge MyModpackServer "Valhelsia 5-5.2.1.zip"
```

#### `generate distro [name] [options]`
Generates the final distribution.json file.

**Basic usage:**
```bash
npm run start -- generate distro
```

**With options:**
```bash
npm run start -- generate distro distribution_dev --installLocal --invalidateCache
```

**Options:**
- `--installLocal` - Install copy to Helios data folder for testing
- `--discardOutput` - Delete cached output after use (saves disk space)
- `--invalidateCache` - Delete existing caches and regenerate

#### `generate schemas`
Updates JSON schemas for validation.

```bash
npm run start -- generate schemas
```

### Utility Commands

#### `latest-forge <version>`
Get the latest Forge version for Minecraft version.

```bash
npm run start -- latest-forge 1.20.1
```

#### `recommended-forge <version>`
Get the recommended Forge version (or latest if no recommended).

```bash
npm run start -- recommended-forge 1.20.1
```

## 📁 File Structure Guide

### Root Structure
```
MyDistribution/
├── servers/                    # All server configurations
├── schemas/                    # JSON validation schemas
├── meta/
│   └── distrometa.json        # Distribution metadata
├── modpacks/
│   └── curseforge/            # CurseForge modpack files
└── distribution.json          # Generated distribution file
```

### Server Structure
```
servers/
└── MyServer-1.20.1/          # Server folder: {id}-{version}
    ├── files/                 # Configuration files, worlds, etc.
    ├── libraries/             # Library dependencies
    ├── forgemods/            # Forge mods (if using Forge)
    │   ├── required/         # Required mods
    │   ├── optionalon/       # Optional mods (enabled by default)
    │   └── optionaloff/      # Optional mods (disabled by default)
    ├── fabricmods/           # Fabric mods (if using Fabric)
    │   ├── required/
    │   ├── optionalon/
    │   └── optionaloff/
    ├── MyServer-1.20.1.png   # Server icon (optional)
    └── servermeta.json       # Server metadata
```

### Metadata Files

#### `meta/distrometa.json`
Distribution-level settings:

```json
{
  "$schema": "file:///D:/MyDistribution/schemas/DistroMetaSchema.schema.json",
  "meta": {
    "rss": "https://myserver.com/news.rss",
    "discord": {
      "clientId": "1234567890123456789",
      "smallImageText": "Playing Minecraft",
      "smallImageKey": "minecraft_icon"
    }
  }
}
```

#### `servers/MyServer-1.20.1/servermeta.json`
Server-specific settings:

```json
{
  "$schema": "file:///D:/MyDistribution/schemas/ServerMetaSchema.schema.json",
  "meta": {
    "version": "1.0.0",
    "name": "My Awesome Server (1.20.1)",
    "description": "An amazing Minecraft server with custom mods",
    "icon": "",
    "address": "play.myserver.com:25565",
    "discord": {
      "shortId": "Awesome Server",
      "largeImageText": "My Awesome Server",
      "largeImageKey": "server_logo"
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

## 💡 Examples

### Example 1: Vanilla Server
```bash
# 1. Initialize
npm run start -- init root

# 2. Create vanilla server
npm run start -- generate server VanillaServer 1.20.1

# 3. Add your files to servers/VanillaServer-1.20.1/files/
# 4. Generate distribution
npm run start -- generate distro
```

### Example 2: Forge Modded Server
```bash
# 1. Initialize
npm run start -- init root

# 2. Create Forge server
npm run start -- generate server ModdedServer 1.20.1 --forge 47.2.20

# 3. Add mods to servers/ModdedServer-1.20.1/forgemods/required/
# 4. Add config files to servers/ModdedServer-1.20.1/files/config/
# 5. Generate distribution
npm run start -- generate distro
```

### Example 3: CurseForge Modpack
```bash
# 1. Download modpack zip from CurseForge
# 2. Place in ${ROOT}/modpacks/curseforge/
# 3. Generate server from modpack
npm run start -- generate server-curseforge MyModpack "All the Mods 9-0.2.44.zip"

# 4. Generate distribution
npm run start -- generate distro
```

### Example 4: Multiple Servers Distribution
```bash
# Create multiple servers
npm run start -- generate server Survival 1.20.1 --forge 47.2.20
npm run start -- generate server Creative 1.20.1
npm run start -- generate server Skyblock 1.19.2 --forge 43.3.13

# Generate single distribution with all servers
npm run start -- generate distro
```

## 🔧 Advanced Configuration

### Untracked Files
Prevent certain files from being validated/updated by the launcher:

```json
{
  "untrackedFiles": [
    {
      "appliesTo": ["files"],
      "patterns": [
        "config/client-only-config.cfg",
        "logs/**/*",
        "crash-reports/**/*"
      ]
    },
    {
      "appliesTo": ["forgemods"],
      "patterns": [
        "optionalon/client-side-mod.jar"
      ]
    }
  ]
}
```

### Server Icons
Two ways to set server icons:

1. **File-based** (recommended): Place `MyServer-1.20.1.png` or `.jpg` in server directory
2. **URL-based**: Set `icon` field in `servermeta.json` to full URL

### Development Workflow
```bash
# For development/testing
npm run start -- generate distro distribution_dev --installLocal

# This installs the distribution to Helios data folder for testing
```

## 🔍 Troubleshooting

### Common Issues

**"JAVA_EXECUTABLE not found"**
- Ensure Java is installed and path is correct in `.env`
- Use forward slashes or escaped backslashes in Windows paths

**"Cannot find module" errors**
- Run `npm install` to ensure all dependencies are installed
- Rebuild with `npm run build`

**"Permission denied" when running commands**
- Ensure you have write permissions to the ROOT directory
- Check that no files are locked by other applications

**Forge installer fails**
- Ensure Java version is compatible with Minecraft version
- Check internet connection for downloading Forge files
- Try with `--invalidateCache` to clear corrupted cache

### Cache Management
- Cache is stored in `${ROOT}/.nebula_cache/`
- Use `--invalidateCache` to clear cache
- Use `--discardOutput` to not cache (slower subsequent builds)

### Getting Help
- Run any command with `--help` for detailed options
- Check the [Helios distribution documentation](https://github.com/dscalzi/HeliosLauncher/blob/master/docs/distro.md)
- Join the Discord community for support

---

**Happy server building! 🚀**