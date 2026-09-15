const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, history } = req.body;
        
        // Vercel 환경변수에서 API 키를 가져옵니다.
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // gemini-1.5-flash 모델 사용 (안정적이고 빠름)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 이전 대화 기록이 있다면 복원하여 챗 세션 생성
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.parts }]
        }));

        const chat = model.startChat({
            history: formattedHistory,
        });

        // 시스템 프롬프트 효과를 위해 사용자 메시지 앞에 몰래 컨텍스트 추가 (선택사항이나 여기선 단순화)
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ text });
    } catch (error) {
        console.error("Chat API Error:", error);
        return res.status(500).json({ error: 'Failed to generate response' });
    }
}
