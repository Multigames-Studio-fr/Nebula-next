import { NeoForgeResolver } from '../NeoForge.resolver.js'
import { MinecraftVersion } from '../../../util/MinecraftVersion.js'
import { LoggerUtil } from '../../../util/LoggerUtil.js'
import { VersionUtil } from '../../../util/VersionUtil.js'
import { Module, Type } from 'helios-distribution-types'
import { LibRepoStructure } from '../../../structure/repo/LibRepo.struct.js'
import { pathExists, remove, mkdirs, copy, writeJson } from 'fs-extra/esm'
import { lstat, readFile, writeFile } from 'fs/promises'
import { join, basename, dirname } from 'path'
import { spawn } from 'child_process'
import { JavaUtil } from '../../../util/java/JavaUtil.js'
import { VersionManifestNF } from '../../../model/neoforge/VersionManifestNF.js'
import { MavenUtil } from '../../../util/MavenUtil.js'
import { createHash } from 'crypto'
import got from 'got'

interface GeneratedFile {
    name: string
    group: string
    artifact: string
    version: string
    classifiers: string[] | [undefined]
    skipIfNotPresent?: boolean
    classpath?: boolean
}

export class NeoForgeAdapter extends NeoForgeResolver {

    private static readonly logger = LoggerUtil.getLogger('NeoForge Adapter')

    public static isForVersion(version: MinecraftVersion, libraryVersion: string): boolean {
        // NeoForge is available from Minecraft 1.20.1 onwards
        return version.isGreaterThanOrEqualTo(new MinecraftVersion('1.20.1'))
    }

    public static isExecutableJar(version: MinecraftVersion): boolean {
        // NeoForge uses executable JARs from the beginning
        return version.isGreaterThanOrEqualTo(new MinecraftVersion('1.20.1'))
    }

    private generatedFiles: GeneratedFile[] | undefined
    private wildcardsInUse: string[] | undefined

    constructor(
        absoluteRoot: string,
        relativeRoot: string,
        baseUrl: string,
        minecraftVersion: MinecraftVersion,
        neoforgeVersion: string,
        discardOutput: boolean,
        invalidateCache: boolean
    ) {
        super(absoluteRoot, relativeRoot, baseUrl, minecraftVersion, neoforgeVersion, discardOutput, invalidateCache)
    }

    public async getModule(): Promise<Module> {
        return this.getNeoForgeByVersion()
    }

    public isForVersion(version: MinecraftVersion, libraryVersion: string): boolean {
        return NeoForgeAdapter.isForVersion(version, libraryVersion)
    }

    public async getNeoForgeByVersion(): Promise<Module> {
        const libRepo = this.repoStructure.getLibRepoStruct()
        const targetLocalPath = libRepo.getLocalNeoForge(this.artifactVersion, 'universal')
        
        NeoForgeAdapter.logger.debug(`Checking for NeoForge version at ${targetLocalPath}..`)
        if(!(await pathExists(targetLocalPath))) {
            NeoForgeAdapter.logger.debug('NeoForge not found locally, initializing download..')
            
            const remoteURL = this.constructNeoForgeURL()
            await this.downloadNeoForgeJar(remoteURL, targetLocalPath)
            
        } else {
            NeoForgeAdapter.logger.debug('Using locally discovered NeoForge.')
        }
        
        NeoForgeAdapter.logger.debug(`Beginning processing of NeoForge v${this.neoforgeVersion} (Minecraft ${this.minecraftVersion})`)
        
        if(NeoForgeAdapter.isExecutableJar(this.minecraftVersion)) {
            return this.resolveExecutableJar(targetLocalPath, libRepo)
        } else {
            throw new Error('Non-executable NeoForge JARs are not supported')
        }
    }

    private constructNeoForgeURL(): string {
        // NeoForge uses Maven repository structure
        const group = 'net.neoforged'
        const artifact = 'neoforge'
        const version = this.artifactVersion
        const classifier = 'universal'
        
        return `${this.REMOTE_REPOSITORY}${group.replace(/\./g, '/')}/${artifact}/${version}/${artifact}-${version}-${classifier}.jar`
    }

    private async downloadNeoForgeJar(remoteURL: string, targetPath: string): Promise<void> {
        await mkdirs(dirname(targetPath))
        
        NeoForgeAdapter.logger.debug(`Downloading NeoForge from ${remoteURL}`)
        
        const response = await got.get({
            url: remoteURL,
            responseType: 'buffer'
        })
        
        await writeFile(targetPath, response.body)
        
        NeoForgeAdapter.logger.debug(`Downloaded NeoForge to ${targetPath}`)
    }

    private async resolveExecutableJar(targetLocalPath: string, libRepo: LibRepoStructure): Promise<Module> {
        
        const versionManifestBuf = await this.getVersionManifestFromJar(targetLocalPath)
        const versionManifest: VersionManifestNF = JSON.parse(versionManifestBuf.toString())
        
        NeoForgeAdapter.logger.debug('Retrieved version manifest from NeoForge jar')
        
        await this.writeVersionManifest(versionManifest)
        
        const libArr: Module[] = []
        
        // Process NeoForge libraries
        for(const lib of versionManifest.libraries) {
            NeoForgeAdapter.logger.debug(`Processing ${lib.name}..`)
            
            const localPath = libRepo.getArtifactById(lib.name)
            const remoteURL = lib.downloads.artifact.url
            
            if(!(await pathExists(localPath))) {
                NeoForgeAdapter.logger.debug('Not found locally, downloading..')
                await this.downloadLibrary(remoteURL, localPath, lib.downloads.artifact.sha1)
            } else {
                // Verify hash
                const localHash = await this.computeFileHash(localPath)
                if(localHash !== lib.downloads.artifact.sha1) {
                    NeoForgeAdapter.logger.debug('Hashes do not match, redownloading..')
                    await this.downloadLibrary(remoteURL, localPath, lib.downloads.artifact.sha1)
                } else {
                    NeoForgeAdapter.logger.debug('Using local copy.')
                }
            }
            
            const libModule: Module = {
                id: lib.name,
                name: lib.name,
                type: Type.Library,
                artifact: {
                    size: lib.downloads.artifact.size,
                    MD5: await this.computeFileHash(localPath, 'md5'),
                    path: lib.downloads.artifact.path,
                    url: `${this.baseUrl}/${lib.downloads.artifact.path}`
                }
            }
            
            libArr.push(libModule)
        }
        
        // Add NeoForge main JAR
        const neoforgeMainModule: Module = {
            id: `net.neoforged:neoforge:${this.artifactVersion}:universal`,
            name: `NeoForge (${this.artifactVersion})`,
            type: Type.ForgeHosted,
            artifact: {
                size: (await lstat(targetLocalPath)).size,
                MD5: await this.computeFileHash(targetLocalPath, 'md5'),
                path: `net/neoforged/neoforge/${this.artifactVersion}/neoforge-${this.artifactVersion}-universal.jar`,
                url: `${this.baseUrl}/net/neoforged/neoforge/${this.artifactVersion}/neoforge-${this.artifactVersion}-universal.jar`
            },
            subModules: libArr
        }
        
        return neoforgeMainModule
    }

    private async writeVersionManifest(versionManifest: VersionManifestNF): Promise<void> {
        const versionRepoStruct = this.repoStructure.getVersionRepoStruct()
        const versionManifestPath = versionRepoStruct.getVersionManifest(this.minecraftVersion, this.neoforgeVersion)
        
        await mkdirs(dirname(versionManifestPath))
        await writeJson(versionManifestPath, versionManifest, { spaces: 2 })
        
        NeoForgeAdapter.logger.debug(`Written version manifest to ${versionManifestPath}`)
    }

    private async downloadLibrary(url: string, localPath: string, expectedSha1: string): Promise<void> {
        await mkdirs(dirname(localPath))
        
        const response = await got.get({
            url: url,
            responseType: 'buffer'
        })
        
        await writeFile(localPath, response.body)
        
        // Verify hash
        const actualSha1 = await this.computeFileHash(localPath, 'sha1')
        if (actualSha1 !== expectedSha1) {
            await remove(localPath)
            throw new Error(`Hash mismatch for ${url}. Expected: ${expectedSha1}, Actual: ${actualSha1}`)
        }
    }

    private async computeFileHash(filePath: string, algorithm: string = 'sha1'): Promise<string> {
        const data = await readFile(filePath)
        return createHash(algorithm).update(data).digest('hex')
    }

}