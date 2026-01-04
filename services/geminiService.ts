
import { GoogleGenAI } from "@google/genai";
import { SearchResponse, BusinessInfo, GroundingLink } from "../types";

export const searchBusinesses = async (
  query: string,
  location?: { lat: number; lng: number }
): Promise<SearchResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Refined prompt to push the model to find contact information using both tools.
  const prompt = `Act as an expert Lead Generation specialist. Your task is to extract a high-quality list of businesses and their contact details for the query: "${query}".

For EVERY business found via Google Maps or Google Search, provide the details in this specific format. 
You MUST prioritize finding the EMAIL and PHONE NUMBER. 
If an email is not directly listed, check for common patterns based on the domain or look for it in the snippets.

Use the following structure for each entry:

NAME: [Business Name]
PHONE: [Full Phone Number]
EMAIL: [Email Address or "Not found"]
ADDRESS: [Complete Address]
WEBSITE: [URL]
RATING: [X.X/5]
---
(Repeat for at least 10-15 businesses if possible)

IMPORTANT: Use both Google Maps and Google Search to find emails. Often emails are found on the website's contact page or directory listings found via search.`;

  const config: any = {
    // Using both tools as permitted by the guidelines to maximize data extraction.
    tools: [{ googleMaps: {} }, { googleSearch: {} }],
  };

  if (location && location.lat && location.lng) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: location.lat,
          longitude: location.lng,
        }
      }
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config,
    });

    const rawText = response.text || "";
    
    // Aggregate all sources from grounding metadata (Maps + Search)
    const sources: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach((chunk: any) => {
      if (chunk.maps) {
        sources.push({
          uri: chunk.maps.uri,
          title: chunk.maps.title || 'Google Maps Source'
        });
      } else if (chunk.web) {
        sources.push({
          uri: chunk.web.uri,
          title: chunk.web.title || 'Web Source'
        });
      }
    });

    const businesses = parseBusinessInfo(rawText);

    return {
      rawText,
      businesses,
      sources
    };
  } catch (error) {
    console.error("Scraping failed:", error);
    throw error;
  }
};

/**
 * Improved parsing logic to handle the multi-line structured output.
 */
function parseBusinessInfo(text: string): BusinessInfo[] {
  const items: BusinessInfo[] = [];
  // Split the response into individual business blocks
  const blocks = text.split(/---|\n\s*\n(?=NAME:)/g);
  
  blocks.forEach(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return;

    const getData = (key: string) => {
      const line = lines.find(l => l.toUpperCase().startsWith(`${key}:`));
      if (!line) return null;
      const value = line.split(':').slice(1).join(':').trim();
      return (value.toLowerCase() === 'n/a' || value.toLowerCase() === 'not found' || value === '') ? null : value;
    };

    const name = getData('NAME')?.replace(/[*#]/g, '');
    const phone = getData('PHONE');
    const email = getData('EMAIL');
    const address = getData('ADDRESS');
    const website = getData('WEBSITE');
    const rating = getData('RATING');

    if (name) {
      items.push({
        name,
        phone: phone || "Not found",
        email: email || "Not found",
        address: address || "Address not found",
        website: website || undefined,
        rating: rating || undefined,
      });
    }
  });

  // Fallback: If structured blocks aren't detected, try global regex for any emails/phones
  if (items.length === 0) {
    const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const phones = text.match(/(\+?\d[\d\s-]{8,})/g) || [];
    
    if (emails.length > 0 || phones.length > 0) {
      // Create a single summary item if we found fragmented contact info
      items.push({
        name: "Contact Leads Found",
        phone: phones[0] || "Not found",
        email: emails[0] || "Not found",
        address: "Contact details extracted from raw text summary.",
      });
    }
  }

  return items;
}
