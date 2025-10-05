# NeoForge Support

This directory contains the implementation for NeoForge support in Nebula.

## Overview

NeoForge is a fork of Minecraft Forge that was created after Forge 1.20.1. It maintains compatibility with the Forge mod ecosystem while providing improvements and modernizations.

## Supported Versions

- Minecraft 1.20.1 and above
- NeoForge versions compatible with the supported Minecraft versions

## Files

- `VersionManifestNF.ts` - TypeScript interface for NeoForge version manifests
- `NeoForgeModsToml.ts` - Type alias for the mods.toml format (same as Forge)

## Resolver

The NeoForge resolver (`../resolver/neoforge/`) handles:
- Downloading NeoForge JARs from Maven repository
- Processing NeoForge version manifests  
- Managing NeoForge libraries and dependencies
- Security checks for beta/alpha versions

## Mod Structure

The NeoForge mod structure (`../structure/spec_model/module/neoforgemod/`) handles:
- Processing NeoForge mods.toml files
- Extracting mod metadata
- Generating Maven identifiers for mods
- Integration with Claritas for metadata extraction

## Usage

NeoForge support is automatically detected based on the Minecraft version and loader version specified. For Minecraft 1.20.1+, the system will use the NeoForge resolver and mod structure when appropriate.

## Differences from Forge

1. **Repository URL**: Uses `https://maven.neoforged.net/releases/` instead of Forge's Maven
2. **Group ID**: Uses `net.neoforged` instead of `net.minecraftforge`
3. **Versioning**: Uses simplified versioning scheme
4. **Security**: No log4j vulnerability checks needed (NeoForge was created after the fix)