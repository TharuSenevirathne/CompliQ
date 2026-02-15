import React, { useState, useRef, useEffect } from 'react';
import { View,Text,TextInput,TouchableOpacity,ScrollView,KeyboardAvoidingView,Platform,} from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MaterialIcons } from '@expo/vector-icons';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error(
    "Gemini API key is missing. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file"
  );
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export default function AIChat() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { role: 'user' as const, text: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const chat = model.startChat({
        history: messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        })),
      });

      const result = await chat.sendMessage(inputText);
      const response = await result.response;
      const aiText = response.text();

      setMessages((prev) => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error('Gemini error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const suggestedQuestions = [
    "How do I submit a complaint?",
    "What is the complaint process?",
    "How to track my complaint?",
    "Contact support"
  ];

  const handleSuggestion = (question: string) => {
    setInputText(question);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Decorative background */}
      <View className="absolute top-[-100] right-[-100] w-80 h-80 rounded-full bg-blue-50 opacity-30" />
      
      {/* Header */}
      <View className="bg-white pt-14 pb-6 px-6 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-900 text-3xl font-bold">AI Assistant</Text>
            <View className="flex-row items-center mt-1">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Text className="text-blue-600 text-sm font-medium">Powered by Gemini</Text>
            </View>
          </View>
          <View className="flex-row">
            {messages.length > 0 && (
              <TouchableOpacity
                onPress={clearChat}
                className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center mr-2"
              >
                <MaterialIcons name="delete" size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
            <View className="w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center">
              <MaterialIcons name="psychology" size={28} color="white" />
            </View>
          </View>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4 pt-4" 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          // Welcome Screen
          <View className="flex-1 items-center justify-center py-12">
            <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-4">
              <MaterialIcons name="psychology" size={40} color="#2563eb" />
            </View>
            <Text className="text-gray-900 text-xl font-bold mb-2">Hi! How can I help?</Text>
            <Text className="text-gray-500 text-center mb-6 px-8">
              Ask me anything about complaints, status updates, or general questions.
            </Text>

            {/* Suggested Questions */}
            <View className="w-full px-4">
              <Text className="text-gray-700 font-semibold mb-3">Suggested Questions:</Text>
              {suggestedQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSuggestion(question)}
                  className="bg-white rounded-xl p-4 mb-2 border border-gray-200 flex-row items-center"
                >
                  <MaterialIcons name="lightbulb-outline" size={20} color="#2563eb" />
                  <Text className="text-gray-700 ml-3 flex-1">{question}</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          // Messages
          <>
            {messages.map((msg, index) => (
              <View
                key={index}
                className={`mb-3 flex-row ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'ai' && (
                  <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2 mt-1">
                    <MaterialIcons name="psychology" size={18} color="#2563eb" />
                  </View>
                )}
                
                <View
                  className={`max-w-[75%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-600 rounded-br-sm'
                      : 'bg-white rounded-bl-sm border border-gray-200'
                  }`}
                >
                  <Text
                    className={`leading-5 ${
                      msg.role === 'user' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {msg.text}
                  </Text>
                </View>

                {msg.role === 'user' && (
                  <View className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center ml-2 mt-1">
                    <MaterialIcons name="person" size={18} color="white" />
                  </View>
                )}
              </View>
            ))}

            {loading && (
              <View className="flex-row items-center mb-3">
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                  <MaterialIcons name="psychology" size={18} color="#2563eb" />
                </View>
                <View className="bg-white rounded-2xl rounded-bl-sm border border-gray-200 px-4 py-3">
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-gray-400 mr-1 animate-pulse" />
                    <View className="w-2 h-2 rounded-full bg-gray-400 mr-1 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <View className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="bg-white border-t border-gray-200 px-4 py-3"
      >
        <View className="flex-row items-center">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-2xl px-4 mr-3">
            <TextInput
              className="flex-1 py-3 text-gray-900"
              placeholder="Type your message..."
              placeholderTextColor="#9ca3af"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            {inputText.length > 0 && (
              <TouchableOpacity onPress={() => setInputText('')}>
                <MaterialIcons name="close" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={sendMessage}
            disabled={loading || !inputText.trim()}
            className={`w-12 h-12 rounded-full items-center justify-center shadow-md ${
              loading || !inputText.trim() ? 'bg-gray-300' : 'bg-blue-600'
            }`}
          >
            <MaterialIcons 
              name={loading ? "hourglass-empty" : "send"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}