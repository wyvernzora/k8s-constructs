import { Construct } from 'constructs'
import * as cdk8s from 'cdk8s'

export type ChartProps = cdk8s.ChartProps

/**
 * Application metadata used for setting identifier labels:
 *  - app.kubernetes.io/name
 *  - app.kubernetes.io/version
 */
export interface AppMetadata {
    /**
     * Value of the label app.kubernetes.io/name
     */
    readonly appName: string
    /**
     * Value of the label app.kubernetes.io/version
     */
    readonly appVersion: string
}

export class Chart extends cdk8s.Chart {

    constructor(scope: Construct, id: string, props: cdk8s.ChartProps & AppMetadata) {
        super(scope, id, {
            labels: {
                'app.kubernetes.io/name': props.appName,
                'app.kubernetes.io/version': props.appVersion,
                'app.kubernetes.io/managed-by': 'cdk8s',
                'app.kubernetes.io/instance': id,
                ...props.labels,
            }
        })
    }

}
