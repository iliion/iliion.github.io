
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Icon } from './Icon';
import { useGeolocation } from '../hooks/useGeolocation';

// Types based on Gemini API response for Grounding
interface ReviewSnippet {
  content: string;
  author: string;
  sourceUri: string;
}

interface PlaceAnswerSource {
  reviewSnippets?: ReviewSnippet[];
}

interface MapsChunk {
  title: string;
  uri: string;
  placeAnswerSources?: PlaceAnswerSource;
}

interface GroundingChunk {
  maps?: MapsChunk;
  web?: {
      title: string;
      uri: string;
  };
}

interface Message {
  role: 'user' | 'model';
  text: string;
  chunks?: GroundingChunk[];
}

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
      role: 'model',
      text: 'Hi! I\'m your local guide for Greece. I can help you find the best tavernas, ancient sites, and hidden beaches. Try asking: "Where can I find the best seafood in Santorini?"'
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { location } = useGeolocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      // Strictly use process.env.API_KEY as required by guidelines
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
          throw new Error("API_KEY not found in environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });

      const config: any = {
        tools: [{ googleMaps: {} }],
        systemInstruction: "You are a knowledgeable and enthusiastic local guide for Greece. Provide helpful, concise recommendations for places, restaurants, and activities. When you suggest specific places, the system will automatically show map cards. Do not generate markdown links for addresses, rely on the grounding tool."
      };

      // Include user location for better relevance if available
      if (location) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userText,
        config: config
      });

      const text = response.text;
      // Safely extract grounding chunks
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;

      setMessages(prev => [...prev, { role: 'model', text: text || "Here is what I found:", chunks }]);
    } catch (err: any) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { role: 'model', text: "I apologize, but I'm having trouble connecting to the service right now. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
        {/* Floating Toggle Button */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="fixed bottom-6 right-6 bg-greek-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-greek-blue-700 transition-all duration-300 z-50 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-greek-blue-300"
            aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        >
            {isOpen ? <Icon name="X" className="w-6 h-6" /> : <Icon name="Sparkles" className="w-6 h-6" />}
        </button>

        {/* Chat Window */}
        {isOpen && (
            <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50 animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-greek-blue-600 to-greek-blue-500 p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2 text-white">
                        <Icon name="Sparkles" className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Local Guide</h3>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-[10px] font-semibold text-white tracking-wide uppercase backdrop-blur-sm">
                        <Icon name="Google" className="w-3 h-3" />
                        <span>Maps</span>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 scroll-smooth">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                             {/* Text Bubble */}
                             <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-greek-blue-600 text-white rounded-br-none' 
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                            }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                             </div>
                             
                             {/* Map Cards - only for model messages with chunks */}
                             {msg.chunks && msg.chunks.length > 0 && (
                                 <div className="mt-3 w-full max-w-[90%] space-y-3">
                                     {msg.chunks.map((chunk, i) => {
                                         if (!chunk.maps) return null;
                                         const { title, uri, placeAnswerSources } = chunk.maps;
                                         
                                         return (
                                             <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                                                <div className="p-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500">
                                                                <Icon name="Location" className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 text-sm group-hover:text-greek-blue-600 transition-colors">{title}</h4>
                                                                <a 
                                                                    href={uri}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-gray-500 hover:text-greek-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                                                                >
                                                                    View on Google Maps
                                                                    <Icon name="ExternalLink" className="w-3 h-3" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Review Snippet */}
                                                    {placeAnswerSources?.reviewSnippets && placeAnswerSources.reviewSnippets.length > 0 && (
                                                        <div className="mt-3 text-xs bg-gray-50 p-2.5 rounded-lg text-gray-600 italic border-l-2 border-greek-blue-300">
                                                            "{placeAnswerSources.reviewSnippets[0].content}"
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Action Bar */}
                                                <a 
                                                    href={uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="block w-full bg-gray-50 py-2 text-center text-xs font-semibold text-greek-blue-600 hover:bg-greek-blue-50 transition-colors border-t border-gray-100"
                                                >
                                                    Get Directions
                                                </a>
                                             </div>
                                         );
                                     })}
                                 </div>
                             )}
                        </div>
                    ))}
                    
                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex items-start animate-fade-in">
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-4 shadow-sm">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-greek-blue-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-greek-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    <div className="w-2 h-2 bg-greek-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about places, food, or history..."
                            className="w-full bg-gray-50 text-gray-900 rounded-full pl-5 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-greek-blue-500 focus:bg-white border border-gray-200 transition-all shadow-inner text-sm placeholder-gray-400"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 bg-greek-blue-600 text-white p-2 rounded-full hover:bg-greek-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                        >
                            <Icon name="Send" className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="text-[10px] text-center text-gray-400 mt-2">
                        Gemini can make mistakes, including about places.
                    </div>
                </form>
            </div>
        )}
    </>
  );
};

export default AiAssistant;
