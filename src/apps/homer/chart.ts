import { Construct } from 'constructs'
import { Chart, ChartProps, ImageProps, IngressProps, ScalingProps } from '~/lib'
import { HomerConfig, HomerConfigProps } from './config'
import { HomerDeployment } from './deployment'
import { Ingress, IngressBackend, Service } from 'cdk8s-plus-26'

/**
 * Configuration for Homer application instance
 */
export interface HomerChartProps extends ChartProps {
    /**
     * Container image overrides.
     * Leave undefined to use default version specified in the chart.
     */
    image?: {
        homer?: Partial<ImageProps>
    }
    /**
     * Configures the entry point for the application.
     * Leave undefined to create a cluster-only service.
     */
    ingress?: IngressProps
    /**
     * Homer dashboard configuration.
     */
    config: HomerConfigProps
}

const DEFAULT_IMAGE: ImageProps = {
    image: 'ghcr.io/wyvernzora/homer',
    tag: 'v22.11.2',
}

export class HomerChart extends Chart {
    readonly config: HomerConfig
    readonly deployment: HomerDeployment
    readonly service: Service
    readonly ingress?: Ingress

    constructor(scope: Construct, id: string, props: HomerChartProps) {
        super(scope, id, { appName: 'homer', appVersion: '1.0.0' })

        this.config = new HomerConfig(this, 'config', {
            config: props.config
        })
        this.deployment = new HomerDeployment(this, 'depl', {
            config: this.config,
            image: { ...DEFAULT_IMAGE, ...props.image?.homer },
            scaling: ScalingProps.rollingUpdate(2),
        })
        this.service = this.deployment.exposeViaService()

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

}
