# Kubernetes 基础面试题

考察候选人是否真的用过 k8s, 了解 k8s 的基本概念和基本操作。

## 什么是 k8s，它的核心概念有哪些？

Kubernetes（k8s）是一个开源平台，用于自动部署、扩展和管理容器化应用程序。它提供了一个用于部署应用程序、扩展和管理容器操作的框架。Kubernetes 引入了一系列的概念和抽象，使得容器化的部署和管理更加模块化和可扩展。下面是一些核心概念及其间的关系，并使用 TypeScript 类型来抽象这些概念。

1. **Pod**：最小的部署单元，一个 Pod 可以包含一个或多个容器。（一般是一个）
2. **Service**：将运行在多个 Pod 上的应用程序公开为网络服务的抽象方法。定义了一种访问 Pod 的方式，通常通过 label selector 来选择一组 Pod，并对外提供一个访问这些 Pod 的固定 IP 地址或 DNS 名称。
3. **Deployment**：定义了 Pod 的副本数量和更新策略，使得应用可以被声明式地更新。
4. **Namespace**：资源组隔离，提供了一种将集群资源划分为多个逻辑分区的方式。
5. **Node**：Kubernetes 中的工作节点，可以是虚拟机或物理机，Pod 运行在其上。
6. **Volume**：提供了一种存储数据的方式，可以被 Pod 中的容器使用。
7. **ConfigMap** 和 **Secret**：用于存储配置数据和敏感数据，可以被 Pod 中的容器使用。

Ingress - 一个 API 对象，提供了从集群外部到集群内服务的HTTP和HTTPS路由。

## 什么是 Pod，它的生命周期是怎样的？

Pod 是 Kubernetes 中最小的可调度和可管理的计算单元。它是运行在 Kubernetes 集群中的一个或多个容器的逻辑主机。

Pod 的生命周期可以分为以下几个阶段：

1. **Pending**：当 Kubernetes 创建 Pod 时，它首先处于 Pending 状态。在这个阶段，Kubernetes 正在调度 Pod，为其分配一个节点，并准备运行环境。
2. **Running**：一旦 Pod 被调度到节点上，并且所有容器都已被成功创建，Pod 就会进入 Running 状态。这意味着容器正在运行，但并不意味着它们已经准备好接受流量。
3. **Ready**：Pod 中的每个容器都有一个 readiness probe（就绪探针），用于检查容器是否准备好接受流量。当所有容器的就绪探针都成功时，Pod 被认为是 Ready 状态。
4. **Succeeded**：如果 Pod 中的所有容器都已成功退出（对于执行一次性任务的 Pod），并且不会重启，则 Pod 进入 Succeeded 状态。
5. **Failed**：如果 Pod 中的任何容器以失败状态退出，并且不会再重启，则 Pod 进入 Failed 状态。
6. **Unknown**：如果因为某些原因（如网络问题）无法获取 Pod 的状态，则 Pod 可能会进入 Unknown 状态。
Pod 的生命周期可能会因为多种原因而改变，例如：

- **重启策略**：Pod 的容器可能会因为配置的重启策略（如 Always、OnFailure 或 Never）而重启。
- **健康检查**：liveness probe（存活探针）用于检测容器是否仍在运行，如果探测失败，容器将被重启。
- **节点问题**：如果 Pod 运行的节点发生故障，Kubernetes 会将 Pod 重新调度到另一个健康的节点。
Pod 的设计是为了支持容器的协作部署，例如，一个 Pod 可能包含一个应用程序容器和一个日志收集容器，它们紧密协作，共享资源。Pod 的这种设计哲学使得 Kubernetes 能够提供比单一容器更高级别的抽象，以支持复杂的应用程序部署需求。

## 一个 Pod 可以运行多个不同镜像吗？

在 Kubernetes 中，一个 Pod 可以运行多个容器，每个容器可以使用不同的镜像。这种情况通常被称为多容器 Pod。

多容器 Pod 可以在一些特定的场景中很有用，例如：

1. Sidecar 模式：一个容器可以作为主要应用程序的主要组件，而另一个容器可以作为辅助组件（称为 Sidecar）来提供附加功能，如日志收集、监控、代理等。这样可以将相关的功能模块打包在同一个 Pod 中，简化应用程序的部署和管理。

2. 共享资源：多个容器可以共享相同的存储卷（Volume），从而实现数据共享和通信。这对于需要共享文件系统或共享数据的应用程序非常有用。

3. 紧密耦合的服务：某些应用程序可能需要多个紧密耦合的服务一起运行。通过将这些服务打包在同一个 Pod 中，可以确保它们在同一节点上运行，并且可以通过 localhost 进行高效的内部通信。

需要注意的是，多容器 Pod 中的容器共享相同的网络命名空间和存储卷，并且它们之间可以通过 localhost 进行通信。它们可以共享环境变量和文件系统，但是它们并不一定在同一时间启动或终止。因此，多容器 Pod 中的容器应该是相互协作的，并且它们之间应该有一定的关联性。

要创建一个多容器 Pod，只需在 Pod 的定义中指定多个容器的规格即可。每个容器的规格包括容器的名称、镜像、资源需求、环境变量等信息。Kubernetes 将负责将这些容器调度到同一个 Pod 中并管理它们的生命周期。

## 知识点补充：一个 Pod 的配置是怎样的？它如何使用和更新？

一个 Pod 的配置通常由以下几个部分组成：

1. 元数据（Metadata）：Pod 的元数据包括名称、命名空间、标签（Labels）等信息，用于唯一标识和分类 Pod。

2. 规格（Spec）：Pod 的规格定义了 Pod 中的容器、存储卷、网络设置等详细信息。它包括以下内容：

   - 容器（Containers）：定义了 Pod 中运行的一个或多个容器的规格，包括容器的名称、镜像、资源需求、环境变量、命令等。

   - 存储卷（Volumes）：定义了 Pod 中的存储卷，用于容器之间或与主机之间共享数据。

   - 网络（Networking）：定义了 Pod 的网络设置，包括网络模式、端口映射、服务发现等。

Pod 的配置可以使用 YAML 或 JSON 格式来定义。可以通过 Kubernetes API 或使用命令行工具（如 `kubectl`）来创建和管理 Pod。

要创建一个 Pod，可以将 Pod 的配置文件传递给 Kubernetes API 或使用 `kubectl create` 命令。例如，使用 YAML 格式的 Pod 配置文件 `pod.yaml`：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
    - name: container1
      image: image1:tag1
      # 其他容器配置
  volumes:
    # 存储卷配置
  # 其他规格配置
```

然后，可以使用以下命令将 Pod 创建到 Kubernetes 集群中：

```bash
kubectl create -f pod.yaml
```

更新 Pod 的配置可以通过修改 Pod 的配置文件或使用 `kubectl edit` 命令来完成。例如，使用 `kubectl edit pod my-pod` 命令来编辑名为 `my-pod` 的 Pod 的配置。

更新 Pod 的配置可能包括修改容器的镜像版本、资源需求、环境变量等。在更新配置后，Kubernetes 控制器会根据更新的配置来调整 Pod 的状态和行为。这可能涉及重新调度 Pod、重启容器等操作，具体取决于更新的内容和集群的策略。

需要注意的是，Pod 的配置是不可变的，一旦 Pod 被创建，大部分配置将无法更改。如果需要对 Pod 进行更大范围的更改，通常需要创建一个新的 Pod，并删除原有的 Pod。

## 详细示范如何用 k8s 部署一个 mongodb 集群？

在 Kubernetes (k8s) 上部署 MongoDB 集群涉及到多个步骤，包括创建配置文件、设置 StatefulSet、配置服务以及持久化存储等。以下是一个详细的步骤示例：

### 1. 安装 Kubernetes 集群

确保你已经安装了 Kubernetes 集群。可以使用 Minikube、Kind 或其他云服务提供商的 Kubernetes 服务。

### 2. 创建命名空间

为了更好地组织资源，我们可以为 MongoDB 创建一个命名空间。

```bash
kubectl create namespace mongodb
```

### 3. 创建配置文件

创建一个名为 `mongodb-config.yaml` 的文件，用于配置 MongoDB 的环境变量和持久化存储。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mongodb-config
  namespace: mongodb
data:
  MONGO_INITDB_ROOT_USERNAME: "root"
  MONGO_INITDB_ROOT_PASSWORD: "password"
```

### 4. 创建 StatefulSet

创建一个名为 `mongodb-statefulset.yaml` 的文件，用于定义 MongoDB 的 StatefulSet。

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
  namespace: mongodb
spec:
  selector:
    matchLabels:
      app: mongodb
  serviceName: mongodb
  replicas: 3
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      terminationGracePeriodSeconds: 10
      containers:
      - name: mongodb
        image: mongo:latest
        command:
        - mongod
        - "--replSet"
        - "rs0"
        - "--bind_ip"
        - "0.0.0.0"
        - "--smallfiles"
        - "--noprealloc"
        ports:
        - containerPort: 27017
        volumeMounts:
        - name: mongodb-data
          mountPath: /data/db
        - name: mongodb-config
          mountPath: /etc/mongo
        envFrom:
        - configMapRef:
            name: mongodb-config
  volumeClaimTemplates:
  - metadata:
      name: mongodb-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 1Gi
```

### 5. 创建服务

创建一个名为 `mongodb-service.yaml` 的文件，用于定义 MongoDB 的服务。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mongodb
  namespace: mongodb
spec:
  selector:
    app: mongodb
  ports:
  - port: 27017
    targetPort: 27017
  clusterIP: None
```

### 6. 应用配置

将以上创建的配置应用到 Kubernetes 集群。

```bash
kubectl apply -f mongodb-config.yaml
kubectl apply -f mongodb-statefulset.yaml
kubectl apply -f mongodb-service.yaml
```

### 7. 初始化 MongoDB 复制集

连接到其中一个 MongoDB 容器并初始化复制集。

```bash
kubectl exec -it mongodb-0 -- mongo --eval 'rs.initiate({_id: "rs0", members: [{_id: 0, host: "mongodb-0.mongodb.mongodb.svc.cluster.local:27017"}, {_id: 1, host: "mongodb-1.mongodb.mongodb.svc.cluster.local:27017"}, {_id: 2, host: "mongodb-2.mongodb.mongodb.svc.cluster.local:27017"}]})'
```

### 8. 测试 MongoDB 集群

连接到 MongoDB 并检查复制集的状态。

```bash
kubectl exec -it mongodb-0 -- mongo
rs.status()
```

这应该会显示有关 MongoDB 复制集状态的详细信息。
以上就是在 Kubernetes 上部署 MongoDB 集群的基本步骤。这只是一个简单的示例，实际部署时可能需要考虑更多的因素，例如资源限制、网络策略、监控和日志记录等。

## 如果你的 k8s mongodb 集群出现异常，你怎么排查？

当 Kubernetes 上的 MongoDB 集群出现异常时，你可以采取以下步骤进行调试：

1. **检查日志**：
   - 使用 `kubectl logs` 命令查看 MongoDB 容器的日志：

     ```bash
     kubectl logs -f <mongodb-pod-name> -c mongodb
     ```

   - 检查是否有错误信息或者异常堆栈跟踪。
2. **检查 MongoDB 容器的状态**：
   - 使用 `kubectl describe` 命令查看 MongoDB 容器的详细信息：

     ```bash
     kubectl describe pod <mongodb-pod-name>
     ```

   - 检查容器的状态、重启次数、事件等。
3. **检查复制集状态**：
   - 连接到 MongoDB 实例并检查复制集的状态：

     ```bash
     kubectl exec -it <mongodb-pod-name> -- mongo
     rs.status()
     ```

   - 确保所有成员都在线，并且没有选举正在进行。
4. **检查存储**：
   - 确认 PersistentVolumes (PVs) 和 PersistentVolumeClaims (PVCs) 是否正确绑定和挂载。
   - 检查存储是否达到容量限制或者 I/O 性能问题。
5. **检查资源限制**：
   - 查看 StatefulSet 的资源请求和限制，确保 MongoDB 容器有足够的 CPU 和内存资源。
   - 使用 `kubectl get sts` 查看 StatefulSet 的配置。
6. **网络诊断**：
   - 确认 MongoDB 容器可以相互通信，没有网络策略阻止连接。
   - 使用 `kubectl exec` 在容器之间进行 ping 测试或者使用 `telnet` 测试端口连接。
7. **性能分析**：
   - 使用 MongoDB 的性能分析工具，如 `mongostat` 和 `db.serverStatus()`，来监控数据库的性能指标。
8. **审计日志**：
   - 如果启用了审计日志，检查审计日志文件以获取更多关于异常操作的详细信息。
9. **升级和补丁**：
   - 确保你的 MongoDB 版本是最新的，或者至少打了最新的安全补丁。
10. **集群健康检查**：
    - 使用 `kubectl get cs` 检查 Kubernetes 集群组件的状态。
11. **外部工具**：
    - 使用第三方工具如 Prometheus 和 Grafana 来监控 MongoDB 集群的性能和健康状态。
12. **回滚**：
    - 如果最近有更改，考虑回滚到之前的配置或版本。
13. **社区和支持**：
    - 查看 MongoDB 社区论坛或者联系 MongoDB 官方支持获取帮助。
    - 检查 Kubernetes 社区和 GitHub 问题跟踪器，看看是否有其他人遇到了类似的问题。
调试 Kubernetes 上的 MongoDB 集群可能需要耐心和细致的分析。务必记录你所做的任何更改和观察到的结果，以便逐步排除问题。

## 你知道 k8s 的 Service 的类型有哪些吗？它们有什么区别？

Kubernetes（k8s）中的 Service 是一个抽象层，它定义了逻辑集的 Pod 和访问它们的策略。Service 有多种类型，它们的主要区别在于它们如何暴露服务以及如何路由外部流量到 Pod。以下是 Kubernetes 中常见的 Service 类型：

1. **ClusterIP**（默认类型）：
   - 这是最常见的 Service 类型，它分配一个集群内部的 IP 地址，只能在集群内部访问。从集群外部无法访问。
2. **NodePort**：
   - NodePort 类型的 Service 在集群的每个节点上打开一个端口，并将该端口上的流量重定向到对应的 Pod。这样，可以通过 `<NodeIP>:<NodePort>` 从集群外部访问服务。
3. **LoadBalancer**：
   - 当你在云环境中运行 Kubernetes 时，LoadBalancer 类型可以请求云提供商创建一个负载均衡器，将外部流量路由到集群中的 NodePort 和 Pod。
4. **ExternalName**：
   - ExternalName 类型的 Service 将服务映射到一个指定的 CNAME 记录，而不是直接路由流量。它通常用于服务发现，但不涉及任何类型的数据转发。
5. **Headless Service**：
   - 这是一种特殊类型的 Service，它不分配 ClusterIP。当你需要一个 DNS 记录来直接解析到 Pod IP 而不是 Service IP 时，可以使用它。这对于有状态应用特别有用，比如 StatefulSets。
每种 Service 类型都有其特定的用途和场景。例如，如果你需要从集群外部访问服务，则可以选择 NodePort 或 LoadBalancer 类型。如果你只需要在集群内部访问服务，则可以选择 ClusterIP 类型。而 ExternalName 和 Headless Service 通常用于特殊的服务发现需求。

## 用一个具体的例子说说你怎么使用 ETCD？

ETCD是一个分布式键值存储系统，由CoreOS团队开发，用于存储分布式系统中的关键数据，比如配置信息、服务发现、集群管理等信息。下面我将通过一个具体的例子来说明如何使用ETCD。
假设我们正在构建一个微服务架构的应用程序，其中包含多个服务，这些服务需要相互协调和发现。我们使用ETCD来存储每个服务的位置和配置信息。

**步骤1：安装和启动ETCD**
首先，需要在每个服务所在的机器上安装ETCD。安装完成后，可以启动ETCD服务。ETCD可以运行在集群模式下，以提供高可用性和数据一致性。
**步骤2：服务注册**
当服务启动时，它会将自己的位置信息注册到ETCD中。例如，一个HTTP服务可能会在ETCD中创建一个键，如下所示：

```
etcdctl put /services/http_service/instance1 "http://192.168.1.100:8080"
```

这个操作会将服务实例1的地址注册到`/services/http_service/instance1`这个键下。
**步骤3：服务发现**
当另一个服务需要访问HTTP服务时，它首先会查询ETCD来找到可用的服务实例。例如，可以使用以下命令来获取HTTP服务的地址：

```
etcdctl get /services/http_service/instance1
```

ETCD会返回存储在`/services/http_service/instance1`键下的值，即`http://192.168.1.100:8080`。
**步骤4：配置管理**
ETCD也可以用来存储和管理配置信息。例如，可以将在ETCD中创建一个键来存储数据库连接字符串：

```
etcdctl put /config/database/conn_str "Server=myServerAddress;Database=myDataBase;User Id=myUsername;Password=myPassword;"
```

然后，每个服务都可以从ETCD获取这个配置信息：

```
etcdctl get /config/database/conn_str
```

**步骤5：监控和事件通知**
ETCD提供了监控机制，允许服务订阅ETCD中的键变化事件。例如，如果一个服务想要知道`/services/http_service/`目录下的任何服务实例的添加或删除，它可以设置一个watcher：

```
etcdctl watch --prefix /services/http_service/
```

这样，每当有新的服务实例注册或者有服务实例宕机时，ETCD都会通知订阅了这个目录的服务。
通过这种方式，ETCD帮助我们在分布式系统中实现了服务发现、配置管理和集群协调的功能。

## 简述Kubernetes RC的机制?

ReplicationController (RC)用来确保容器应用的副本数始终保持在用户定义的副本数，即如果有容器异常退出，会自动创建新的pod来替代；而异常多出来的容器也会自动回收。

在新版的Kubernetes中建议使用ReplicaSet (RS)来取代ReplicationController。ReplicaSet跟ReplicationController没有本质的不同，只是名字不一样，但ReplicaSet支持集合式selector。

## 简述kube-proxy作用?

`kube-proxy`是Kubernetes集群中的关键组件之一，它在每个节点上运行，负责实现Kubernetes服务抽象的一部分。其主要作用是管理服务IP和Pod IP之间的网络连接，确保服务请求能够正确地路由到对应的Pod。
具体来说，`kube-proxy`的作用包括：

1. **服务发现**：`kube-proxy`负责监听API服务器中关于服务（Service）和端点（Endpoints）的变化。服务是一个抽象层，它定义了Pod的逻辑集合和访问这些Pod的策略。端点是指实际运行在集群中的Pod的IP地址和端口的列表。
2. **负载均衡**：当有请求到达服务IP时，`kube-proxy`负责将请求分发到后端Pod之一。它会根据服务的定义和端点的状态选择一个Pod，实现负载均衡。
3. **网络代理**：`kube-proxy`可以作为网络代理运行，支持多种代理模式，如用户空间（userspace）、iptables和IPVS（IP Virtual Server）。在不同的模式下，`kube-proxy`使用不同的方法来处理网络流量。
   - **用户空间模式**：`kube-proxy`在此模式下在用户空间监听一个端口，所有发往服务IP的流量都会被重定向到这个端口。然后，`kube-proxy`在用户空间进行负载均衡，并将流量转发到后端的Pod。

   - **iptables模式**：`kube-proxy`在此模式下通过修改iptables规则来处理流量。它为每个服务创建一系列iptables规则，这些规则直接在内核空间进行网络包的处理，因此性能更好。

   - **IPVS模式**：`kube-proxy`在此模式下使用Linux内核的IPVS模块来实现负载均衡。IPVS提供了高效的负载均衡算法，并且可以更好地处理大型集群中的网络流量。
4. **会话保持**：在某些情况下，需要确保来自同一个客户端的请求总是被路由到同一个Pod。`kube-proxy`可以配置为支持会话保持（session affinity），即使得具有相同源IP地址的请求总是被转发到同一个后端Pod。
通过这些功能，`kube-proxy`确保了Kubernetes集群内部的服务发现和负载均衡，使得Pod可以相互通信，并且外部用户可以访问到集群内的服务。

## 简述kube-proxy iptables原理?

在Kubernetes（K8s）中，**kube-proxy** 组件使用 **iptables 模式**时，其主要原理是利用 **Linux 内核的 iptables 工具**动态管理节点上的网络规则，以实现服务（Service）到后端 Pod 之间的**透明网络代理和负载均衡**。以下是 kube-proxy 在 iptables 模式下工作的大致步骤：

1. **监听 API Server**：kube-proxy 在每个集群节点上运行，并持续监听 Kubernetes API 服务器中的 Service 和 Endpoints 资源的变化。
2. **创建 NAT 规则**：当一个新的 Service 被创建或已有 Service 的 Endpoints 发生变化时，kube-proxy 会根据 Service 的定义为其生成相应的 iptables NAT 规则。

在 iptables 模式下，kube-proxy 会将请求的代理转发规则全部写入 iptables 中，从而实现服务到后端 Pod 的流量转发。这种模式在内核空间中完成，提高了转发性能。然而，需要注意 iptables 规则是基于链表实现的，随着 Service 数量的增加，规则数量线性增加，查找时间复杂度为 O(n)。当 Service 数量达到一定量级时，CPU 消耗和延迟会显著增加。为了解决 iptables 的性能问题，一些插件如 Calico 优化了 iptables 规则，使用 ipset 来保存 IP，从而提高了 IP 的查找效率（ipset 内查找的复杂度是 O(1)），减少了 iptables 的规则数量。

## 简述kube-proxy ipvs原理?

在 Kubernetes（K8s）集群中，**kube-proxy** 是一个关键组件，负责实现从 Service 到后端 Pods 的网络代理和负载均衡功能。当 kube-proxy 工作在 **IPVS 模式**时，其原理如下：

1. **监听 API 服务器**：kube-proxy 启动后会持续监听 Kubernetes API 服务器上的 Service 资源对象的变化。每当有新的 Service 创建、更新或删除时，kube-proxy 都会收到通知。
2. **IPVS 规则创建与同步**：IPVS 代理模式基于类似于 iptables 模式的 netfilter 挂钩函数，但使用哈希表作为基础数据结构，并在内核空间中工作。IPVS 会根据 Service 和 Endpoints 的定义，调用 netlink 接口创建 IPVS 规则，并定期将这些规则与 Kubernetes 服务和端点同步。这意味着，与 iptables 模式下的 kube-proxy 相比，IPVS 模式下的 kube-proxy 重定向通信的延迟更短，并且在同步代理规则时具有更好的性能。
3. **流量定向**：访问 Service 时，IPVS 将流量定向到后端 Pod 之一。IPVS 的工作原理与 iptables 模式类似，但性能更高，支持更高的网络流量吞吐量。

总之，kube-proxy 在 IPVS 模式下通过动态管理 IPVS 规则，实现了 Service 到 Pod 的透明代理和负载均衡功能。

## 简述kube-proxy ipvs和iptables的异同?

kube-proxy 在 IPVS 模式下通过动态管理 IPVS 规则，实现了 Service 到 Pod 的透明代理和负载均衡功能。IPVS 是专门设计用来做内核四层负载均衡的，使用了哈希表的数据结构，因此相比 iptables，性能更好。此外，IPVS 还支持多种负载均衡算法，如轮询、最短期望延迟、最少连接等。而 iptables 只有一种随机平等的选择算法。需要注意的是，IPVS 处理数据包的路径与通常情况下 iptables 过滤器的路径不同，因此在使用 IPVS 时需要确保与其他程序（如 Calico）协调工作。

对比而言，iptables 模式中的 kube-proxy 则在 NAT pre-routing Hook 中实现 NAT 和负载均衡功能。这种方法简单有效，但是随着集群规模的增加，kube-proxy 的性能会受到影响，因为它的用法是一种 O(n) 算法，其中的 n 随着服务和后端 Pod 的数量同步增长。因此，在特定情况下，选择 IPVS 或 iptables 取决于性能需求和集群规模。

## 简述Kubernetes创建一个Pod的主要流程?

客户端提交Pod的配置信息（可以是yaml文件定义的信息）到kube-apiserver。

Apiserver收到指令后，通知给controller-manager创建一个资源对象。

Controller-manager通过api-server将pod的配置信息存储到ETCD数据中心中。

Kube-scheduler检测到pod信息会开始调度预选，会先过滤掉不符合Pod资源配置要求的节点，然后开始调度调优，主要是挑选出更适合运行pod的节点，然后将pod的资源配置单发送到node节点上的kubelet组件上。

Kubelet根据scheduler发来的资源配置单运行pod，运行成功后，将pod的运行信息返回给scheduler，scheduler将返回的pod运行状况的信息存储到etcd数据中心。

## 简述Kubernetes中Pod的重启策略?

Pod重启策略（RestartPolicy）应用于Pod内的所有容器，并且仅在Pod所处的Node上由kubelet进行判断和重启操作。当某个容器异常退出或者健康检查失败时，kubelet将根据RestartPolicy的设置来进行相应操作。

Pod的重启策略包括Always、OnFailure和Never，默认值为Always。

Always：当容器失效时，由kubelet自动重启该容器；

OnFailure：当容器终止运行且退出码不为0时，由kubelet自动重启该容器；

Never：不论容器运行状态如何，kubelet都不会重启该容器。

同时Pod的重启策略与控制方式关联，当前可用于管理Pod的控制器包括ReplicationController、Job、DaemonSet及直接管理kubelet管理（静态Pod）。

不同控制器的重启策略限制如下：

RC和DaemonSet：必须设置为Always，需要保证该容器持续运行；

Job：OnFailure或Never，确保容器执行完成后不再重启；

kubelet：在Pod失效时重启，不论将RestartPolicy设置为何值，也不会对Pod进行健康检查。

## 简述Kubernetes中Pod的健康检查方式?

LivenessProbe探针：用于判断容器是否存活（running状态），如果LivenessProbe探针探测到容器不健康，则kubelet将杀掉该容器，并根据容器的重启策略做相应处理。若一个容器不包含LivenessProbe探针，kubelet认为该容器的LivenessProbe探针返回值用于是“Success”。

ReadineeProbe探针：用于判断容器是否启动完成（ready状态）。如果ReadinessProbe探针探测到失败，则Pod的状态将被修改。Endpoint Controller将从Service的Endpoint中删除包含该容器所在Pod的Eenpoint。

startupProbe探针：启动检查机制，应用一些启动缓慢的业务，避免业务长时间启动而被上面两类探针kill掉。

## 简述Kubernetes Pod的LivenessProbe探针的常见方式?

ExecAction：在容器内执行一个命令，若返回码为0，则表明容器健康。

TCPSocketAction：通过容器的IP地址和端口号执行TCP检查，若能建立TCP连接，则表明容器健康。

HTTPGetAction：通过容器的IP地址、端口号及路径调用HTTP Get方法，若响应的状态码大于等于200且小于400，则表明容器健康。

## 简述Kubernetes Pod的常见调度方式?

Kubernetes Pod的常见调度方式包括：

1. **手动调度**：通过定义Pod的`.spec.nodeName`字段，可以指定Pod只能运行在特定的节点上。
2. **自动调度**：如果没有为Pod指定节点，Kubernetes的调度器会自动为Pod选择一个合适的节点。调度器会考虑资源需求、硬件/软件/策略约束、亲和性与反亲和性规范、数据局部性、内部负载均衡等因素。
3. **节点亲和性（Node Affinity）**：这是一种基于规则的调度策略，它允许Pod根据节点上的特定标签来选择或排除某些节点。
4. **Pod亲和性与反亲和性（Pod Affinity and Anti-Affinity）**：这些是高级调度策略，允许根据已经在节点上运行的Pod的标签来调度Pod。亲和性用于将Pod调度到具有特定标签的Pod所在的节点上，而反亲和性则用于将Pod分散到不同节点上。
5. **污点与容忍（Taints and Tolerations）**：节点可以设置污点来拒绝特定的Pod调度到上面，除非Pod有相应的容忍度。这用于确保Pod不会调度到不适合的节点上。
6. **资源需求（Resource Requests）**：Pod可以指定它需要的CPU和内存资源量。调度器会确保只有当节点有足够的资源时，才会将Pod调度到该节点上。
7. **资源限制（Resource Limits）**：除了资源需求外，Pod还可以设置资源限制，以限制它可以使用多少资源。
8. **优先级调度（Priority Scheduling）**：通过设置Pod的优先级，可以决定Pod在资源不足时被驱逐的顺序。
这些调度方式可以单独使用，也可以组合使用，以满足不同的调度需求。

## 简述Kubernetes初始化容器（init container）?

Kubernetes初始化容器（Init Container）是一种特殊类型的容器，它在Pod中的所有应用程序容器启动之前运行。Init Container具有以下特点：

1. **执行顺序**：Init Container按顺序运行，每个容器必须成功运行完成后才能启动下一个。如果任何一个Init Container失败，Kubernetes会重新启动它，直到成功为止。
2. **资源限制**：Init Container可以设置资源请求和限制，确保它们有足够的资源来执行其任务。
3. **重启策略**：Init Container的重启策略与普通容器不同，它始终使用`Always`重启策略，直到成功为止。
4. **独立于应用程序容器**：Init Container具有与应用程序容器不同的生命周期和资源需求，它们在应用程序容器启动之前完成其任务。
5. **共享卷**：Init Container可以访问Pod的卷，包括共享卷，允许它们在启动应用程序容器之前进行文件操作或初始化。
6. **用途**：Init Container通常用于执行一些初始化任务，例如等待依赖的服务就绪、复制配置文件、创建目录、初始化数据库等。
使用Init Container的好处是可以将初始化逻辑与主应用程序容器解耦，确保应用程序容器启动时所需的资源和环境已经准备就绪。此外，Init Container可以在Pod的生命周期中多次运行，而应用程序容器则通常只启动一次。

## 简述Kubernetes deployment升级过程?

初始创建Deployment时，系统创建了一个ReplicaSet，并按用户的需求创建了对应数量的Pod副本。

当更新Deployment时，系统创建了一个新的ReplicaSet，并将其副本数量扩展，然后将旧ReplicaSet缩减。

之后，系统继续按照相同的更新策略对新旧两个ReplicaSet进行逐个调整。

最后，新的ReplicaSet运行了对应个新版本Pod副本，旧的ReplicaSet副本数量则缩减为0。

## 简述Kubernetes deployment升级策略?

在Deployment的定义中，可以通过spec.strategy指定Pod更新的策略，目前支持两种策略：Recreate（重建）和RollingUpdate（滚动更新），默认值为RollingUpdate。

Recreate：设置spec.strategy.type=Recreate，表示Deployment在更新Pod时，会先杀掉所有正在运行的Pod，然后创建新的Pod。

RollingUpdate：设置spec.strategy.type=RollingUpdate，表示Deployment会以滚动更新的方式来逐个更新Pod。同时，可以通过设置spec.strategy.rollingUpdate下的两个参数（maxUnavailable和maxSurge）来控制滚动更新的过程。

## 简述Kubernetes DaemonSet类型的资源特性?

DaemonSet资源对象会在每个Kubernetes集群中的节点上运行，并且每个节点只能运行一个pod，这是它和deployment资源对象的最大也是唯一的区别。因此，在定义yaml文件中，不支持定义replicas。

DaemonSet通常用于运行系统级别的服务，这些服务需要与集群中的每个节点交互，例如kube-proxy、fluentd、logstash等。

## 简述Kubernetes ingress?

Kubernetes的Ingress资源对象，用于将不同URL的访问请求转发到后端不同的Service，以实现HTTP层的业务路由机制。

Kubernetes使用了Ingress策略和Ingress Controller，两者结合并实现了一个完整的Ingress负载均衡器。使用Ingress进行负载分发时，Ingress Controller基于Ingress规则将客户端请求直接转发到Service对应的后端Endpoint（Pod）上，从而跳过kube-proxy的转发功能，kube-proxy不再起作用，全过程为：ingress controller + ingress 规则 ----> services。

同时当Ingress Controller提供的是对外服务，则实际上实现的是边缘路由器的功能。

## 简述Kubernetes镜像的下载策略?

Always：镜像标签为latest时，总是从指定的仓库中获取镜像。

Never：禁止从仓库中下载镜像，也就是说只能使用本地镜像。

IfNotPresent：仅当本地没有对应镜像时，才从目标仓库中下载。

默认的镜像下载策略是：当镜像标签是latest时，默认策略是Always；当镜像标签是自定义时（也就是标签不是latest），那么默认策略是IfNotPresent。

## 简述Kubernetes Scheduler作用及实现原理?

Kubernetes Scheduler的作用是将待调度的Pod（API新创建的Pod、Controller Manager为补足副本而创建的Pod等）按照特定的调度算法和调度策略绑定（Binding）到集群中某个合适的Node上，并将绑定信息写入etcd中。

Kubernetes Scheduler通过调度算法调度为待调度Pod列表中的每个Pod从Node列表中选择一个最适合的Node来实现Pod的调度。随后，目标节点上的kubelet通过API Server监听到Kubernetes Scheduler产生的Pod绑定事件，然后获取对应的Pod清单，下载Image镜像并启动容器。

## 简述Kubernetes Scheduler使用哪两种算法将Pod绑定到worker节点?

预选（Predicates）：输入是所有节点，输出是满足预选条件的节点。kube-scheduler根据预选策略过滤掉不满足策略的Nodes。如果某节点的资源不足或者不满足预选策略的条件则无法通过预选。如“Node的label必须与Pod的Selector一致”。

优选（Priorities）：输入是预选阶段筛选出的节点，优选会根据优先策略为通过预选的Nodes进行打分排名，选择得分最高的Node。例如，资源越富裕、负载越小的Node可能具有越高的排名。

## 简述Kubernetes kubelet的作用?

在Kubernetes集群中，在每个Node（又称Worker）上都会启动一个kubelet服务进程。该进程用于处理Master下发到本节点的任务，管理Pod及Pod中的容器。每个kubelet进程都会在API Server上注册节点自身的信息，定期向Master汇报节点资源的使用情况，并通过cAdvisor监控容器和节点资源。

## 简述Kubernetes kubelet监控Worker节点资源是使用什么组件来实现的?

kubelet使用cAdvisor对worker节点资源进行监控。在 Kubernetes 系统中，cAdvisor 已被默认集成到 kubelet 组件内，当 kubelet 服务启动时，它会自动启动 cAdvisor 服务，然后 cAdvisor 会实时采集所在节点的性能指标及在节点上运行的容器的性能指标。

## 简述Kubernetes Secret作用?

Secret对象，主要作用是保管私密数据，比如密码、OAuth Tokens、SSH Keys等信息。将这些私密信息放在Secret对象中比直接放在Pod或Docker Image中更安全，也更便于使用和分发。

创建完secret之后，可通过如下三种方式使用：

在创建Pod时，通过为Pod指定Service Account来自动使用该Secret。

通过挂载该Secret到Pod来使用它。

在Docker镜像下载时使用，通过指定Pod的spc.ImagePullSecrets来引用它。

## 简述Kubernetes网络模型?

Kubernetes网络模型中每个Pod都拥有一个独立的IP地址，并假定所有Pod都在一个可以直接连通的、扁平的网络空间中。所以不管它们是否运行在同一个Node（宿主机）中，都要求它们可以直接通过对方的IP进行访问。设计这个原则的原因是，用户不需要额外考虑如何建立Pod之间的连接，也不需要考虑如何将容器端口映射到主机端口等问题。

同时为每个Pod都设置一个IP地址的模型使得同一个Pod内的不同容器会共享同一个网络命名空间，也就是同一个Linux网络协议栈。这就意味着同一个Pod内的容器可以通过localhost来连接对方的端口。

在Kubernetes的集群里，IP是以Pod为单位进行分配的。一个Pod内部的所有容器共享一个网络堆栈（相当于一个网络命名空间，它们的IP地址、网络设备、配置等都是共享的）。

## 简述Kubernetes CNI模型?

CNI提供了一种应用容器的插件化网络解决方案，定义对容器网络进行操作和配置的规范，通过插件的形式对CNI接口进行实现。CNI仅关注在创建容器时分配网络资源，和在销毁容器时删除网络资源。在CNI模型中只涉及两个概念：容器和网络。

容器（Container）：是拥有独立Linux网络命名空间的环境，例如使用Docker或rkt创建的容器。容器需要拥有自己的Linux网络命名空间，这是加入网络的必要条件。

网络（Network）：表示可以互连的一组实体，这些实体拥有各自独立、唯一的IP地址，可以是容器、物理机或者其他网络设备（比如路由器）等。

对容器网络的设置和操作都通过插件（Plugin）进行具体实现，CNI插件包括两种类型：CNI Plugin和IPAM（IP Address Management）Plugin。CNI Plugin负责为容器配置网络资源，IPAM Plugin负责对容器的IP地址进行分配和管理。IPAM Plugin作为CNI Plugin的一部分，与CNI Plugin协同工作。
