const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const callGeminiAPI = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    system_instruction: { parts: [{ text: "Bạn là một giáo viên tiếng Anh nhiệt tình, dễ hiểu. Trả lời bằng tiếng Việt, dùng markdown để format nội dung in đậm, in nghiêng cho đẹp mắt." }] }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return `**Lỗi:** ${data.error?.message || "Đã có lỗi kết nối đến AI."}`;
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi.";
  } catch (error) {
    console.error("Network Error:", error);
    return "**Lỗi:** Không thể kết nối đến máy chủ AI.";
  }
};
