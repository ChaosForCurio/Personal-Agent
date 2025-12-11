'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser, UserButton } from "@stackframe/stack";
import { VoiceInput } from '@/components/voice-input';
import {
  getTrendingAINews,
  getLatestResearchPapers,
  analyzeTrendingTopics,
  performGeneralSearch
} from '@/lib/gemini';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { postToTwitter } from '@/lib/twitter';
import { generateImage } from '@/lib/freepik';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const user = useUser();
  const [activeTab, setActiveTab] = useState<'news' | 'papers' | 'trends' | 'search' | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const [content, setContent] = useState<Record<string, string>>({
    news: '',
    papers: '',
    trends: '',
    search: ''
  });

  const [lastTranscript, setLastTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Auto-scroll to content result
  const contentRef = useRef<HTMLDivElement>(null);

  const handleVoiceInput = async (text: string) => {
    setLastTranscript(text);
    setIsLoading(true);
    setGeneratedImage(null); // Reset image on new command
    const lowerText = text.toLowerCase();

    try {
      if (lowerText.includes('news')) {
        setActiveTab('news');
        if (!content.news || lowerText.includes('refresh')) {
          const result = await getTrendingAINews();
          setContent(prev => ({ ...prev, news: result }));
        }
      } else if (lowerText.includes('papers')) {
        setActiveTab('papers');
        if (!content.papers || lowerText.includes('refresh')) {
          const result = await getLatestResearchPapers();
          setContent(prev => ({ ...prev, papers: result }));
        }
      } else if (lowerText.includes('trends')) {
        setActiveTab('trends');
        if (!content.trends || lowerText.includes('refresh')) {
          const result = await analyzeTrendingTopics();
          setContent(prev => ({ ...prev, trends: result }));
        }
      } else if (lowerText.includes('post') && lowerText.includes('twitter')) {
        // Post the currently active content
        if (activeTab && content[activeTab]) {
          await handlePostToTwitter(content[activeTab].substring(0, 280), generatedImage || undefined);
        }
      } else if (lowerText.includes('generate') && lowerText.includes('image')) {
        if (activeTab && content[activeTab]) {
          await handleGenerateImage();
        }
      } else {
        // Default to General Search for any other query
        setActiveTab('search');
        const result = await performGeneralSearch(text);
        setContent(prev => ({ ...prev, search: result }));
      }
    } catch (error) {
      console.error('Error processing command:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleGenerateImage = async () => {
    if (!activeTab || !content[activeTab]) return;
    setIsGeneratingImg(true);
    try {
      // Create a simple prompt based on the content context
      const topic = activeTab === 'news' ? 'Futuristic AI News' : activeTab === 'papers' ? 'Scientific Research Abstract' : activeTab === 'trends' ? 'Data Analytics Visualization' : 'Abstract AI Concept';
      // Use the first few words or a summary if available, but for now specific topic + chaotic/tech style
      const prompt = `A futuristic, high-quality digital art illustration representing ${topic} about ${lastTranscript.substring(0, 20)}. Cyberpunk style, detailed, 4k.`;

      const result = await generateImage(prompt);
      // Freepik result.base64 is common
      if (result.base64) {
        setGeneratedImage(`data:image/png;base64,${result.base64}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate image.');
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handlePostToTwitter = async (textToPost: string, image?: string) => {
    if (!textToPost) return;
    setIsPosting(true);
    try {
      await postToTwitter(textToPost, image);
      alert('Success! Posted to X.');
    } catch (e) {
      console.error(e);
      alert('Failed to post to X.');
    } finally {
      setIsPosting(false);
    }
  };

  if (isLoading) {
    // Optional: could show a loading overlay here if full page blocking is desired
  }

  // Simplified Landing State (when no user)
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-900/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="z-10 text-center space-y-8 max-w-lg glass-panel p-12 rounded-3xl animate-fade-in border-white/5">
          <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 animate-float">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /><path d="M17.599 6.5a3 3 0 0 0 .399-1.375" /><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" /><path d="M3.477 10.896a4 4 0 0 1 .585-.396" /><path d="M19.938 10.5a4 4 0 0 1 .585.396" /><path d="M6 18a4 4 0 0 1-1.97-3.284" /><path d="M17.97 14.716A4 4 0 0 1 18 18" /></svg>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Personal AI Agent
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Your intelligent voice-activated assistant for real-time insights, research, and seamless social connectivity.
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/handler/sign-in"
              className="group inline-flex items-center px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform"><path d="m5 12 7-7 7 7 7 7" /><path d="M12 19V5" /></svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 selection:bg-blue-500/30 font-sans">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black pointer-events-none" />

      {/* Header */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /></svg>
            </div>
            <span className="font-bold text-lg tracking-tight">Agent<span className="text-blue-500">.ai</span></span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-sm font-medium text-gray-400">
              {user.displayName || user.primaryEmail}
            </div>
            <UserButton />
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center gap-16">

        {/* Status & Voice */}
        <div className="flex flex-col items-center gap-8 w-full animate-fade-in">
          <div className="text-center space-y-3">
            <h2 className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 transition-all ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              {isLoading ? 'Processing...' : 'Ready for Command'}
            </h2>
            <p className="text-gray-500 text-lg font-light">
              Try saying "Get latest AI news" or "Search for [topic]"
            </p>
            {lastTranscript && (
              <div className="mt-6 px-6 py-3 glass-panel rounded-full text-blue-200 inline-block animate-fade-in">
                "{lastTranscript}"
              </div>
            )}
          </div>

          <div className="py-2">
            <VoiceInput onTranscribe={handleVoiceInput} isLoading={isLoading} />
          </div>
        </div>

        {/* Content Area */}
        <div ref={contentRef} className="w-full space-y-8">

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['news', 'papers', 'trends'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleVoiceInput(tab)}
                className={`glass-panel p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 ${activeTab === tab
                  ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-900/20'
                  : 'hover:bg-white/5 hover:border-white/20'}`}
              >
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-colors ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'}`}>
                  {tab === 'news' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>}
                  {tab === 'papers' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>}
                  {tab === 'trends' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>}
                </div>
                <h3 className="font-semibold text-lg text-left capitalize text-gray-100 group-hover:text-white mb-1">
                  {tab === 'news' ? 'AI News' : tab === 'papers' ? 'Research' : 'Analysis'}
                </h3>
                <p className="text-sm text-left text-gray-500 font-light">
                  {tab === 'news' ? 'Latest headlines' : tab === 'papers' ? 'ArXiv papers' : 'Market trends'}
                </p>
              </button>
            ))}
          </div>

          {/* Display Area */}
          {activeTab && content[activeTab] && (
            <div className="glass-panel rounded-3xl p-8 shadow-2xl overflow-hidden relative transition-all animate-fade-in border-white/10">

              {/* Header: Title & Speak Button */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 flex-wrap gap-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${activeTab === 'news' ? 'bg-blue-500/20 text-blue-400' : activeTab === 'papers' ? 'bg-purple-500/20 text-purple-400' : activeTab === 'trends' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    {activeTab === 'news' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>}
                    {activeTab === 'papers' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>}
                    {activeTab === 'trends' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2" /><polyline points="3 10 21 10" /><path d="M4.5 14h.01" /><path d="M7.5 14h.01" /><path d="M10.5 14h.01" /></svg>}
                    {activeTab === 'search' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>}
                  </div>
                  <h2 className="text-2xl font-bold text-white capitalize tracking-tight">
                    {activeTab === 'search' ? 'Search Results' : `Latest ${activeTab}`}
                  </h2>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 items-center">
                  <button onClick={isSpeaking ? stopSpeaking : () => speakText(content[activeTab])} className={`p-3 rounded-xl transition-all ${isSpeaking ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'}`} title={isSpeaking ? "Stop Speaking" : "Read Aloud"}>
                    {isSpeaking ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>}
                  </button>
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImg || !!generatedImage}
                    className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 text-white rounded-xl text-sm font-medium hover:bg-neutral-700 transition disabled:opacity-50 border border-white/5"
                  >
                    {isGeneratingImg ? 'Generating...' : generatedImage ? 'Image Ready' : 'Generate Image'}
                  </button>
                  <button
                    onClick={() => handlePostToTwitter(content[activeTab!] || '', generatedImage || undefined)}
                    disabled={isPosting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition disabled:opacity-50 shadow-lg shadow-blue-500/20"
                  >
                    {isPosting ? <div className="w-4 h-4 rounded-full border-2 border-white/50 border-t-white animate-spin" /> :
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>}
                    Post to X
                  </button>
                </div>
              </div>

              {/* Generated Image Preview */}
              {generatedImage && (
                <div className="mb-8 rounded-2xl overflow-hidden border border-white/10 relative group shadow-2xl">
                  <Image
                    src={generatedImage}
                    alt="Generated visualization"
                    width={800}
                    height={400}
                    className="w-full h-auto max-h-96 object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end justify-center pb-6">
                    <p className="text-white font-medium bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">Ready to post</p>
                  </div>
                </div>
              )}

              {/* Markdown Content */}
              <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-p:leading-relaxed prose-headings:text-white prose-strong:text-blue-400 prose-a:text-blue-400 prose-ul:list-disc prose-ul:pl-6 prose-li:text-gray-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content[activeTab]}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {!activeTab && !isLoading && (
            <div className="text-center py-20 text-gray-600 bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-30"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M9 3v4" /><path d="M3 5h4" /><path d="M3 9h4" /></svg>
              Waiting for your next command...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}