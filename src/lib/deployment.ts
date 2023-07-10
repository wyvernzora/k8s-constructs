import { DeploymentStrategy, DeploymentStrategyRollingUpdateOptions } from "cdk8s-plus-26"
export type RollingUpdateOptions = DeploymentStrategyRollingUpdateOptions

/**
 * ImageProps contains information identifying a container image.
 * The information is split between image and tag so that they can be
 * independently overriden.
 */
export interface ImageProps {
    image: string
    tag: string
}

export namespace ImageProps {
    export function withDefaults(
            defaults: ImageProps,
            props?: Partial<ImageProps>): ImageProps {
        return {
            ...defaults,
            ...props,
        }
    }

    export function toImageUrl(props: ImageProps): string {
        return `${props.image}:${props.tag}`
    }
}


/**
 * Configuration for containers that support running as a specific user
 */
export interface RunAsProps {
    readonly puid: number
    readonly pgid: number
    readonly umask: string
}

export namespace RunAsProps {
    export function withDefaults(
        defaults: RunAsProps,
        props?: Partial<RunAsProps>): RunAsProps {

        return {
            ...defaults,
            ...props,
        }
    }
}

/**
 * Common options related to scaling of workloads.
 */
export class ScalingProps {
    readonly replicas: number
    readonly strategy: DeploymentStrategy

    private constructor(replicas: number, strategy: DeploymentStrategy) {
        this.replicas = replicas
        this.strategy = strategy
    }

    static singleton(): ScalingProps {
        return {
            replicas: 1,
            strategy: DeploymentStrategy.recreate(),
        }
    }

    static rollingUpdate(replicas: number, options?: RollingUpdateOptions): ScalingProps {
        if (replicas < 1) {
            throw new Error('replica count nust be greater than zero')
        }
        return {
            replicas,
            strategy: DeploymentStrategy.rollingUpdate(options)
        }
    }

}
