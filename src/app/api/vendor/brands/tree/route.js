// src/app/api/vendor/brands/tree/route.js
// Returns brands in tree structure from local JSON file

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Cache the response for 5 minutes
let cachedResponse = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request) {
  // Return cached response if still valid
  if (cachedResponse && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log('Returning cached brand tree');
    return NextResponse.json(cachedResponse, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  }

  try {
    // Load brands from local JSON file
    const filePath = path.join(process.cwd(), 'public', 'data', 'brands.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Handle both formats: array or object with brands property
    const allBrands = Array.isArray(data) ? data : (data.brands || []);

    console.log(`✓ Loaded ${allBrands.length} brands from local JSON`);

    if (allBrands.length === 0) {
      console.warn('⚠ No brands found in JSON file');
      return NextResponse.json({
        brands: [],
        total: 0,
        rootCount: 0,
        message: 'No brands found'
      }, { status: 200 });
    }

    // Build tree structure in parent-children order
    const buildTree = (brands, parentId = 0) => {
      return brands
        .filter(brand => (brand.parent || 0) === parentId)
        .map(brand => ({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          parent: brand.parent || 0,
          children: buildTree(brands, brand.id)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    };

    const tree = buildTree(allBrands, 0);
    console.log(`✓ Built brand tree with ${tree.length} root brands`);

    const responseData = {
      brands: tree,
      total: allBrands.length,
      rootCount: tree.length
    };

    // Cache the response
    cachedResponse = responseData;
    cacheTimestamp = Date.now();

    return NextResponse.json(responseData, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('Error loading brand tree from JSON:', error);
    
    // Return empty array if file doesn't exist
    if (error.code === 'ENOENT') {
      return NextResponse.json({
        brands: [],
        total: 0,
        rootCount: 0,
        message: 'Brands file not found'
      }, { status: 200 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal error loading brands.' },
      { status: 500 }
    );
  }
}
