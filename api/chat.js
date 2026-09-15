import OpenAI from 'openai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, history } = req.body;
        
        // Vercel 환경변수에서 OpenAI API 키를 가져옵니다.
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // 프론트엔드의 history 형식을 OpenAI 형식으로 변환
        const messages = [];
        
        // 시스템 프롬프트 (챗봇 역할 부여)
        messages.push({
            role: 'system',
            content: '당신은 WinWinPeople의 규소펩타이드 ART-10 제품을 안내하는 전문 AI 상담사입니다. 친절하고 신뢰감 있는 어조로 답변해주세요.'
        });

        // 이전 대화 기록 추가
        if (history && history.length > 0) {
            history.forEach(msg => {
                // 프론트에서 보낸 role(user/model)을 OpenAI role(user/assistant)로 변환
                messages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.parts || ''
                });
            });
        }

        // 현재 사용자 메시지 추가
        messages.push({
            role: 'user',
            content: message
        });

        // gpt-4o-mini 모델 호출
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
        });

        const text = completion.choices[0].message.content;

        // 프론트엔드가 기대하는 포맷({ text: ... })으로 응답
        return res.status(200).json({ text });
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return res.status(500).json({ error: 'Failed to generate response' });
    }
}
