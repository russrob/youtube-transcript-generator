import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getHooks, validateHookFilters } from "@/lib/hooks";
import { ScriptStyle, Tone, Audience } from "@/types/hooks";

// Validation schema for hook API parameters
const hookQuerySchema = z.object({
  style: z.enum([
    "PROFESSIONAL", "CASUAL", "EDUCATIONAL", "ENTERTAINING", "TECHNICAL",
    "STORYTELLING", "PERSUASIVE", "NARRATIVE", "ACADEMIC"
  ]).optional(),
  tone: z.enum(["casual", "formal", "enthusiastic", "informative"]).optional(),
  audience: z.enum(["general", "beginners", "professionals", "students", "experts"]).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryParams = {
      style: searchParams.get("style") as ScriptStyle | null,
      tone: searchParams.get("tone") as Tone | null,
      audience: searchParams.get("audience") as Audience | null,
      limit: searchParams.get("limit"),
    };
    
    const validationResult = hookQuerySchema.safeParse(queryParams);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid query parameters",
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }
    
    const { style, tone, audience, limit } = validationResult.data;
    
    // Additional validation using our custom validator
    const filterValidation = validateHookFilters({ style, tone, audience, limit });
    
    if (!filterValidation.valid) {
      return NextResponse.json(
        {
          error: "Invalid filter parameters",
          details: filterValidation.errors
        },
        { status: 400 }
      );
    }
    
    // Get filtered hooks
    const hooks = getHooks({
      style: style || undefined,
      tone: tone || undefined,
      audience: audience || undefined,
      limit: limit || 20
    });
    
    return NextResponse.json({
      success: true,
      total: hooks.length,
      hooks: hooks,
      filters: {
        style: style || null,
        tone: tone || null,
        audience: audience || null,
        limit: limit || 20
      }
    });
    
  } catch (error: any) {
    console.error("Hooks API error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message
      },
      { status: 500 }
    );
  }
}