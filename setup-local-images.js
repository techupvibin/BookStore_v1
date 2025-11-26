const fs = require('fs');
const path = require('path');

// Configuration
const BOOKS_DIRECTORY = 'C:\\Users\\govin\\Downloads\\Java Books';
const OUTPUT_FILE = 'book-image-mapping.json';

// Supported image extensions
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

/**
 * Get all image files from the directory
 */
function getImageFiles() {
    try {
        if (!fs.existsSync(BOOKS_DIRECTORY)) {
            console.log(`❌ Directory does not exist: ${BOOKS_DIRECTORY}`);
            return [];
        }

        const files = fs.readdirSync(BOOKS_DIRECTORY);
        return files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return SUPPORTED_EXTENSIONS.includes(ext);
        });
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
}

/**
 * Normalize a string for matching
 */
function normalizeString(str) {
    return str.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Find matching images for common Java book titles
 */
function findMatchingImages() {
    const imageFiles = getImageFiles();
    console.log(`📁 Found ${imageFiles.length} image files in: ${BOOKS_DIRECTORY}`);
    
    if (imageFiles.length === 0) {
        console.log('❌ No image files found. Please add some book cover images to the directory.');
        return {};
    }

    // Common Java book titles (you can modify this list)
    const commonJavaBooks = [
        'Effective Java',
        'Java: The Complete Reference',
        'Head First Java',
        'Java Concurrency in Practice',
        'Spring in Action',
        'Spring Boot in Action',
        'Clean Code',
        'Design Patterns',
        'Java 8 in Action',
        'Java Performance',
        'Java Generics and Collections',
        'Java Network Programming',
        'Java Security',
        'Java Web Services',
        'Java Persistence with Hibernate',
        'Java EE 7',
        'Java 9 Modularity',
        'Java 11 Features',
        'Java 17 Features',
        'Microservices with Spring Boot',
        'Spring Security',
        'Spring Data',
        'Spring Cloud',
        'RESTful Web Services',
        'Building Microservices',
        'Domain-Driven Design',
        'Test-Driven Development',
        'Agile Software Development',
        'Refactoring',
        'Working Effectively with Legacy Code'
    ];

    const mapping = {};
    const usedImages = new Set();

    // Try to match each book title with an image
    for (const bookTitle of commonJavaBooks) {
        const normalizedTitle = normalizeString(bookTitle);
        let bestMatch = null;
        let bestScore = 0;

        for (const imageFile of imageFiles) {
            if (usedImages.has(imageFile)) continue;

            const nameWithoutExt = path.parse(imageFile).name;
            const normalizedImageName = normalizeString(nameWithoutExt);

            // Calculate match score
            let score = 0;
            
            // Exact match
            if (normalizedImageName === normalizedTitle) {
                score = 100;
            }
            // Contains match
            else if (normalizedImageName.includes(normalizedTitle) || normalizedTitle.includes(normalizedImageName)) {
                score = 80;
            }
            // Word-based matching
            else {
                const titleWords = normalizedTitle.split(' ');
                const imageWords = normalizedImageName.split(' ');
                
                for (const titleWord of titleWords) {
                    if (titleWord.length > 2) {
                        for (const imageWord of imageWords) {
                            if (imageWord.includes(titleWord) || titleWord.includes(imageWord)) {
                                score += 20;
                            }
                        }
                    }
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = imageFile;
            }
        }

        if (bestMatch && bestScore > 30) {
            mapping[bookTitle] = bestMatch;
            usedImages.add(bestMatch);
            console.log(`✅ Matched: "${bookTitle}" → "${bestMatch}" (score: ${bestScore})`);
        } else {
            console.log(`❌ No match found for: "${bookTitle}"`);
        }
    }

    return mapping;
}

/**
 * Generate a sample book data file
 */
function generateSampleBookData() {
    const mapping = findMatchingImages();
    
    const sampleBooks = Object.keys(mapping).map((title, index) => ({
        id: index + 1,
        title: title,
        description: `Comprehensive guide to ${title.toLowerCase()}. This book covers all the essential concepts and best practices.`,
        isbn: `978-0-123456-${String(index + 1).padStart(3, '0')}-${Math.floor(Math.random() * 10)}`,
        publicationYear: 2020 + (index % 4),
        imageUrl: `/api/images/local/${mapping[title]}`,
        genre: 'Programming',
        price: 29.99 + (index * 5),
        quantity: 10 + (index % 20),
        isAvailable: true
    }));

    const output = {
        directory: BOOKS_DIRECTORY,
        totalImages: getImageFiles().length,
        matchedBooks: Object.keys(mapping).length,
        mapping: mapping,
        sampleBooks: sampleBooks,
        instructions: {
            setup: [
                "1. Copy your book cover images to: " + BOOKS_DIRECTORY,
                "2. Make sure image filenames match book titles (e.g., 'Effective Java.jpg')",
                "3. Supported formats: " + SUPPORTED_EXTENSIONS.join(', '),
                "4. Run the Spring Boot application",
                "5. Use the admin endpoint: POST /api/admin/book-images/assign-local-images"
            ],
            endpoints: [
                "GET /api/images/local/list - List all available images",
                "GET /api/images/local/{filename} - Serve an image",
                "GET /api/admin/book-images/local-images - Get available images (Admin)",
                "POST /api/admin/book-images/assign-local-images - Auto-assign images to books (Admin)"
            ]
        }
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`\n📄 Generated mapping file: ${OUTPUT_FILE}`);
    console.log(`📊 Summary:`);
    console.log(`   - Total images found: ${output.totalImages}`);
    console.log(`   - Books matched: ${output.matchedBooks}`);
    console.log(`   - Sample books generated: ${sampleBooks.length}`);
    
    return output;
}

/**
 * Main execution
 */
function main() {
    console.log('🚀 BookStore Local Images Setup');
    console.log('================================\n');
    
    const result = generateSampleBookData();
    
    console.log('\n📋 Next Steps:');
    console.log('1. Review the generated mapping in ' + OUTPUT_FILE);
    console.log('2. Add more book cover images to: ' + BOOKS_DIRECTORY);
    console.log('3. Rename image files to match book titles for better matching');
    console.log('4. Start your Spring Boot application');
    console.log('5. Use the admin panel to assign images to books');
    
    console.log('\n🎯 Pro Tips:');
    console.log('- Use descriptive filenames like "Effective Java.jpg"');
    console.log('- Keep image files under 2MB for better performance');
    console.log('- Use JPG or PNG format for best compatibility');
}

// Run the script
main();

