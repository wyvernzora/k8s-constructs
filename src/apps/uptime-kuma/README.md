<div align="center">
    <img style="width: 128px;" src="https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/uptime-kuma.png" />
    <h1>Uptime Kuma</h1>
    <p>Uptime Kuma is an easy-to-use self-hosted monitoring tool.</p>
    <p>See source repository at <a href="https://github.com/louislam/uptime-kuma">louislam/uptime-kuma</a>.</p>
</div>

### Getting Started
```typescript
import { App, Size } from "cdk8s"
import { UptimeKumaChart } from "@wyvernzora/k8s-constructs/uptime-kuma"

const app = new App()
const uptimeKuma = new UptimeKumaChart(app, "uptime-kuma", {
    persistence: {
        dataVolume: {
            kind: "pvc",
            storageClassName: "ceph",
            storageSize: Size.gibibytes(4),
        },
    },
    ingress: {
        host: "status.example.org",
    }
})
```

### Configuration

#### Container image
Container image and/or tag can be overriden using the `image` property:
```typescript
new UptimeKumaChart(app, "uptime-kuma", {
    image: {
        uptimeKuma: {
            tag: "2",
        }
    },
    ...props,
})
```

#### Persistence
If not specified, the chart uses an in-memory temporary directory.  
Chart expects a volume description to persist configuration and data:
```typescript
new UptimeKumaChart(app, "uptime-kuma", {
    persistence: {
        dataVolume: {
            kind: "pvc",
            storageClassName: "ceph",
            storageSize: Size.gibibytes(4),
        },
    },
    ...props,
})
```
