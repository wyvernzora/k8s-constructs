import { Size } from "cdk8s"


/**
 * Configuration for volume backed by an NFS share
 */
export interface NfsVolumeProps {
    readonly kind: 'nfs'
    readonly server: string
    readonly path: string
}

/**
 * Configuration for volume backed by a PersistentVolumeClaim
 */
export interface PvcVolumeProps {
    readonly kind: 'pvc'
    readonly storageClassName: string
    readonly storageSize: Size
}

export type VolumeProps =
    NfsVolumeProps |
    PvcVolumeProps
