// Test endpoint to check if attribute terms are working
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-client";

export async function GET(request) {
    try {
        // First, get all attributes
        const attrsRes = await backendFetch("attributes", {
            method: "GET",
            params: { per_page: '10', page: '1' }
        });

        if (!attrsRes.ok) {
            return NextResponse.json({ 
                error: 'Failed to fetch attributes',
                status: attrsRes.status 
            }, { status: 500 });
        }

        const attrsData = await attrsRes.json();
        const attributes = Array.isArray(attrsData) ? attrsData : (attrsData.attributes || []);

        if (attributes.length === 0) {
            return NextResponse.json({ 
                error: 'No attributes found',
                data: attrsData 
            }, { status: 404 });
        }

        // Test fetching terms for the first attribute
        const firstAttr = attributes[0];
        console.log('[TEST] Testing attribute:', firstAttr.id, firstAttr.name);

        const termsRes = await backendFetch(`attributes/${firstAttr.id}/terms`, {
            method: "GET",
            params: { per_page: '10', page: '1' }
        });

        if (!termsRes.ok) {
            return NextResponse.json({ 
                error: 'Failed to fetch terms',
                attribute: firstAttr,
                status: termsRes.status 
            }, { status: 500 });
        }

        const termsData = await termsRes.json();
        const terms = Array.isArray(termsData) ? termsData : (termsData.terms || termsData.data || []);

        return NextResponse.json({
            success: true,
            attribute: {
                id: firstAttr.id,
                name: firstAttr.name,
                slug: firstAttr.slug
            },
            terms: terms,
            termsCount: terms.length,
            rawTermsData: termsData
        });

    } catch (error) {
        return NextResponse.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
}
