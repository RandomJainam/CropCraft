import { serve } from "https://deno.land/std/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {

  
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {

    const { text, mode } = await req.json();

    const OPENROUTER_API_KEY =
      Deno.env.get("OPENROUTER_API_KEY");

    if (!OPENROUTER_API_KEY) {

      return new Response(
        JSON.stringify({
          error: "OPENROUTER_API_KEY not configured"
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    let systemPrompt = "";

    switch (mode) {

      case "productify":

        systemPrompt = `
You are Productify.

Convert the user's text into Product Manager style communication.

Rules:
- Professional product language
- Product thinking
- User-centric wording
- Concise and executive friendly
- Return only rewritten text
`;
        break;

      case "consultify":

        systemPrompt = `
You are Consultify.

Convert the user's text into consulting-style communication.

Rules:
- Stakeholder-focused
- Strategic wording
- Executive-level communication
- Return only rewritten text
`;
        break;

      case "executify":

        systemPrompt = `
You are Executify.

Convert the user's text into leadership communication.

Rules:
- Executive tone
- Decision-focused
- Professional
- Return only rewritten text
`;
        break;

      case "emailify":

        systemPrompt = `
You are Emailify.

Convert the user's text into professional email-ready language.

Rules:
- Polite
- Professional
- Business communication
- Return only rewritten text
`;
        break;

      default:

        systemPrompt = `
You are MBAfy, an AI Business Analyst and corporate communication assistant.

Your task is to transform informal or broken English into professional corporate communication.

Rules:
- Preserve original meaning
- Correct grammar
- Use business terminology
- Sound like a Business Analyst
- Concise and professional
- Do not add information
- Return only rewritten text

Example:

Input:
client angry because work late

Output:
The client has expressed concerns regarding project delivery delays, highlighting the need for improved planning and stakeholder communication.

Input:
users want dark mode

Output:
User feedback indicates a demand for dark mode functionality to enhance usability and overall user experience.
`;
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization":
            `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          model:
            "openai/gpt-oss-120b:free",

          messages: [

            {
              role: "system",
              content: systemPrompt
            },

            {
              role: "user",
              content: text
            }

          ]
        })
      }
    );

    const data =
      await response.json();

    console.log(
      JSON.stringify(
        data,
        null,
        2
      )
    );

    const result =
      data?.choices?.[0]?.message?.content ||
      JSON.stringify(data);

    return new Response(
      JSON.stringify({
        result
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json"
        }
      }
    );

  } catch (error) {

    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json"
        }
      }
    );
  }

});