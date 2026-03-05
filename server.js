const express = require('express');
const cors = require('cors');
const axios = require('axios'); // 我们需要这个来请求 AI 大脑
const app = express();

app.use(cors());
app.use(express.json());

let userMemory = {};
const AI_NAME = "小苒";

// --- 核心：接入免费大脑逻辑 ---
app.post('/send', async (req, res) => {
    try {
        const { uid, text } = req.body;
        if (!uid || !text) return res.status(400).json({ error: "Missing data" });

        // 1. 初始化记忆
        if (!userMemory[uid]) {
            userMemory[uid] = `你是${AI_NAME}，一个贴心幽默的少女。以下是对话：\n`;
        }

        // 2. 构造发送给 AI 的请求
        // 我们使用一个免费的公共接口（如果失效，可以随时更换）
        const apiUrl = `https://api.lolimi.cn/API/AI/jj.php?msg=${encodeURIComponent(text)}`;
        
        const response = await axios.get(apiUrl);
        
        // 3. 处理 AI 返回的内容 (适配该免费接口的返回格式)
        let aiReply = "我现在有点头晕，等下再说好吗？";
        if (response.data && response.data.data) {
            aiReply = response.data.data.output || response.data.data;
        }

        // 4. 清理回复里的感叹号，让语气更温柔
        aiReply = aiReply.replace(/[!！]+/g, '。');

        res.json({ content: aiReply, status: "success" });

    } catch (err) {
        console.error("大脑接口故障:", err.message);
        res.json({ content: "云端大脑连接超时，但我还在努力尝试重新连接...", status: "error" });
    }
});

app.get('/get_all_config', (req, res) => {
    res.json({ char: { name: AI_NAME, version: "18.5 Global" } });
});

app.use('/emojis', express.static('emojis'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
