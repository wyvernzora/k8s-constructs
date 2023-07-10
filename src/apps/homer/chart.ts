import { Construct } from 'constructs'
import { Chart, ChartProps, ImageProps, IngressProps } from '~/lib'
import { HomerConfig, HomerConfigProps } from './config'
import { HomerDeployment } from './deployment'
import { Ingress, IngressBackend, Service } from 'cdk8s-plus-26'

export interface HomerChartProps extends ChartProps {
    image?: {
        homer?: Partial<ImageProps>
    }

    config: HomerConfigProps
    ingress?: IngressProps
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
