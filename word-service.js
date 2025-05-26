class WordService {
    constructor() {
        this.wordCache = new Map();
        this.validWordCache = new Set();
        this.invalidWordCache = new Set();
        this.fallbackWords = this.initializeFallbackWords();
        this.apiTimeout = 3000; // Increased timeout
        this.preferredAPI = null;
        this.apiHealthStatus = new Map();
        this.lastAPICheck = 0;
        this.apiCheckInterval = 300000; // 5 minutes
        this.initializeService();
    }

    initializeFallbackWords() {
        return {
            5: [
                'ABOUT', 'HOUSE', 'WORLD', 'LIGHT', 'WATER', 'SOUND', 'PLACE', 'RIGHT', 'GREAT', 'SMALL',
                'EVERY', 'FOUND', 'STILL', 'LARGE', 'WHERE', 'AFTER', 'FIRST', 'NEVER', 'THESE', 'THINK',
                'BEING', 'COULD', 'WOULD', 'THERE', 'THEIR', 'WHICH', 'OTHER', 'MIGHT', 'SHALL', 'WHILE',
                'THOSE', 'AGAIN', 'UNDER', 'ABOVE', 'BELOW', 'ALONG', 'AMONG', 'ROUND', 'QUICK', 'QUIET',
                'HAPPY', 'EARLY', 'YOUNG', 'HUMAN', 'LOCAL', 'SURE', 'FINAL', 'MAIN', 'FREE', 'READY'
            ],
            6: [
                'SIMPLE', 'CHANGE', 'FRIEND', 'FAMILY', 'SCHOOL', 'PERSON', 'SYSTEM', 'MOTHER', 'FATHER', 'OFFICE',
                'MARKET', 'SOCIAL', 'PUBLIC', 'HEALTH', 'NATURE', 'GROUND', 'MOMENT', 'REASON', 'RESULT', 'FUTURE',
                'ENERGY', 'POLICY', 'GROWTH', 'DESIGN', 'IMPACT', 'GLOBAL', 'BUDGET', 'CREDIT', 'PROFIT', 'INCOME',
                'STRONG', 'RECENT', 'SENIOR', 'JUNIOR', 'MODERN', 'ACTIVE', 'NORMAL', 'FORMAL', 'MENTAL', 'VISUAL'
            ],
            7: [
                'EXAMPLE', 'PROBLEM', 'COMPANY', 'PROGRAM', 'COUNTRY', 'STUDENT', 'TEACHER', 'MANAGER', 'SCIENCE', 'HISTORY',
                'CULTURE', 'SOCIETY', 'ECONOMY', 'FINANCE', 'PRODUCT', 'SERVICE', 'QUALITY', 'CONTROL', 'PROCESS', 'PROJECT',
                'NETWORK', 'SUPPORT', 'CONTENT', 'WEBSITE', 'DIGITAL', 'MACHINE', 'FACTORY', 'LIBRARY', 'KITCHEN', 'BEDROOM',
                'GENERAL', 'SPECIAL', 'CURRENT', 'POPULAR', 'SERIOUS', 'PRIVATE', 'PERFECT', 'NATURAL', 'CENTRAL', 'MEDICAL'
            ],
            8: [
                'COMPUTER', 'LANGUAGE', 'BUSINESS', 'QUESTION', 'BUILDING', 'HOSPITAL', 'SECURITY', 'INDUSTRY', 'RESEARCH', 'ANALYSIS',
                'STANDARD', 'FUNCTION', 'PLATFORM', 'DATABASE', 'SOFTWARE', 'HARDWARE', 'INTERNET', 'DOCUMENT', 'CUSTOMER', 'EMPLOYEE',
                'TRAINING', 'LEARNING', 'TEACHING', 'PLANNING', 'STRATEGY', 'SOLUTION', 'DECISION', 'LOCATION', 'POSITION', 'RESOURCE',
                'NATIONAL', 'PERSONAL', 'PHYSICAL', 'CHEMICAL', 'ORIGINAL', 'OFFICIAL', 'CRITICAL', 'TERMINAL', 'EXTERNAL', 'INTERNAL'
            ],
            12: [
                'ORGANIZATION', 'CONSTRUCTION', 'RELATIONSHIP', 'PROFESSIONAL', 'NEIGHBORHOOD', 'INTRODUCTION', 'CONVERSATION', 'PRESENTATION',
                'DISTRIBUTION', 'CONTRIBUTION', 'REGISTRATION', 'APPRECIATION', 'COMMUNICATION', 'TRANSPORTATION', 'ADMINISTRATION', 'INVESTIGATION',
                'CONCENTRATION', 'DEMONSTRATION', 'RECOMMENDATION', 'UNDERSTANDING', 'ENTERTAINMENT', 'INTERNATIONAL', 'ENVIRONMENTAL', 'TECHNOLOGICAL',
                'EXPERIMENTAL', 'PSYCHOLOGICAL', 'PHILOSOPHICAL', 'ARCHAEOLOGICAL', 'MATHEMATICAL', 'GEOGRAPHICAL', 'ASTRONOMICAL', 'ECONOMICAL'
            ]
        };
    }

    async initializeService() {
        console.log('Initializing WordService...');
        // Test APIs properly
        await this.benchmarkAPIs();
    }

    async benchmarkAPIs() {
        console.log('Testing APIs...');
        
        // Test Wordnik API
        try {
            const response = await fetch(
                'https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&minLength=5&maxLength=5&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5',
                { 
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.word) {
                    this.preferredAPI = 'wordnik';
                    console.log('Wordnik API working, word:', data.word);
                    return;
                }
            }
        } catch (error) {
            console.log('Wordnik API failed:', error.message);
        }

        // Test Random Words API
        try {
            const response = await fetch('https://random-words-api.vercel.app/word');
            if (response.ok) {
                const data = await response.json();
                if (data && data[0] && data[0].word) {
                    this.preferredAPI = 'random-words';
                    console.log('Random Words API working, word:', data[0].word);
                    return;
                }
            }
        } catch (error) {
            console.log('Random Words API failed:', error.message);
        }

        console.log('All APIs failed, using fallback words only');
        this.preferredAPI = null;
    }

    async getRandomWord(length = 5) {
        console.log(`Getting random word of length ${length}`);
        
        // Try API first if available
        if (this.preferredAPI) {
            try {
                const word = await this.getWordFromAPI(length);
                if (word && word.length === length) {
                    console.log('Got word from API:', word);
                    return word.toUpperCase();
                }
            } catch (error) {
                console.log('API call failed:', error.message);
            }
        }

        // Use fallback
        const fallbackWord = this.getFallbackWord(length);
        console.log('Using fallback word:', fallbackWord);
        return fallbackWord;
    }

    async getWordFromAPI(length) {
        if (this.preferredAPI === 'wordnik') {
            return await this.getWordFromWordnik(length);
        } else if (this.preferredAPI === 'random-words') {
            return await this.getWordFromRandomWords(length);
        }
        throw new Error('No API available');
    }

    async getWordFromWordnik(length) {
        const response = await fetch(
            `https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&minLength=${length}&maxLength=${length}&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5`,
            { 
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`Wordnik API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.word;
    }

    async getWordFromRandomWords(length) {
        // This API doesn't support length filtering, so we'll try multiple times
        for (let i = 0; i < 5; i++) {
            const response = await fetch('https://random-words-api.vercel.app/word');
            
            if (!response.ok) {
                throw new Error(`Random Words API error: ${response.status}`);
            }
            
            const data = await response.json();
            if (data[0] && data[0].word && data[0].word.length === length) {
                return data[0].word;
            }
        }
        
        throw new Error('No suitable word found from Random Words API');
    }

    getFallbackWord(length) {
        const words = this.fallbackWords[length] || this.fallbackWords[5];
        return words[Math.floor(Math.random() * words.length)].toUpperCase();
    }

    async isValidWord(word) {
        if (!word || typeof word !== 'string') {
            return false;
        }

        const upperWord = word.toUpperCase();
        
        // Check caches first
        if (this.validWordCache.has(upperWord)) {
            return true;
        }
        if (this.invalidWordCache.has(upperWord)) {
            return false;
        }

        // For non-5-letter words, be more lenient
        if (word.length !== 5) {
            const isValid = /^[A-Z]+$/.test(upperWord) && upperWord.length > 2;
            if (isValid) {
                this.validWordCache.add(upperWord);
            }
            return isValid;
        }

        // For 5-letter words, try API validation
        try {
            const response = await fetch(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
            );
            
            const isValid = response.ok;
            
            // Cache result
            if (isValid) {
                this.validWordCache.add(upperWord);
            } else {
                this.invalidWordCache.add(upperWord);
            }
            
            return isValid;
        } catch (error) {
            // Fallback to local validation
            return this.validateWordLocally(upperWord);
        }
    }

    validateWordLocally(word) {
        // Check if it's in our fallback words or looks valid
        const allFallbackWords = Object.values(this.fallbackWords).flat();
        return allFallbackWords.includes(word) || /^[A-Z]{3,}$/.test(word);
    }
}

// Create global instance
const wordService = new WordService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordService;
}
