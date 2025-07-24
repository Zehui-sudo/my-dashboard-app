# 环境变量配置

在使用真实的AI API之前，您需要在环境变量中配置相应的API密钥。

## 支持的AI服务

1. **DeepSeek**
   - 获取API密钥: https://platform.deepseek.com/
   - 环境变量: `DEEPSEEK_API_KEY`

2. **Qwen (通义千问)**
   - 获取API密钥: https://dashscope.console.aliyun.com/
   - 环境变量: `QWEN_API_KEY`

3. **Doubao (豆包)**
   - 获取API密钥: https://www.doubao.com/
   - 环境变量: `DOUBAO_API_KEY`

## 配置方法

### 开发环境

在项目根目录创建 `.env.local` 文件:

```
DEEPSEEK_API_KEY=your_deepseek_api_key_here
QWEN_API_KEY=your_qwen_api_key_here
DOUBAO_API_KEY=your_doubao_api_key_here
```

### 生产环境

根据您的部署平台设置环境变量。例如：

- Vercel: 在项目设置的Environment Variables中添加
- Netlify: 在站点设置的Build & deploy - Environment中添加
- 其他平台: 请参考相应平台的文档

注意：不要将API密钥提交到代码仓库中。