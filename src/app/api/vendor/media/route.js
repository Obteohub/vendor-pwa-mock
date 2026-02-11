// src/app/api/vendor/media/route.js
import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/backend-client';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return NextResponse.json(
                { error: 'No valid file found in request data.' },
                { status: 400 }
            );
        }

        console.log(`[MEDIA] Uploading file: ${file.name} via middleware`);

        // Forward the FormData directly to middleware
        const externalMediaFormData = new FormData();
        externalMediaFormData.append('file', file, file.name);
        if (formData.has('title')) externalMediaFormData.append('title', formData.get('title'));
        if (formData.has('alt_text')) externalMediaFormData.append('alt_text', formData.get('alt_text'));

        const response = await backendFetch('media', {
            method: 'POST',
            body: externalMediaFormData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[MEDIA] Upload failed:', errorData);
            return NextResponse.json(
                { error: errorData.message || 'Media upload failed' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });

    } catch (error) {
        console.error('Error processing media upload:', error);
        return NextResponse.json(
            { error: 'Failed to process media upload internally.' },
            { status: 500 }
        );
    }
}