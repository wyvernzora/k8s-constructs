<div align="center">
    <img style="width: 128px;" src="https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/homer.png" />
    <h1>Homer Dashboard</h1>
    <p>A dead simple static HOMepage for your servER to keep your services on hand, from a simple yaml configuration file.</p>
    <p>See source repository at <a href="https://github.com/bastienwirtz/homer">bastienwirtz/homer</a>.</p>
</div>

### Getting Started
```typescript
import { App } from "cdk8s"
import { HomerChart } from "@wyvernzora/k8s-constructs/homer"

const app = new App()
const homer = new HomerChart(app, "homer", {
    namespace: "homer",
    config: {
        title: "My Dashboard",
    },
    ingress: {
        host: "my.example.org"
    }
})
app.synth()
```

### Configuration
Configuration can be supplied in one of two ways:

#### 1. Via `config` property to the `HomerChart` constructor
```typescript
new HomerChart(app, "homer", {
    config: {
        title: "My Dashboard",
    },
})
```

#### 2. Via `homer.config` property of the chart itself
```typescript
const group = new HomerGroup("My Applications")
    .withIcon("fas fa-network-wired")
    .addService({
        name: "Get Started!",
        logo: "assets/dashboard-icons/png/homer.png",
        url: "https://my.example.org",
    })
homer.config.addGroup(group)
```
