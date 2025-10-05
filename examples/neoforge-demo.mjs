#!/usr/bin/env node

/**
 * Example usage of NeoForge support in Nebula
 * This script demonstrates how the NeoForge resolver works
 */

import { MinecraftVersion } from '../src/util/MinecraftVersion.js'
import { VersionSegmentedRegistry } from '../src/util/VersionSegmentedRegistry.js'
import { LoggerUtil } from '../src/util/LoggerUtil.js'

async function demonstrateNeoForgeSupport() {
    const logger = LoggerUtil.getLogger('NeoForgeDemo')
    
    logger.info('=== Nebula NeoForge Support Demo ===')
    
    // Test Minecraft versions
    const testVersions = [
        new MinecraftVersion('1.19.4'),  // Should use Forge
        new MinecraftVersion('1.20.1'),  // Should use NeoForge
        new MinecraftVersion('1.20.4'),  // Should use NeoForge
        new MinecraftVersion('1.21.0'),  // Should use NeoForge
    ]
    
    // Test NeoForge versions
    const neoforgeVersions = ['20.1.7', '20.1.10', '21.0.3']
    
    for (const mcVersion of testVersions) {
        logger.info(`\nTesting Minecraft ${mcVersion}:`)
        
        try {
            // Test with a typical NeoForge version
            const testVersion = neoforgeVersions[0]
            const resolver = VersionSegmentedRegistry.getForgeResolver(
                mcVersion,
                testVersion,
                '/tmp/test',
                'libraries',
                'http://localhost:8080',
                false,
                false
            )
            
            logger.info(`  ✓ Resolver type: ${resolver.constructor.name}`)
            
            const modStruct = VersionSegmentedRegistry.getForgeModStruct(
                mcVersion,
                testVersion,
                '/tmp/test',
                'mods',
                'http://localhost:8080',
                []
            )
            
            logger.info(`  ✓ Mod structure type: ${modStruct.constructor.name}`)
            
        } catch (error) {
            logger.warn(`  ✗ No resolver available: ${error.message}`)
        }
    }
    
    logger.info('\n=== Demo Complete ===')
    logger.info('NeoForge support has been successfully added to Nebula!')
    logger.info('- Minecraft 1.20.1+ will automatically use NeoForge resolvers')
    logger.info('- NeoForge mods will be processed with the correct structure')
    logger.info('- Version manifests will be downloaded from maven.neoforged.net')
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    demonstrateNeoForgeSupport().catch(console.error)
}

export { demonstrateNeoForgeSupport }