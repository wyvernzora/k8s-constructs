<div align="center">
    <img style="width: 128px;" src="https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/flood.png" />
    <h1>qBittorrent + Flood</h1>
    <p>A docker image with qBittorrent and the Flood UI, also optional WireGuard VPN support.</p>
    <p>See source repository at <a href="https://github.com/hotio/qflood">hotio/qflood</a>.</p>
</div>

### Getting Started
```typescript
import { App, Size } from "cdk8s"
import { QfloodChart } from "@wyvernzora/k8s-constructs/qflood"

const app = new App()
const homer = new HomerChart(app, "homer", {
    persistence: {
        configVolume: {
            kind: 'pvc',
            storageClassName: 'ceph',
            storageSize: Size.gibibytes(1),
        }
    }
})
app.synth()
```

### Configuration

#### Image version
You can override image version using the `image` property of the chart props.  
Do note, however, that any version newer than the default will be broken due to a qBittorrent change.

#### UID, GID and UMASK
If not specified, qflood runs with UID `1000`, GID `1000` and UMASK `0002`.  
Process UID, GID and UMASK can be configured via `runAs` property:
```typescript
new HomerChart(app, "homer", {
    runAs: {
        puid: 1001,
        guid: 1001,
        umask: '0002',
    },
    ...props,
})
```

#### Persisting config
The chart expects a description of PVC volume to persist qBittorrent and Flood configuration.
```typescript
new HomerChart(app, "homer", {
    persistence: {
        configVolume: {
            kind: "pvc",
            storageClassName: "ceph",
            storageSize: Size.gibibytes(1),
        }
    },
    ...props,
})
```

#### Data volume
The chart can optionally accept an NFS volume description to mount at `/data` within the container.  
This volume is intended for storing downloaded data.
```typescript
new HomerChart(app, "homer", {
    persistence: {
        dataVolume: {
            kind: "nfs",
            server: "192.168.1.1",
            path: "/mnt/data",
        },
        ...volumes,
    },
    ...props,
})
```
