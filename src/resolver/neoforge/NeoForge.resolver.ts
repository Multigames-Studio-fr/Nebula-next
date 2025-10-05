import StreamZip from 'node-stream-zip'
import { RepoStructure } from '../../structure/repo/Repo.struct.js'
import { BaseResolver } from '../BaseResolver.js'
import { MinecraftVersion } from '../../util/MinecraftVersion.js'
import { VersionUtil } from '../../util/VersionUtil.js'
import { LoggerUtil } from '../../util/LoggerUtil.js'

export abstract class NeoForgeResolver extends BaseResolver {

    protected readonly MOJANG_REMOTE_REPOSITORY = 'https://libraries.minecraft.net/'
    protected readonly REMOTE_REPOSITORY = 'https://maven.neoforged.net/releases/'

    protected repoStructure: RepoStructure
    protected artifactVersion: string

    constructor(
        absoluteRoot: string,
        relativeRoot: string,
        baseUrl: string,
        protected minecraftVersion: MinecraftVersion,
        protected neoforgeVersion: string,
        protected discardOutput: boolean,
        protected invalidateCache: boolean
    ) {
        super(absoluteRoot, relativeRoot, baseUrl)
        this.repoStructure = new RepoStructure(absoluteRoot, relativeRoot, 'neoforge')
        this.artifactVersion = this.inferArtifactVersion()
        this.checkSecurity()
    }

    public checkSecurity(): void {
        // NeoForge was created after the log4j vulnerability, so it should be safe
        // However, we should still check for any known vulnerabilities in the future
        const logger = LoggerUtil.getLogger('NeoForgeSecurity')
        
        // Check if this is a pre-release or beta version and warn accordingly
        if (this.neoforgeVersion.includes('beta') || this.neoforgeVersion.includes('alpha')) {
            logger.warn('==================================================================')
            logger.warn('                           WARNING                                ')
            logger.warn('   You are using a pre-release version of NeoForge.             ')
            logger.warn('  Pre-release versions may contain bugs and are not recommended  ')
            logger.warn('                    for production use.                          ')
            logger.warn('==================================================================')
        }
    }

    public inferArtifactVersion(): string {
        // NeoForge uses a different versioning scheme than Forge
        // Format: {minecraft_version}-{neoforge_version}
        return `${this.minecraftVersion}-${this.neoforgeVersion}`
    }

    protected async getVersionManifestFromJar(jarPath: string): Promise<Buffer>{
        return new Promise((resolve, reject) => {
            const zip = new StreamZip({
                file: jarPath,
                storeEntries: true
            })
            zip.on('ready', () => {
                try {
                    const data = zip.entryDataSync('version.json')
                    zip.close()
                    resolve(data)
                } catch(err) {
                    reject(err)
                }
                
            })
            zip.on('error', (err: Error) => reject(err))
        })
    }

}