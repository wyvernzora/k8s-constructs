import { Construct } from "constructs";
import { Chart, ChartProps, ImageProps, IngressProps, ScalingProps, VolumeProps } from "~/lib";
import { UptimeKumaDeployment } from "./deployment";
import { EmptyDirMedium, Ingress, IngressBackend, PersistentVolumeAccessMode, PersistentVolumeClaim, Service, Volume } from "cdk8s-plus-26";

export interface UptimeKumaChartProps extends ChartProps {
    image?: {
        uptimeKuma?: Partial<ImageProps>
    }
    persistence?: {
        dataVolume?: VolumeProps
    }
    ingress?: IngressProps
}

const DEFAULT_IMAGE: ImageProps = {
    image: 'louislam/uptime-kuma',
    tag: '1',
}

export class UptimeKumaChart extends Chart {
    readonly deployment: UptimeKumaDeployment
    readonly service: Service
    readonly ingress?: Ingress

    constructor(scope: Construct, id: string, props: UptimeKumaChartProps) {
        super(scope, id, { appName: 'uptime-kuma', appVersion: '1.0.0' })

        this.deployment = new UptimeKumaDeployment(this, 'depl', {
            image: { ...DEFAULT_IMAGE, ...props.image?.uptimeKuma },
            scaling: ScalingProps.singleton(),
            dataVolume: this.createDataVolume(props?.persistence?.dataVolume),
        })
        this.service = this.deployment.exposeViaService({
            ports: [{
                port: 3001,
                name: 'http',
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

    private createDataVolume(vp?: VolumeProps): Volume {
        if (!vp) {
            return Volume.fromEmptyDir(this, 'data-vol', 'data-vol', { medium: EmptyDirMedium.MEMORY })
        }
        if (vp.kind === 'pvc') {
            const pvc = new PersistentVolumeClaim(this, 'data-pvc', {
                storageClassName: vp.storageClassName,
                storage: vp.storageSize,
                accessModes: [PersistentVolumeAccessMode.READ_WRITE_ONCE],
            })
            return Volume.fromPersistentVolumeClaim(this, 'data-vol', pvc)
        }
        throw new Error(`UptimeKuma chart does not support data volume of type ${vp.kind}`)
    }


}
