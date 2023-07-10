import { Construct } from 'constructs'
import { IConfigMap, Resource, ResourceProps, k8s } from 'cdk8s-plus-26'
import { stringify } from 'yaml'
import { ApiObject, Lazy } from 'cdk8s'
import { createHash } from 'crypto'

export interface HomerConfigProps {

    // Title that is displayed on the top of the page
    title: string

    // Subtitle that is displayed right under the title
    subtitle?: string

    // Browser tab text
    documentTitle?: string

    // Logo URL, or a FontAwesome icon class name
    // For FontAwesome icon classes see: https://fontawesome.com/icons
    logo?: string

    // Set to false to hide header
    header?: boolean

    // Footer
    footer?: string

    // Assign different hotkey for search
    hotkey?: HomerHotkeyConfig

    // Number of columns to display when in column mode
    columns?: "auto" | "1" | "2" | "3" | "4" | "6" | "12"

    // Controls whether to display a message when the apps are not accessible
    // anymore (VPN disconnected for example). Set it to true when using an
    // authentication proxy, it also reloads the page when a redirection is
    // detected when checking connectivity.
    connectivityCheck?: boolean

    // Sets the default display settings for the dashboard
    defaults?: HomerDisplayConfig

    // Optional theming
    // 'default' or one of the themes available in 'src/assets/themes'
    theme?: string

    // Optional custom stylesheet
    // Will load custom CSS files. Especially useful for custom icon sets.
    stylesheets?: Array<string>

    // Optional message
    message?: HomerMessage | HomerRemoteMessage

    // Optional navbar
    links?: Array<HomerLink>

    // Services
    services?: Array<HomerGroup>
}

export interface HomerHotkeyConfig {
    // Hotkey for docusing search bar
    // Defaults to '/'
    search: string
}

export interface HomerProxyConfig {
    // send cookies & authorization headers when fetching service specific
    // data. Set to `true` if you use an authentication proxy. Can be overrided
    // on service level.
    useCredentials: boolean
}

export interface HomerDisplayConfig {
    layout: 'columns' | 'list'
    colorTheme: 'auto' | 'light' | 'dark'
}

export interface HomerMessage {
    // Message style, e.g. is-info, is-success, is-warning, is-danger
    style: string

    // FontAwesome icon class name
    icon: string

    // Title of the message
    title: string

    // Content of the message
    content: string
}

export interface HomerRemoteMessage {
    // Can fetch information from an endpoint to override value below.
    url: string

    // Allows to map fields from the remote format to the one expected by Homer
    mapping: { title: string, content: string }

    // Optional: time interval to refresh message
    refreshInterval?: number
}

export interface HomerLink {
    // Name of the link to display in navbar
    name: string

    // URL destination of the link.
    // If a hash is provided, this will link to a second homer page that will
    // load config from page2.yml and keep default config values as in config.yml
    url: string

    // Icon URL or FontAwesome icon class name
    icon?: string

    // Optionally open tab in new page
    target?: '_blank'
}

export class HomerGroup {
    // Name of the group to display in dashboard
    readonly name: string

    // FontAwesome icon class name
    icon?: string

    // A path to an image can also be provided. Note that icon take precedence
    // if both icon and logo are set.
    logo?: string

    // List of service links
    readonly items: Array<HomerService>


    constructor(name: string) {
        this.name = name
        this.items = []
    }

    public withIcon(classname: string): HomerGroup {
        this.icon = classname
        return this
    }

    public withLogo(url: string): HomerGroup {
        this.logo = url
        return this
    }

    public addService(svc: HomerService) {
        this.items.push(svc)
        return this
    }

}

export interface HomerService {
    // Name of the service to display in dashboard
    name: string

    // URL destination of the link
    url: string

    // FontAwesome icon class name
    icon?: string

    // A path to an image can also be provided. Note that icon take precedence
    // if both icon and logo are set.
    logo?: string

    // Subtitle to show below the name
    subtitle?: string

    // Tag to display on the service item
    tag?: string

    // Tag style, e.g. is-info, is-success, is-warning, is-danger
    tagStyle?: string

    // Optional keywords used for searching
    keywords?: string

    // Optionally open link in new tab
    target?: '_blank'

    // Optionally loads a specific component that provides extra features.
    // MUST MATCH a file name (without file extension) available in
    // `src/components/services`
    type?: string

    // Optional custom CSS class for card, useful with custom stylesheet
    class?: string

    // Optional color for card to set color directly without custom stylesheet
    background?: string
}

export class HomerConfig extends Resource implements IConfigMap {
    public readonly resourceType = 'configmaps'
    protected readonly apiObject: ApiObject
    private readonly config: HomerConfigProps
    private _digest?: string

    constructor(scope: Construct, id: string, props: { config: HomerConfigProps } & ResourceProps) {
        super(scope, id)
        this.apiObject = new k8s.KubeConfigMap(this, 'Resource', {
            metadata: props.metadata,
            data: Lazy.any({ produce: () => this.synthesizeData() })
        })
        this.config = props.config
    }

    public addLink(link: HomerLink): HomerConfig {
        if (!this.config.links) {
            this.config.links = []
        }
        this.config.links.push(link)
        return this
    }

    public addGroup(group: HomerGroup): HomerConfig {
        if (!this.config.services) {
            this.config.services = []
        }
        this.config.services.push(group)
        return this
    }

    public get digest(): string {
        return Lazy.any({ produce: () => {
            if (!this._digest) {
                this.synthesizeData()
            }
            return this._digest
        }})
    }

    private synthesizeData() {
        const yaml = stringify(this.config)
        this._digest = createHash('sha256')
            .update(yaml)
            .digest()
            .toString('base64')
        return { 'config.yml': yaml }
    }

}
