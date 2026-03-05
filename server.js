const express = require('express');
const cors = require('cors');
const app = express();

// 允许所有来源访问，解决 App 跨域问题
app.use(cors());
app.use(express.json());

// 内存数据库：隔离不同用户的对话
// 格式: { "用户UID": [{role: "user", content: "..."}, ...] }
let userMemory = {};

const AI_NAME = "小苒";
const MAX_HISTORY = 15; // 每个用户保留最近15条对话，防止内存溢出

// --- 接口 1: 核心对话 ---
app.post('/send', async (req, res) => {
    try {
        const { uid, text } = req.body;

        if (!uid || !text) {
            return res.status(400).json({ error: "UID and Text are required" });
        }

        // 1. 初始化用户记忆
        if (!userMemory[uid]) {
            userMemory[uid] = [
                { role: "system", content: `你是${AI_NAME}，一个贴心、幽默的AI。不要使用太多感叹号。` }
            ];
        }

        // 2. 存入用户消息
        userMemory[uid].push({ role: "user", content: text });

        // 3. 模拟 AI 逻辑 (此处建议后期对接 DeepSeek/OpenAI API)
        let aiReply = "";
        if (text.includes("谁")) {
            aiReply = `我是${AI_NAME}呀，你专属的守护灵。你的UID是 ${uid.substring(0,6)}...`;
        } else if (text.includes("自毁")) {
            delete userMemory[uid];
            aiReply = "由于你输入了禁语，我们的记忆已重置。";
        } else {
            aiReply = `听到了哦，你说“${text}”，但我现在还在云端搬家，等我配置好大脑再跟你深入聊！`;
        }

        // 4. 存入 AI 回复
        userMemory[uid].push({ role: "assistant", content: aiReply });

        // 5. 记忆长度控制
        if (userMemory[uid].length > MAX_HISTORY) {
            userMemory[uid].splice(1, 2); 
        }

        res.json({ content: aiReply, status: "success" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// --- 接口 2: 获取配置 ---
app.get('/get_all_config', (req, res) => {
    res.json({
        char: { name: AI_NAME, version: "18.5 Global" }
    });
});

// --- 静态资源: 表情包 ---
app.use('/emojis', express.static('emojis'));

// --- 启动服务 ---
// PORT 必须使用环境变量，Zeabur 会自动分配端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});