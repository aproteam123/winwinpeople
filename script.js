document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Accordion UI Logic
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        if(!header) return;
        header.addEventListener('click', () => {
            const currentActive = document.querySelector('.accordion-item.active');
            if (currentActive && currentActive !== item) {
                currentActive.classList.remove('active');
                currentActive.querySelector('.accordion-content').style.maxHeight = null;
            }
            item.classList.toggle('active');
            const content = item.querySelector('.accordion-content');
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // 2. Smooth Scrolling for CTA Buttons
    const scrollLinks = document.querySelectorAll('.cta-scroll');
    scrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href'); 
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 40,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Tabs UI Logic (Case Study Section)
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            const targetEl = document.getElementById(targetTab);
            if(targetEl) targetEl.classList.add('active');
        });
    });

    // 4. Form Submission Handling (Fetch API to Google Apps Script)
    const joinForm = document.getElementById('joinForm');
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw6IGea1COqY32vN3hGHF622MFMC840kkS1A2lDsABw6t7U5a5Fs44mGnA1aEadD9nA/exec'; 

    if(joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = joinForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = '제출 중...';

            const formData = new FormData(joinForm);
            const payload = {
                type: 'signup',
                name: formData.get('name') || '',
                phone: formData.get('phone') || '',
                account: formData.get('account') || '',
                address: formData.get('address') || '',
                recommender: formData.get('recommender') || ''
            };

            try {
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                
                if (response.ok) {
                    alert("가입 신청이 완료되었습니다.");
                    joinForm.reset();
                } else {
                    alert("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                }
            } catch (error) {
                console.error("Error submitting form:", error);
                alert("네트워크 오류가 발생했습니다.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        });
    }

    // 5. Chatbot Global UI Logic
    const chatbotBar = document.getElementById('chatbot-bar');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotRollingText = document.getElementById('chatbot-rolling-text');
    const chatbotInputField = document.getElementById('chatbot-input-field');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotMessages = document.getElementById('chatbot-messages');

    // Chatbot rolling text data
    const placeholderTexts = [
        "규소의 효능에 대해서 궁금해요",
        "명현 현상 반응인가요?",
        "어떻게 복용하는 것이 가장 좋나요?",
        "체험 사례를 더 볼 수 있나요?",
        "가입비와 혜택이 무엇인가요?"
    ];
    let currentTextIdx = 0;
    
    if (chatbotRollingText) {
        setInterval(() => {
            chatbotRollingText.classList.add('fade');
            setTimeout(() => {
                currentTextIdx = (currentTextIdx + 1) % placeholderTexts.length;
                chatbotRollingText.innerText = placeholderTexts[currentTextIdx];
                chatbotRollingText.classList.remove('fade');
            }, 300); // 300ms for fade out
        }, 3000); // change text every 3 seconds
    }

    // Chat history (client-side state)
    let chatHistory = [];

    if (chatbotBar && chatbotWindow && chatbotClose) {
        chatbotBar.addEventListener('click', () => {
            chatbotWindow.classList.add('open');
            chatbotBar.classList.add('hidden');
        });

        chatbotClose.addEventListener('click', () => {
            chatbotWindow.classList.remove('open');
            chatbotBar.classList.remove('hidden');
            
            // 챗봇 닫을 때 구글 앱스 스크립트로 로그 전송 (비동기, 기다리지 않음)
            if (chatHistory.length > 0) {
                const logPayload = {
                    type: 'chatlog',
                    chatHistory: JSON.stringify(chatHistory)
                };
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(logPayload)
                }).catch(err => console.error("Chatlog transfer error:", err));
                
                // 전송 후 내역 초기화(옵션) - 여기선 유지
            }
        });
    }

    const appendMessage = (text, sender) => {
        if (!chatbotMessages) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        msgDiv.innerText = text;
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        
        chatHistory.push({
            role: sender === 'bot' ? 'model' : 'user',
            parts: text
        });
    };

    const handleSendMessage = async () => {
        const message = chatbotInputField.value.trim();
        if (!message) return;

        appendMessage(message, 'user');
        chatbotInputField.value = '';
        
        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = `chat-msg bot loading-msg`;
        loadingDiv.innerHTML = '<i class="fa-solid fa-ellipsis"></i> 입력 중...';
        chatbotMessages.appendChild(loadingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        try {
            // Vercel Serverless Function 호출
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: message,
                    // 마지막 사용자 입력을 제외한 이전 히스토리 전송
                    history: chatHistory.slice(0, -1) 
                })
            });

            chatbotMessages.removeChild(loadingDiv);

            if (response.ok) {
                const data = await response.json();
                appendMessage(data.text, 'bot');
            } else {
                appendMessage("죄송합니다, 잠시 오류가 발생했습니다. 나중에 다시 시도해주세요.", 'bot');
            }
        } catch (error) {
            chatbotMessages.removeChild(loadingDiv);
            appendMessage("네트워크 오류가 발생했습니다.", 'bot');
        }
    };

    if (chatbotSend && chatbotInputField) {
        chatbotSend.addEventListener('click', handleSendMessage);
        chatbotInputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSendMessage();
        });
    }

});
