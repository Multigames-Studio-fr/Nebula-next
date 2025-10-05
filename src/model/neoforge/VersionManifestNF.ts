export interface VersionManifestNF {

    id: string
    time: string
    releaseTime: string
    type: string
    mainClass: string
    inheritsFrom: string
    logging: Record<string, unknown>
    arguments: {
        game: string[]
        jvm: string[]
    }
    libraries: {
        name: string
        downloads: {
            artifact: {
                path: string
                url: string
                sha1: string
                size: number
            }
        }
        rules?: {
            action: string
            os?: {
                name: string
                arch?: string
            }
        }[]
    }[]

}