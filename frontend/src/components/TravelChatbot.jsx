import { useState, useRef } from "react";

export default function TravelChatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Merhaba! Sana özel bir seyahat planı hazırlamamı ister misin?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const toggleChat = () => {
    const panel = panelRef.current;
    panel.classList.toggle("h-96");
    panel.classList.toggle("h-12");
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5229/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error("Yanıt alınamadı");

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (error) {
      console.error("Chatbot API hatası:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Üzgünüm, bir hata oluştu." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 w-80 z-50">
      <div
        className="bg-indigo-700 text-white px-4 py-2 cursor-pointer font-semibold rounded-tl-xl shadow-xl flex justify-between items-center"
        onClick={toggleChat}
      >
        <span>✈️ Gezi Asistanı</span>
        <span>↕</span>
      </div>

      <div
        ref={panelRef}
        className="h-12 transition-all duration-300 overflow-hidden bg-white border-l border-t border-gray-300 rounded-tl-xl shadow-xl flex flex-col"
      >
        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-xl max-w-[75%] ${
                msg.sender === "user" ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-800 font-medium"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-gray-400 text-xs">Bot yazıyor...</div>}
        </div>

        <div className="p-2 border-t flex gap-2">
          <input
            className="flex-1 border rounded px-2 py-1 text-sm"
            placeholder="Seyahat planını yaz..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} className="bg-indigo-700 text-white px-3 py-1 rounded text-sm">
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
