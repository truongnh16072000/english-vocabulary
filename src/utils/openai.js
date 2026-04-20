const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

export const callAIStream = async (prompt, onChunk) => {
  const url = 'https://api.openai.com/v1/chat/completions';
  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Bạn là một giáo viên tiếng Anh nhiệt tình, dễ hiểu. Trả lời bằng tiếng Việt, dùng markdown để format nội dung in đậm, in nghiêng cho đẹp mắt.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1024,
    stream: true
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      onChunk(`**Lỗi:** ${data.error?.message || "Đã có lỗi kết nối đến AI."}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // The last split element is either empty (if text ended with newline) 
      // or an incomplete piece of data. We must buffer it to process in next stream iteration.
      buffer = lines.pop() || ''; 

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const parsed = JSON.parse(line.substring(6));
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) {
              onChunk(chunk);
            }
          } catch (e) {
            // Wait for next piece
          }
        }
      }
    }
  } catch (error) {
    console.error("Network Error:", error);
    onChunk("**Lỗi:** Không thể kết nối đến máy chủ AI.");
  }
};

export const callAI = async (prompt) => {
  const url = 'https://api.openai.com/v1/chat/completions';
  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Bạn là một giáo viên tiếng Anh nhiệt tình, dễ hiểu. Trả lời bằng tiếng Việt, dùng markdown để format nội dung in đậm, in nghiêng cho đẹp mắt.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1024
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI API Error:", data);
      return `**Lỗi:** ${data.error?.message || "Đã có lỗi kết nối đến AI."}`;
    }
    return data.choices?.[0]?.message?.content || "Không có phản hồi.";
  } catch (error) {
    console.error("Network Error:", error);
    return "**Lỗi:** Không thể kết nối đến máy chủ AI.";
  }
};
