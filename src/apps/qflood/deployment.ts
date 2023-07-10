import { Construct  } from "constructs";
import { Deployment, ImagePullPolicy, ResourceProps, ContainerProps, Volume, Probe } from "cdk8s-plus-26"
import { ImageProps, IngressProps, RunAsProps, ScalingProps } from "~/lib"

export interface QfloodDeploymentProps extends ResourceProps {
    image: ImageProps
    runAs: RunAsProps
    scaling: ScalingProps

    configVolume: Volume
    dataVolume: Volume

    ingress?: IngressProps
}

export class QfloodDeployment extends Deployment {

    constructor(scope: Construct, id: string, props: QfloodDeploymentProps) {
        super(scope, id, {
            metadata: props.metadata,
            replicas: props.scaling.replicas,
            strategy: props.scaling.strategy,
            spread: true,
        })
        this.addQfloodContainer(props)
    }

    private addQfloodContainer(props: QfloodDeploymentProps) {
        const baseuri = this.resolveBaseUri(props.ingress?.path)
        const container: ContainerProps = {
            name: 'qflood-app',
            image: `${props.image.image}:${props.image.tag}`,
            imagePullPolicy: ImagePullPolicy.IF_NOT_PRESENT,
            ports: [{
                number: 3000,
            }, {
                number: 8080,
            }],
            envVariables: {
                PUID: { value: props.runAs.puid.toString() },
                PGID: { value: props.runAs.pgid.toString() },
                UMASK: { value: props.runAs.umask },
                FLOOD_ARGS: { value: `--baseuri "${baseuri}"` }
            },
            volumeMounts: [{
                volume: props.configVolume,
                path: '/config',
            }, {
                volume: props.dataVolume,
                path: '/data',
            }],
            securityContext: {
                ensureNonRoot: false,
                readOnlyRootFilesystem: false,
            },
            readiness: Probe.fromHttpGet(baseuri, { port: 3000 }),
            liveness: Probe.fromHttpGet(baseuri, { port: 3000 }),
        }
        this.addContainer(container)
    }

    private resolveBaseUri(root?: string): string {
        if (!root) {
            return '/'
        }
        if (!root.endsWith('/')) {
            root = root + '/'
        }
        return root
    }
}
