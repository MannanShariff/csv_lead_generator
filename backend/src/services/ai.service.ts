import { genAI } from '../config/gemini';
import { PromptService } from './prompt.service';
import { CRMLead, CRMLeadSchema } from '../types/crm';

export class AIService {
  public async extractCRMLeads(rows: Array<Record<string, any>>): Promise<CRMLead[]> {
    const systemInstruction = PromptService.getSystemInstructions();
    const prompt = PromptService.buildUserPrompt(rows);

    const schema: any = {
      type: "array",
      items: {
        type: "object",
        properties: {
          created_at: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          country_code: { type: "string" },
          mobile_without_country_code: { type: "string" },
          company: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          country: { type: "string" },
          lead_owner: { type: "string" },
          crm_status: { type: "string", enum: ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"] },
          crm_note: { type: "string" },
          data_source: { type: "string", enum: ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"] },
          possession_time: { type: "string" },
          description: { type: "string" }
        },
        required: []
      }
    };

    const maxRetries = 2;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: systemInstruction,
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            // @ts-ignore
            responseSchema: schema,
            temperature: 0.1,
          },
        });

        const textResponse = result.response.text();
        if (!textResponse) {
          throw new Error('Empty response from Gemini API');
        }

        const parsedJson = JSON.parse(textResponse);
        if (!Array.isArray(parsedJson)) {
          throw new Error('AI did not return a JSON array');
        }

        const validatedLeads: CRMLead[] = [];
        for (const item of parsedJson) {
          const parsedItem = CRMLeadSchema.safeParse(item);
          if (parsedItem.success) {
            const lead = parsedItem.data;
            // Additional validation: Ensure we skip records with neither email nor phone
            if (lead.email.trim() || lead.mobile_without_country_code.trim()) {
              validatedLeads.push(lead);
            }
          } else {
            console.warn('Zod validation failed for record:', parsedItem.error);
            throw new Error(`Zod validation failed: ${parsedItem.error.message}`);
          }
        }

        return validatedLeads;
      } catch (error) {
        attempt++;
        console.error(`AIService Error on attempt ${attempt}:`, error);
        if (attempt < maxRetries) {
          console.log('Waiting 2 seconds before retrying...');
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    console.error(`AIService failed after ${maxRetries} attempts. Skipping this batch.`);
    return [];
  }
}
