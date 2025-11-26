#!/usr/bin/env node

/**
 * CORS Test Script
 * Tests CORS configuration between frontend and backend
 */

const https = require('https');
const http = require('http');

// Test configuration
const BACKEND_URL = 'http://localhost:8080';
const FRONTEND_ORIGIN = 'http://localhost:3000';

console.log('🔍 Testing CORS Configuration...\n');

// Test 1: Basic CORS Test Endpoint
async function testCorsEndpoint() {
    console.log('📡 Test 1: CORS Test Endpoint');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/cors-test/ping`, {
            method: 'GET',
            headers: {
                'Origin': FRONTEND_ORIGIN,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('✅ CORS Test Endpoint:', data.message);
        console.log('📋 Response Headers:');
        response.headers.forEach((value, key) => {
            if (key.toLowerCase().includes('access-control')) {
                console.log(`   ${key}: ${value}`);
            }
        });
        
    } catch (error) {
        console.log('❌ CORS Test Endpoint Failed:', error.message);
    }
    console.log('');
}

// Test 2: Admin Settings Endpoint
async function testAdminSettings() {
    console.log('📡 Test 2: Admin Settings Endpoint');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/settings`, {
            method: 'GET',
            headers: {
                'Origin': FRONTEND_ORIGIN,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Admin Settings Endpoint: Success');
            console.log('📋 Response Headers:');
            response.headers.forEach((value, key) => {
                if (key.toLowerCase().includes('access-control')) {
                    console.log(`   ${key}: ${value}`);
                }
            });
        } else {
            console.log('⚠️ Admin Settings Endpoint: HTTP', response.status);
        }
        
    } catch (error) {
        console.log('❌ Admin Settings Endpoint Failed:', error.message);
    }
    console.log('');
}

// Test 3: Preflight Request
async function testPreflightRequest() {
    console.log('📡 Test 3: Preflight Request (OPTIONS)');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/settings`, {
            method: 'OPTIONS',
            headers: {
                'Origin': FRONTEND_ORIGIN,
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        
        console.log('✅ Preflight Request: HTTP', response.status);
        console.log('📋 Response Headers:');
        response.headers.forEach((value, key) => {
            if (key.toLowerCase().includes('access-control')) {
                console.log(`   ${key}: ${value}`);
            }
        });
        
    } catch (error) {
        console.log('❌ Preflight Request Failed:', error.message);
    }
    console.log('');
}

// Test 4: POST Request
async function testPostRequest() {
    console.log('📡 Test 4: POST Request');
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/cors-test/test`, {
            method: 'POST',
            headers: {
                'Origin': FRONTEND_ORIGIN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ test: 'data' })
        });
        
        const data = await response.json();
        console.log('✅ POST Request:', data.message);
        console.log('📋 Response Headers:');
        response.headers.forEach((value, key) => {
            if (key.toLowerCase().includes('access-control')) {
                console.log(`   ${key}: ${value}`);
            }
        });
        
    } catch (error) {
        console.log('❌ POST Request Failed:', error.message);
    }
    console.log('');
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting CORS Tests...\n');
    
    await testCorsEndpoint();
    await testPreflightRequest();
    await testAdminSettings();
    await testPostRequest();
    
    console.log('🎯 CORS Tests Complete!');
    console.log('\n💡 If all tests pass, CORS is working correctly.');
    console.log('💡 If tests fail, check the backend logs and CORS configuration.');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ or fetch polyfill');
    console.log('💡 Alternative: Use curl commands from CORS_TROUBLESHOOTING.md');
    process.exit(1);
}

// Run tests
runAllTests().catch(console.error);
