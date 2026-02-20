# PaperWithKnowTag

一个面向数学试卷的题目识别与组卷工具。  
核心目标是把上传试卷中的题目结构化后，按知识点重新组合，便于学生针对性训练。

## 当前功能

- 上传图片/PDF，提取题目并生成 LaTeX。
- 题目级编辑：题号、知识点、来源、题干内容。
- 知识点筛选 + 自由勾选题目组卷。
- 仅导出已选题目（支持按题型归类、保留原题号、样式开关）。
- 本地历史记录恢复。

## 本地运行

前置要求：Node.js 20+

1. 安装依赖
```bash
npm install
```

2. 配置 API Key 到 `.env.local`
```bash
GEMINI_API_KEY=your_key_here
```

3. 启动开发环境
```bash
npm run dev
```

4. 构建检查
```bash
npm run build
```

## 计划与变更记录

项目执行计划记录在 `PLAN.md`，维护规则如下：

- 新增计划写在最前面。
- 每条新增计划带东八区时间戳（`UTC+8`）。
- 已废弃计划保留并使用删除线。

## 下一阶段

- 多用户登录（Supabase Auth）
- Node API 服务
- PostgreSQL 持久化（结构化字段 + `jsonb`）
- 多模型 API 切换与用量统计推荐（Gemini / DeepSeek / 通义）
