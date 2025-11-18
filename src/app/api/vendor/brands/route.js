// src/app/api/vendor/brands/route.js
// Load brands from local JSON file

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
    try {
        // Load brands from local JSON file
        const filePath = path.join(process.cwd(), 'public', 'data', 'brands.json');
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        // Handle both formats: array or object with brands property
        const allBrands = Array.isArray(data) ? data : (data.brands || []);

        if (allBrands.length === 0) {
            return NextResponse.json({ 
                brands: [],
                total: 0
            }, { status: 200 });
        }

        // Build hierarchical structure in parent-children order
        const buildHierarchy = (brands, parentId = 0, level = 0) => {
            const result = [];
            const children = brands.filter(brand => (brand.parent || 0) === parentId);
            
            // Sort alphabetically
            children.sort((a, b) => a.name.localeCompare(b.name));
            
            children.forEach(brand => {
                result.push({
                    id: brand.id,
                    name: brand.name,
                    slug: brand.slug,
                    parent: brand.parent || 0,
                    level,
                    displayName: '—'.repeat(level) + (level > 0 ? ' ' : '') + brand.name
                });
                // Recursively add children
                result.push(...buildHierarchy(brands, brand.id, level + 1));
            });
            
            return result;
        };

        const hierarchical = buildHierarchy(allBrands);

        return NextResponse.json({ 
            brands: hierarchical,
            total: allBrands.length
        }, { status: 200 });
    } catch (error) {
        console.error('Error loading brands from JSON:', error);
        
        // Return empty array if file doesn't exist
        if (error.code === 'ENOENT') {
            return NextResponse.json({ 
                brands: [],
                total: 0
            }, { status: 200 });
        }
        
        return NextResponse.json(
            { error: error.message || 'Failed to load brands from local file.' },
            { status: 500 }
        );
    }
}
