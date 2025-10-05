# Changelog - NeoForge Support

## Added NeoForge Support

### New Features
- ✅ **NeoForge Resolver**: Added complete NeoForge resolver support in `src/resolver/neoforge/`
  - Base resolver (`NeoForge.resolver.ts`) with NeoForge-specific configuration
  - Full adapter (`adapter/NeoForge.resolver.ts`) for downloading and processing NeoForge JARs
  - Support for NeoForge Maven repository (`https://maven.neoforged.net/releases/`)
  - Version manifest processing for NeoForge

- ✅ **NeoForge Mod Structure**: Added mod processing support in `src/structure/spec_model/module/`
  - Base NeoForge mod structure (`NeoForgeMod.struct.ts`)
  - Concrete implementation (`neoforgemod/NeoForgeMod.struct.ts`)
  - Full mods.toml parsing support
  - Claritas integration for metadata extraction

- ✅ **Type Definitions**: Added necessary type definitions
  - NeoForge version manifest (`src/model/neoforge/VersionManifestNF.ts`)
  - Library type enumeration updated (`src/model/claritas/ClaritasLibraryType.ts`)
  - NeoForge mods.toml type alias (`src/model/neoforge/NeoForgeModsToml.ts`)

- ✅ **Version Registry Integration**: Updated version segmented registry
  - Added NeoForge adapter to resolver registry
  - Added NeoForge mod structure to mod registry
  - Automatic version detection for Minecraft 1.20.1+

- ✅ **Library Repository**: Extended library repository structure
  - Added NeoForge artifact methods to `LibRepoStructure`
  - Support for `net.neoforged` group artifacts

### Supported Versions
- **Minecraft**: 1.20.1 and above
- **NeoForge**: All versions compatible with supported Minecraft versions

### Technical Details
- **Repository URL**: `https://maven.neoforged.net/releases/`
- **Group ID**: `net.neoforged`
- **Artifact ID**: `neoforge`
- **File Structure**: Same mods.toml format as Forge
- **Security**: No log4j vulnerability checks (NeoForge post-dates the vulnerability)

### Files Added
```
src/
├── model/neoforge/
│   ├── VersionManifestNF.ts
│   ├── NeoForgeModsToml.ts
│   └── README.md
├── resolver/neoforge/
│   ├── NeoForge.resolver.ts
│   └── adapter/
│       └── NeoForge.resolver.ts
└── structure/spec_model/module/
    ├── NeoForgeMod.struct.ts
    └── neoforgemod/
        └── NeoForgeMod.struct.ts

examples/
└── neoforge-demo.mjs
```

### Files Modified
- `src/model/claritas/ClaritasLibraryType.ts` - Added NEOFORGE enum value
- `src/structure/repo/LibRepo.struct.ts` - Added NeoForge methods
- `src/util/VersionSegmentedRegistry.ts` - Added NeoForge support

### Usage
The NeoForge support is automatically activated when:
- Minecraft version is 1.20.1 or higher
- Appropriate NeoForge version is specified

No configuration changes needed - existing workflows will automatically use NeoForge resolvers for compatible versions.

### Migration Notes
- Existing Forge configurations for Minecraft 1.20.1+ can be updated to use NeoForge
- The same mods.toml format is supported
- Library structures remain compatible