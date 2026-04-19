const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

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
