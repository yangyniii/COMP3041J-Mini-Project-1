# Campus Buzz

Campus Buzz 是一个混合云 Mini-project，演示前端提交、工作流服务、数据持久化、以及 Serverless 事件处理的基础集成。

该项目目标是构建一个简单且可复现的“事件提交 -> 工作流记录 -> 事件触发 -> 处理函数 -> 结果回填”流程。项目不涉及复杂登录、权限系统或高端 UI 美化，适合快速验证系统架构和服务编排。

## 项目结构

```
campus-buzz/
├── docker-compose.yml
├── README.md
├── requirements.txt
├── services/
│   ├── data-service/
│   │   ├── api.py
│   │   ├── database.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── workflow/
│   │   ├── main.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── presentation/
│       ├── Dockerfile
│       ├── package.json
│       ├── index.html
│       └── src/app.js
└── functions/
    ├── submission-event/
    │   ├── index.js
    │   └── Dockerfile
    ├── processor/
    │   ├── logic.py
    │   ├── app.py
    │   └── Dockerfile
    └── result-update/
        ├── updater.py
        ├── app.py
        └── Dockerfile
```

## 核心功能说明

- `services/data-service`：负责存储事件记录，提供 REST 接口创建、读取和更新记录。
- `services/workflow`：负责接收前端提交、创建待处理记录，并模拟触发 Submission Event Function。
- `services/presentation`：提供一个最简前端页面，用于输入事件提交表单。
- `functions/processor`：实现 Serverless Processing Function 逻辑，按照优先级顺序判断状态、类别和优先级。
- `functions/submission-event` / `functions/result-update`：保留 Serverless 函数模拟入口和回调接口。

## 先决条件

- Git
- Python 3.11+（建议 3.11 或 3.12）
- Node.js 18+（如果要运行前端静态页面）
- 可选：Docker / Docker Compose（用于容器化，但本 README 重点提供本地复现方式）

## 本地复现步骤

### 1. 克隆仓库

```bash
git clone <your-github-repo-url>
cd campus-buzz
```

### 2. 创建 Python 虚拟环境并安装依赖

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. 启动 Data Service

```bash
cd services/data-service
python api.py
```

默认监听：`http://127.0.0.1:5002`

### 4. 启动 Workflow Service

打开一个新终端窗口，激活虚拟环境后执行：

```bash
cd /Users/yangyani/Desktop/campus-buzz/services/workflow
source /Users/yangyani/Desktop/campus-buzz/.venv/bin/activate
python main.py
```

默认监听：`http://127.0.0.1:5001`

### 5. 测试提交流程

使用 `curl` 向 Workflow Service 发送事件提交：

```bash
curl -X POST http://127.0.0.1:5001/api/submit \
  -H "Content-Type: application/json" \
  -d '{"title": "Campus Talk", "description": "A great event to learn more about opportunities and networking.", "location": "Main Hall", "date": "2026-05-12", "organiser": "Student Union"}'
```

成功后你会收到一个 `id`，表示 Data Service 已创建该记录。

### 6. 验证数据存储

```bash
curl http://127.0.0.1:5002/records/<id>
```

将 `<id>` 替换为上一步返回的记录 ID。

## 服务接口说明

### Data Service

- `GET /`：服务信息
- `POST /records`：创建记录，必需字段：`title`, `description`, `location`, `date`, `organiser`
- `GET /records`：查询所有记录
- `GET /records/<id>`：查询单条记录
- `PATCH /records/<id>`：更新记录的 `status`, `category`, `priority`, `note`

### Workflow Service

- `GET /`：服务信息
- `POST /api/submit`：接收前端事件提交，创建 `PENDING` 记录并调用 `Submission Event Function`

## Processing Function 规则说明

`functions/processor/logic.py` 实现了以下规则：

1. 完整性检查：若缺少任意字段，返回 `INCOMPLETE`。
2. 日期校验：若格式不是 `YYYY-MM-DD`，返回 `NEEDS REVISION`。
3. 描述长度：若描述少于 40 字符，返回 `NEEDS REVISION`。
4. 类别分配：优先关键字规则 `OPPORTUNITY > ACADEMIC > SOCIAL > GENERAL`。
5. 优先级分配：`OPPORTUNITY` => `HIGH`，`ACADEMIC` => `MEDIUM`，其余 => `NORMAL`。

该逻辑已确保 `INCOMPLETE` 优先级最高，并在缺失字段时直接返回结果，不继续后续规则判断。

## Docker Compose 说明

仓库提供了 `docker-compose.yml`，用于稍后容器化三个主要服务：

- `presentation`
- `workflow-service`
- `data-service`

当前文件也预留了 Serverless 回调 URL 环境变量 `SUBMISSION_EVENT_URL` 和 `RESULT_UPDATE_URL`，方便后续扩展到函数模拟容器。

> 注意：当前本地复现更稳妥，容器化版本仍需根据实际环境检查 `services/presentation` 前端构建是否完整。

## 如何把代码上传到 GitHub

以下步骤假设你已经在 GitHub 上创建了一个空仓库，例如 `https://github.com/<your-username>/campus-buzz.git`。

1. 检查当前仓库状态：

```bash
git status
```

2. 添加所有文件：

```bash
git add .
```

3. 提交改动：

```bash
git commit -m "Initial Campus Buzz mini-project implementation"
```

4. 添加远程仓库（如果还未添加）：

```bash
git remote add origin https://github.com/<your-username>/campus-buzz.git
```

5. 推送到 GitHub：

```bash
git push -u origin main
```

如果你的主分支叫 `master`，请改成：

```bash
git push -u origin master
```

## 其他建议

- 如果你还希望让前端页面可直接访问，可考虑补充 `services/presentation` 的 `package.json`、`Dockerfile` 和静态内容。
- 若要完整模拟 Serverless 函数，可继续补全 `functions/submission-event`、`functions/processor`、`functions/result-update` 的容器入口。
- 当前项目不需要复杂验证，请保持重点在流程集成和服务编排。

## 常见问题

- `Q: 为什么要先启动 Data Service？`
  - 因为 Workflow Service 会向 Data Service 创建记录，若 Data Service 不在线，提交请求会失败。

- `Q: 是否必须使用 Docker？`
  - 不必须。README 中提供的本地 Python 运行方式是最快、最容易复现的。

- `Q: 如何检查 Workflow 是否调用了数据服务？`
  - 提交后调用 `GET /records/<id>`，如果能返回记录数据，则说明已成功创建。

