import { ContainerProps, Deployment, ImagePullPolicy, Probe, ResourceProps, Volume } from "cdk8s-plus-26";
import { Construct } from "constructs";
import { ImageProps, ScalingProps } from "~/lib";


export interface UptimeKumaDeploymentProps extends ResourceProps {
    image: ImageProps,
    scaling: ScalingProps,
    dataVolume: Volume,
}

export class UptimeKumaDeployment extends Deployment {

    constructor(scope: Construct, id: string, props: UptimeKumaDeploymentProps) {
        super(scope, id, {
            metadata: props.metadata,
            replicas: props.scaling.replicas,
            strategy: props.scaling.strategy,
        })
        this.scheduling.spread()
        this.addUptimeKumaContainer(props)
    }

    private addUptimeKumaContainer(props: UptimeKumaDeploymentProps) {
        const container: ContainerProps = {
            name: 'uptime-kuma-app',
            image: ImageProps.toImageUrl(props.image),
            imagePullPolicy: ImagePullPolicy.IF_NOT_PRESENT,
            ports:[{
                number: 3001,
            }],
            volumeMounts: [{
                volume: props.dataVolume,
                path: '/app/data',
            }],
            securityContext: {
                ensureNonRoot: false,
            },
            readiness: Probe.fromHttpGet('/', { port: 3001 }),
            liveness: Probe.fromHttpGet('/', { port: 3001 }),
        }
        this.addContainer(container)
    }

}
