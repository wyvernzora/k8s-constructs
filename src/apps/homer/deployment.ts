import { Deployment, ImagePullPolicy, ResourceProps, Volume, Probe, VolumeMount, ContainerProps } from "cdk8s-plus-26";
import { Construct } from "constructs";
import { HomerConfig } from "./config";
import { ImageProps, ScalingProps } from "~/lib";

const DEFAULT_IMAGE: ImageProps = {
    image: 'ghcr.io/wyvernzora/homer',
    tag: 'v22.11.2',
}

export interface HomerDeploymentProps extends ResourceProps {
    config: HomerConfig
    image?: Partial<ImageProps>
    scaling?: ScalingProps
}

export class HomerDeployment extends Deployment {

    constructor(scope: Construct, id: string, props: HomerDeploymentProps) {
        const scaling = props.scaling || ScalingProps.singleton()

        super(scope, id, {
            metadata: props.metadata,
            replicas: scaling.replicas,
            strategy: scaling.strategy,
        })
        this.scheduling.spread()

        const image = ImageProps.withDefaults(DEFAULT_IMAGE, props.image)
        this.addHomerContainer(image, props.config)

        this.podMetadata.addAnnotation('config-digest', props.config.digest)
    }

    private addHomerContainer(image: ImageProps, config: HomerConfig) {
        const container: ContainerProps = {
            name: 'homer-app',
            image: ImageProps.toImageUrl(image),
            imagePullPolicy: ImagePullPolicy.IF_NOT_PRESENT,
            ports: [{
                number: 8080
            }],
            volumeMounts: [
                this.createConfigVolume(config),
            ],
            readiness: Probe.fromHttpGet('/', { port: 8080 }),
            liveness: Probe.fromHttpGet('/', { port: 8080 }),
        }
        this.addContainer(container)
    }

    private createConfigVolume(config: HomerConfig): VolumeMount {
        return {
            volume: Volume.fromConfigMap(this, 'homer-config-vl', config),
            path: '/www/assets/config.yml',
            subPath: 'config.yml',
        }
    }

}
