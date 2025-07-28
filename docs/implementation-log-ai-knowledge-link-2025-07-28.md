# AI 知识点链接功能实现日志

**日期**: 2025-07-28

本文档记录了“AI聊天知识点链接”功能的完整开发、调试和重构过程。

## 第一阶段：初步实现 (基于技术文档)

此阶段的目标是根据初始的技术规划文档 `docs/feature-ai-knowledge-link-2025-07-26.md` 快速搭建功能原型。

1.  **数据模型扩展**:
    *   修改了 `src/types/index.ts`，新增了 `SectionLink` 接口，并将其作为可选字段 `linkedSections` 添加到 `ChatMessage` 接口中。
    *   修改了 `src/services/ai/types.ts`，在 `ChatResponse` 接口中添加了 `linkedSections` 字段。
    *   修改了 `src/store/learningStore.ts`，添加了 `updateMessageLinks` action 用于更新消息状态。

2.  **后端服务创建**:
    *   创建了 `src/services/knowledgeLinkService.ts`，该服务在实例化时使用 Node.js 的 `fs` 模块动态读取学习路径文件，并在内存中构建知识点索引。

3.  **前端组件开发**:
    *   创建了独立的 `src/components/SectionLinkTag.tsx` 组件，用于渲染单个知识点链接。
    *   修改了 `src/components/ChatMessageRenderer.tsx`，使其能够接收并渲染 `linkedSections` 数组。

4.  **初步集成**:
    *   修改了 `src/app/api/chat/route.ts` 和 `src/services/ai/providers/openai.ts`，将 `KnowledgeLinkService` 注入并在AI响应流结束后执行匹配。

---

## 第二阶段：架构修正 (Edge Runtime 兼容性修复)

在初步实现后，遇到了第一个重大障碍。

*   **问题**: 应用部署后构建失败，报错 `Module not found: Can't resolve 'fs'`。
*   **原因**: `KnowledgeLinkService` 尝试在 API 路由中使用 `fs` 模块，但该路由被部署为 Edge Function (`runtime = 'edge'`)，其环境不支持访问服务器文件系统。
*   **解决方案**: 将索引生成的逻辑从 **运行时** 转移到 **构建时**。
    1.  **创建构建脚本**: 新增 `scripts/build-knowledge-index.mjs` 脚本，用于在构建项目时扫描所有内容文件并生成一个静态的 `knowledge-index.json` 文件。
    2.  **更新构建流程**: 修改 `package.json`，添加 `prebuild` 命令，确保在 `next build` 之前自动执行索引生成脚本。
    3.  **重构服务**: 重写 `KnowledgeLinkService`，使其不再依赖 `fs`，而是直接 `import` 预先生成的 `src/lib/knowledge-index.json` 文件。

---

## 第三阶段：调试与最终修复

在解决了架构问题后，功能仍未按预期工作，我们进入了密集的调试周期。

### Bug 1: 链接仅在特定AI Provider下工作

*   **现象**: 用户反馈在使用 `deepseek` 模型时，知识点链接不出现。
*   **原因**: 经过排查，发现链接生成的逻辑被错误地耦合在了 `OpenAIProvider` 内部。当用户选择其他 Provider 时，该逻辑不会被执行。
*   **解决方案**: **逻辑解耦与上移**。
    1.  回滚了对 `OpenAIProvider` 和 `DeepSeekProvider` 的所有修改，让它们回归到只负责与各自API通信的单一职责。
    2.  将知识点链接的生成和流处理逻辑完全移至更高层的 **API 路由 (`src/app/api/chat/route.ts`)** 中。
    3.  现在，无论前端选择哪个 AI Provider，返回的文本流都会经过 API 路由中统一的“加工”流程，确保链接生成逻辑对所有 Provider 生效。

### Bug 2: 流数据解析错误

*   **现象**: 修复 Bug 1 后，出现零星的 `Failed to parse stream chunk` 错误，导致功能不稳定。
*   **原因**: 代码错误地假设了从网络流中读取的每一个数据块都包含一个完整的JSON对象。在实际网络环境中，数据块可能在任意位置被切分，导致JSON解析失败。
*   **解决方案**: **实现流处理缓冲区**。
    1.  在 `OpenAIProvider` 的流解析器 (`_createParserStream`) 中引入了一个 `buffer` 变量。
    2.  代码现在会将接收到的数据块累加到缓冲区中，然后按行 (`\n`) 分割进行处理。任何不完整的行（缓冲区的最后一部分）都会被保留，等待与下一个数据块合并后再处理。
    3.  这确保了 `JSON.parse` 只会作用于完整的JSON字符串，彻底解决了该问题。

---

## 最终状态

经过多轮的实现、重构和调试，AI知识点链接功能现已稳定运行。最终的架构健壮、解耦，并且能够可靠地处理流式数据。所有相关的调试代码均已移除，代码库保持整洁。