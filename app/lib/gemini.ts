'use server';
// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchGoogle, searchNews } from './serper';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function getTrendingAINews(userQuery?: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const newsQuery = userQuery || "latest trending AI news today";

  let searchContext = "";
  try {
    let searchResults = await searchNews(newsQuery);

    if (!searchResults || searchResults.length === 0) {
      console.log("Serper News returned no results, falling back to standard search.");
      searchResults = await searchGoogle(newsQuery);
    }

    if (searchResults && searchResults.length > 0) {
      searchContext = searchResults.map((r: any) => `- ${r.title}: ${r.snippet} (${r.link})`).join('\n');
    }
  } catch (error) {
    console.error("Serper API (News) failed, trying standard search fallback:", error);
    try {
      const searchResults = await searchGoogle(newsQuery);
      if (searchResults && searchResults.length > 0) {
        searchContext = searchResults.map((r: any) => `- ${r.title}: ${r.snippet} (${r.link})`).join('\n');
      }
    } catch (fallbackError) {
      console.error("Serper API (Standard) also failed:", fallbackError);
    }
  }

  if (!searchContext) {
    return `Unable to retrieve news about "${newsQuery}" at this time. Please check your API configuration or internet connection.`;
  }

  const prompt = `You are an AI news curator. Find the trending news stories about: "${newsQuery}". 
  
  Use the following real-time search results as your primary source:
  ${searchContext}

  Include headlines, brief summaries, and links if possible (use links from search results). 
  Format the response as a bulleted list with clear headings.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.warn("Gemini 2.0 Flash failed (getTrendingAINews), attempting fallback to 1.5 Flash:", error);
    try {
      const modelFallback = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await modelFallback.generateContent(prompt);
      return result.response.text();
    } catch (fallbackError) {
      console.error("Gemini API Error (All models failed):", fallbackError);
      if (searchContext) {
        return `**Note: AI generation limit reached. Showing raw search results:**\n\n${searchContext}`;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      return `Unable to retrieve news. API Error: ${errorMessage}`;
    }
  }
}

export async function getLatestResearchPapers(userQuery?: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const papersQuery = userQuery ? `${userQuery} research papers arxiv` : "latest AI research papers arxiv neurips 2025";

  let searchContext = "";
  try {
    const searchResults = await searchGoogle(papersQuery);
    searchContext = searchResults.map((r: any) => `- ${r.title}: ${r.snippet} (${r.link})`).join('\n');
  } catch (error) {
    console.error("Serper API failed:", error);
  }

  if (!searchContext) {
    return `Unable to retrieve research papers about "${papersQuery}" at this time. Please check your Serper API configuration.`;
  }

  const prompt = `You are a research assistant. Find the latest research papers about: "${userQuery || 'AI'}". 
  Look from arXiv, major conferences (NeurIPS, ICML, ICLR, CVPR, ACL), and preprints.
  
  Use these search results:
  ${searchContext}

  Include paper titles, authors, brief abstracts, and publication dates. 
  Format as a structured list with clear sections.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.warn("Gemini 2.0 Flash failed (getLatestResearchPapers), attempting fallback to 1.5 Flash:", error);
    try {
      const modelFallback = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await modelFallback.generateContent(prompt);
      return result.response.text();
    } catch (fallbackError) {
      console.error("Gemini API Error (All models failed):", fallbackError);
      if (searchContext) {
        return `**Note: AI generation limit reached. Showing raw search results:**\n\n${searchContext}`;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      return `Unable to retrieve research papers. API Error: ${errorMessage}`;
    }
  }
}

export async function analyzeTrendingTopics(userQuery?: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const topicQuery = userQuery ? `trending topics in ${userQuery} discussions` : "trending topics in artificial intelligence today discussions";

  let searchContext = "";
  try {
    const searchResults = await searchGoogle(topicQuery);
    searchContext = searchResults.map((r: any) => `- ${r.title}: ${r.snippet}`).join('\n');
  } catch (error) {
    console.error("Serper API failed:", error);
  }

  if (!searchContext) {
    return `Unable to analyze trending topics about "${topicQuery}" at this time. Please check your Serper API configuration.`;
  }

  const prompt = `Analyze today's trending topics${userQuery ? ` in ${userQuery}` : ' in AI'}. 
  
  Based on these search results:
  ${searchContext}

  Identify the most discussed subjects, emerging technologies, and key developments. 
  Provide insights on what's gaining traction and why it matters.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.warn("Gemini 2.0 Flash failed (analyzeTrendingTopics), attempting fallback to 1.5 Flash:", error);
    try {
      const modelFallback = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await modelFallback.generateContent(prompt);
      return result.response.text();
    } catch (fallbackError) {
      console.error("Gemini API Error (All models failed):", fallbackError);
      if (searchContext) {
        return `**Note: AI generation limit reached. Showing raw search results:**\n\n${searchContext}`;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      return `Unable to analyze trending topics. API Error: ${errorMessage}`;
    }
  }
}

export async function performGeneralSearch(query: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  let searchContext = "";
  try {
    const searchResults = await searchGoogle(query);
    searchContext = searchResults.map((r: any) => `- ${r.title}: ${r.snippet} (${r.link})`).join('\n');
  } catch (error) {
    console.error("Serper API failed:", error);
  }

  const prompt = `You are a highly intelligent and helpful Personal AI Assistant.
    Your goal is to provide a comprehensive, accurate, and well-structured answer to verification queries.

    User Query: "${query}"

    Real-time Search Context:
    ${searchContext}

    Instructions:
    1. Answer the user's query directly and concisely.
    2. Use the Search Context to provide up-to-date information.
    3. If the context is insufficient, rely on your general knowledge but mention that it might not be real-time.
    4. Format your response using **Markdown**:
       - Use **Bold** for key terms.
       - Use lists (bullet points) for multiple items.
       - Use > for important quotes or summaries.
    5. Cite your sources if available in the context (links).

    Response:`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.warn("Gemini 2.0 Flash failed (performGeneralSearch), attempting fallback to 1.5 Flash:", error);
    try {
      const modelFallback = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await modelFallback.generateContent(prompt);
      return result.response.text();
    } catch (fallbackError) {
      console.error("Gemini API Error (All models failed):", fallbackError);
      if (searchContext) {
        return `**Note: AI generation limit reached. Showing raw search results:**\n\n${searchContext}`;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      return `Unable to perform search. API Error: ${errorMessage}`;
    }
  }
}

export async function getAnalysisAndInsights(userQuery: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  let searchContext = "";
  try {
    const searchResults = await searchGoogle(`analysis insights ${userQuery}`);
    searchContext = searchResults.map((r: any) => `- ${r.title}: ${r.snippet} (${r.link})`).join('\n');
  } catch (error) {
    console.error("Serper API failed:", error);
  }

  if (!searchContext) {
    return `Unable to retrieve analysis and insights about "${userQuery}". Please check your API configuration.`;
  }

  const prompt = `You are an expert analyst. Provide deep analysis and actionable insights about: "${userQuery}".
  
  Based on these search results:
  ${searchContext}

  Provide:
  1. **Key Insights**: Main findings and observations
  2. **Market/Technology Impact**: How this affects the industry
  3. **Trends**: Emerging patterns and directions
  4. **Expert Perspectives**: Different viewpoints
  5. **Future Outlook**: What to expect next

  Use **Markdown** formatting with clear sections and bullet points.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.warn("Gemini 2.0 Flash failed (getAnalysisAndInsights), attempting fallback to 1.5 Flash:", error);
    try {
      const modelFallback = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await modelFallback.generateContent(prompt);
      return result.response.text();
    } catch (fallbackError) {
      console.error("Gemini API Error (All models failed):", fallbackError);
      if (searchContext) {
        return `**Note: AI generation limit reached. Showing raw search results:**\n\n${searchContext}`;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      return `Unable to provide analysis. API Error: ${errorMessage}`;
    }
  }
}