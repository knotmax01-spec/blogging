import axios from 'axios';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_MODEL = process.env.PERPLEXITY_MODEL || 'pplx-7b-online';

if (!PERPLEXITY_API_KEY) {
  console.warn('⚠️ PERPLEXITY_API_KEY environment variable is not set. Trend analysis will not work.');
}

export async function getTrendingHealthcareTopics() {
  try {
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is not configured');
    }
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: PERPLEXITY_MODEL,
        messages: [
          {
            role: 'user',
            content: `Identify 3 current trending topics in healthcare today. For each topic, provide:
1. Topic name (clear, specific healthcare subject)
2. Trend type (Evolution, Innovation, or Emerging)
3. Why it's trending now (1-2 sentences)
4. Relevance score (1-100)

Format as JSON array with objects containing: topic, trend, reason, relevanceScore

Focus on real healthcare advancements, wellness trends, medical innovations, and disease prevention strategies that are relevant TODAY.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const topics = JSON.parse(jsonMatch[0]);
      return topics.map(t => ({
        topic: t.topic || t.name,
        trend: (t.trend || 'emerging').toLowerCase(),
        description: t.reason || t.description,
        relevanceScore: t.relevanceScore || 50,
        source: 'perplexity',
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching trending topics from Perplexity:', error.message);
    return [];
  }
}

export async function researchTopic(topic) {
  try {
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is not configured');
    }
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: PERPLEXITY_MODEL,
        messages: [
          {
            role: 'user',
            content: `Research the following healthcare topic and provide current information:
Topic: ${topic}

Provide factual, up-to-date information about:
1. Current context and relevance
2. Recent developments
3. Expert perspectives
4. Impact on healthcare industry

Keep response concise and factual.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error researching topic with Perplexity:', error.message);
    return '';
  }
}
