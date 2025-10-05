import StreamZip from 'node-stream-zip'
import toml from 'toml'
import { capitalize } from '../../../../util/StringUtils.js'
import { ModsToml } from '../../../../model/forge/ModsToml.js'
import { BaseNeoForgeModStructure } from '../NeoForgeMod.struct.js'
import { MinecraftVersion } from '../../../../util/MinecraftVersion.js'
import { UntrackedFilesOption } from '../../../../model/nebula/ServerMeta.js'

export class NeoForgeModStructure extends BaseNeoForgeModStructure<ModsToml> {

    constructor(
        absoluteRoot: string,
        relativeRoot: string,
        baseUrl: string,
        minecraftVersion: MinecraftVersion,
        untrackedFiles: UntrackedFilesOption[]
    ) {
        super(absoluteRoot, relativeRoot, baseUrl, minecraftVersion, untrackedFiles)
    }

    public static isForVersion(version: MinecraftVersion, libraryVersion: string): boolean {
        // NeoForge is available from Minecraft 1.20.1 onwards
        return version.isGreaterThanOrEqualTo(new MinecraftVersion('1.20.1'))
    }

    public isForVersion(version: MinecraftVersion, libraryVersion: string): boolean {
        return NeoForgeModStructure.isForVersion(version, libraryVersion)
    }

    public getLoggerName(): string {
        return 'NeoForgeModStructure'
    }

    protected async getModuleId(name: string, path: string): Promise<string> {
        const fmData = await this.getModMetadata(name, path)
        return this.generateMavenIdentifier(this.getClaritasGroup(path), fmData.mods[0].modId, fmData.mods[0].version)
    }

    protected async getModuleName(name: string, path: string): Promise<string> {
        return capitalize((await this.getModMetadata(name, path)).mods[0].displayName)
    }

    protected processZip(zip: StreamZip, name: string, path: string): ModsToml {
        // Check for OptiFine
        if (name.toLowerCase().includes('optifine')) {
            let changelogBuf: Buffer
            try {
                changelogBuf = zip.entryDataSync('changelog.txt')
            } catch(err) {
                throw new Error('Failed to read OptiFine changelog.')
            }

            const info = changelogBuf.toString().split('\n')[0].trim()
            const version = info.split(' ')[1]

            this.modMetadata[name] = ({
                modLoader: 'neoforge',
                loaderVersion: '',
                mods: [{
                    modId: 'optifine',
                    version,
                    displayName: 'OptiFine',
                    description: `OptiFine is a Minecraft optimization mod.
                    It allows Minecraft to run faster and look better with full support for shaders, HD textures and many configuration options.`
                }]
            })

            return this.modMetadata[name]
        }

        let raw: Buffer | undefined
        try {
            raw = zip.entryDataSync('META-INF/mods.toml')
        } catch(err) {
            // ignored
        }

        if (raw) {
            try {
                const parsed = toml.parse(raw.toString()) as ModsToml
                this.modMetadata[name] = parsed
            } catch (err) {
                this.logger.error(`NeoForgeMod ${name} contains an invalid mods.toml file.`)
            }
        } else {
            this.logger.error(`NeoForgeMod ${name} does not contain mods.toml file.`)
        }

        const cRes = this.claritasResult?.[path]

        if(cRes == null) {
            this.logger.error(`Claritas failed to yield metadata for NeoForgeMod ${name}!`)
            this.logger.error('Is this mod malformatted or does Claritas need an update?')
            
            // Fallback metadata
            this.modMetadata[name] = {
                modLoader: 'neoforge',
                loaderVersion: '',
                mods: [{
                    modId: this.attemptCrudeInference(name).name,
                    version: '1.0.0',
                    displayName: this.attemptCrudeInference(name).name,
                    description: 'A NeoForge mod'
                }]
            }
        } else {
            // Use claritas result if mods.toml parsing failed
            if(!this.modMetadata[name]) {
                this.modMetadata[name] = {
                    modLoader: 'neoforge',
                    loaderVersion: '',
                    mods: [{
                        modId: this.discernResult(cRes.id, this.attemptCrudeInference(name).name),
                        version: this.discernResult(cRes.version, '1.0.0'),
                        displayName: this.discernResult(cRes.name, this.attemptCrudeInference(name).name),
                        description: 'A NeoForge mod'
                    }]
                }
            }
        }

        return this.modMetadata[name]
    }

}