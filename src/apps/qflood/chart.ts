import { Construct } from 'constructs'
import { Chart, ChartProps } from '../../lib/chart'
import { EmptyDirMedium, Ingress, IngressBackend, PersistentVolumeAccessMode, PersistentVolumeClaim, Service, Volume } from 'cdk8s-plus-26'
import { QfloodDeployment } from './deployment'
import { ImageProps, IngressProps, RunAsProps, ScalingProps } from '~/lib'
import { Size } from 'cdk8s'

/**
 * Configuration for persisting application data
 */
export interface QfloodPersistenceProps {

    /**
     * Configuration for volume to hold configuration metadata.
     * A PVC will be created based on the storage class name supplied.
     * This volume is mounted at /config
     */
    readonly configVolume: {
        readonly storageClassName: string
        readonly storageSize: Size
    }

    /**
     * Configuration for volume to hold downloaded data.
     * This is presumed to be an NFS volume
     * This volume is mounted at /data
     */
    readonly dataVolume?: {
        readonly server: string
        readonly path: string
    }
}

export interface QfloodChartProps extends ChartProps {

    /**
     * If specified, allows overriding the container image used for this chart.
     * Container image name and tag can be overriden independently.
     */
    readonly image?: {
        readonly qflood?: Partial<ImageProps>
    }

    /**
     * If specified, allows overriding the run-as user and group.
     */
    readonly runAs?: Partial<RunAsProps>

    /**
     * Configuration for persisting application data
     */
    readonly persistence: QfloodPersistenceProps

    /**
     * Configuration for application ingress
     */
    ingress?: IngressProps
}

const DEFAULT_IMAGE: ImageProps = {
    image: 'ghcr.io/hotio/qflood',
    tag: 'release-8c5d56f',
}
const DEFAULT_RUNAS: RunAsProps = {
    puid: 1000,
    pgid: 1000,
    umask: '002',
}
const DEFAULT_SCALING = ScalingProps.singleton()

export class QfloodChart extends Chart {
    readonly deployment: QfloodDeployment
    readonly service: Service
    readonly ingress?: Ingress

    constructor(scope: Construct, id: string, props: QfloodChartProps) {
        super(scope, id, { appName: 'qflood', appVersion: '1.0.0' })

        this.deployment = new QfloodDeployment(this, 'depl', {
            image: { ...DEFAULT_IMAGE, ...props.image?.qflood },
            runAs: { ...DEFAULT_RUNAS, ...props.runAs },
            scaling: DEFAULT_SCALING,

            configVolume: this.createConfigVolume(props.persistence.configVolume),
            dataVolume: this.createDataVolume(props.persistence.dataVolume),
            ingress: props.ingress,
        })
        this.service = this.deployment.exposeViaService({
            ports: [{
                port: 3000,
                name: 'flood-http',
            }]
        })
        if (props.ingress) {
            this.ingress = new Ingress(this, 'ingress', {
                rules: [{
                    host: props.ingress.host,
                    path: props.ingress.path,
                    backend: IngressBackend.fromService(this.service),
                }]
            })
        }
    }

    private createConfigVolume(config: QfloodPersistenceProps['configVolume']): Volume {
        const pvc = new PersistentVolumeClaim(this, 'config-pvc', {
            storageClassName: config.storageClassName,
            storage: config.storageSize,
            accessModes: [PersistentVolumeAccessMode.READ_WRITE_ONCE],
        });
        return Volume.fromPersistentVolumeClaim(this, 'config-volume', pvc)
    }

    private createDataVolume(config: QfloodPersistenceProps['dataVolume']): Volume {
        const volume = Volume.fromEmptyDir(this, 'data-volume', 'data-volume', {
            medium: EmptyDirMedium.MEMORY,
        })
        if (!config) {
            return volume
        }

        // This is a workaround for cdk8s not supporting NFS volumes as of writing
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        (volume as any).config = {
            nfs: {
                server: config.server,
                path: config.path,
            }
        }
        return volume
    }

}
