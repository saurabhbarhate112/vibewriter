document.addEventListener('DOMContentLoaded', function() {
    const apiKeyModal = document.getElementById('api-key-modal');
    const apiKeyForm = document.getElementById('api-key-form');
    const apiKeyInput = document.getElementById('api-key');
    const toggleApiKeyBtn = document.getElementById('toggle-api-key');
    const rememberKeyCheckbox = document.getElementById('remember-key');
    const articleForm = document.getElementById('article-form');
    const topicInput = document.getElementById('topic');
    const lengthSelect = document.getElementById('length');
    const toneSelect = document.getElementById('tone');
    const humanlikeSlider = document.getElementById('humanlike');
    const sliderValue = document.querySelector('.slider-value');
    const generateBtn = document.querySelector('.generate-btn');
    const btnText = document.querySelector('.btn-text');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const articleOutput = document.getElementById('article-output');
    const articleTitle = document.getElementById('article-title');
    const articleContent = document.getElementById('article-content');
    const wordCount = document.getElementById('word-count');    const readTime = document.getElementById('read-time');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const currentYearEl = document.getElementById('current-year');
    // Keywords elements
    const keywordInput = document.getElementById('keyword-input');
    const keywordsContainer = document.getElementById('keywords-tags');
    const addKeywordBtn = document.getElementById('add-keyword-btn');
    const keywordsHiddenInput = document.getElementById('keywords');    // API key state
    let geminiApiKey = '';
    
    // Update current year in footer
    currentYearEl.textContent = new Date().getFullYear();

    // Initialize UI
    humanlikeSlider.addEventListener('input', function() {
        sliderValue.textContent = this.value;
    });
    
    // Check for saved API key
    function initializeApp() {
        const savedApiKey = localStorage.getItem('geminiApiKey');
        
        if (savedApiKey) {
            // Use the saved API key
            geminiApiKey = savedApiKey;
            
            // Validate the saved API key before proceeding
            validateApiKey(savedApiKey)
                .then(isValid => {
                    if (isValid) {
                        showNotification('API key loaded successfully', 'success');
                        addApiStatusToHeader(true);
                    } else {
                        // If validation fails, clear the invalid key and show modal
                        clearApiKey();
                        showApiKeyModal();
                        showNotification('Saved API key is no longer valid', 'error');
                    }
                })
                .catch(() => {
                    // If there's an error checking the key (e.g., network issues)
                    // Still use the saved key but show a warning
                    showNotification('Using saved API key, but validation failed', 'warning');
                    addApiStatusToHeader(true);
                });
        } else {
            // Show API key modal if no key is saved
            showApiKeyModal();
        }
    }
    
    // Validate API key
    async function validateApiKey(apiKey) {
        try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1/models?key=' + apiKey);
            return response.ok;
        } catch (error) {
            console.error('API key validation error:', error);
            return false;
        }
    }
    
    // Show API key modal
    function showApiKeyModal() {
        apiKeyModal.classList.add('visible');
    }
    
    // Hide API key modal
    function hideApiKeyModal() {
        apiKeyModal.classList.remove('visible');
    }
    
    // Add API status indicator to header
    function addApiStatusToHeader(isConnected) {
        const logoContainer = document.querySelector('.logo-container');
        
        // Remove existing API settings if any
        const existingApiSettings = document.querySelector('.api-settings');
        if (existingApiSettings) {
            existingApiSettings.remove();
        }
        
        // Create API settings element
        const apiSettings = document.createElement('div');
        apiSettings.className = 'api-settings';
        apiSettings.innerHTML = `
            <div class="api-status ${isConnected ? 'connected' : 'disconnected'}"></div>
            <span>API ${isConnected ? 'Connected' : 'Disconnected'}</span>
        `;
        
        // Add dropdown menu for API settings
        const apiSettingsDropdown = document.createElement('div');
        apiSettingsDropdown.className = 'api-settings-dropdown';
        apiSettingsDropdown.innerHTML = `
            <ul>
                <li id="change-api-key"><i class="fas fa-key"></i> Change API Key</li>
                <li id="test-api-connection"><i class="fas fa-vial"></i> Test Connection</li>
                <li id="clear-api-key"><i class="fas fa-trash-alt"></i> Clear API Key</li>
            </ul>
        `;
        
        apiSettings.appendChild(apiSettingsDropdown);
        logoContainer.appendChild(apiSettings);
        
        // Add event listener to toggle dropdown
        apiSettings.addEventListener('click', function(e) {
            if (!e.target.closest('.api-settings-dropdown')) {
                apiSettingsDropdown.classList.toggle('visible');
            }
        });
        
        // Add event listeners for dropdown options
        document.getElementById('change-api-key').addEventListener('click', function() {
            showApiKeyModal();
            apiSettingsDropdown.classList.remove('visible');
        });
        
        document.getElementById('test-api-connection').addEventListener('click', function() {
            testApiConnection();
            apiSettingsDropdown.classList.remove('visible');
        });
        
        document.getElementById('clear-api-key').addEventListener('click', function() {
            clearApiKey();
            apiSettingsDropdown.classList.remove('visible');
        });
    }
    
    // Test API connection
    function testApiConnection() {
        if (!geminiApiKey) {
            showNotification('No API key provided', 'error');
            return;
        }
        
        showNotification('Testing API connection...', 'info');
        
        // Simple test call to Gemini API
        fetch('https://generativelanguage.googleapis.com/v1/models?key=' + geminiApiKey)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('API connection failed with status: ' + response.status);
                }
            })
            .then(data => {
                showNotification('API connection successful!', 'success');
                addApiStatusToHeader(true);
            })
            .catch(error => {
                console.error('API test failed:', error);
                showNotification('API connection failed: ' + error.message, 'error');
                addApiStatusToHeader(false);
            });
    }
    
    // Clear API key
    function clearApiKey() {
        geminiApiKey = '';
        localStorage.removeItem('geminiApiKey');
        showNotification('API key cleared', 'info');
        addApiStatusToHeader(false);
    }
    
    // Toggle API key visibility
    toggleApiKeyBtn.addEventListener('click', function() {
        const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
        apiKeyInput.setAttribute('type', type);
        
        const icon = toggleApiKeyBtn.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
    
    // API key form submission
    apiKeyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            apiKeyInput.classList.add('shake');
            setTimeout(() => {
                apiKeyInput.classList.remove('shake');
            }, 500);
            return;
        }
        
        // Test the API key first
        const saveBtn = apiKeyForm.querySelector('.generate-btn');
        saveBtn.classList.add('loading');
        
        fetch('https://generativelanguage.googleapis.com/v1/models?key=' + apiKey)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Invalid API key');
                }
            })
            .then(data => {                // Save API key
                geminiApiKey = apiKey;
                if (rememberKeyCheckbox.checked) {
                    // Store the API key securely
                    try {
                        localStorage.setItem('geminiApiKey', apiKey);
                        console.log('API key saved to local storage');
                    } catch (storageError) {
                        console.error('Failed to save API key to local storage:', storageError);
                        showNotification('API key will not be remembered between sessions', 'warning');
                    }
                }
                
                // Update UI
                hideApiKeyModal();
                showNotification('API key saved successfully!', 'success');
                addApiStatusToHeader(true);
                saveBtn.classList.remove('loading');
            })
            .catch(error => {
                console.error('API key validation failed:', error);
                showNotification('Invalid API key: ' + error.message, 'error');
                saveBtn.classList.remove('loading');
                apiKeyInput.classList.add('shake');
                setTimeout(() => {
                    apiKeyInput.classList.remove('shake');
                }, 500);
            });
    });    // Form submission
    articleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!geminiApiKey) {
            showApiKeyModal();
            showNotification('Please set your Gemini API key first', 'error');
            return;
        }
        
        // Show loading state
        generateBtn.classList.add('loading');
        
        // Get form values
        const topic = topicInput.value.trim();
        const articleLength = lengthSelect.value;
        const tone = toneSelect.value;
        const humanlike = humanlikeSlider.value;
        const keywords = keywordsHiddenInput.value;
        
        // Call AI API to generate content
        generateArticle(topic, articleLength, tone, humanlike, keywords)
            .then(content => {
                displayArticle(topic, content);
                generateBtn.classList.remove('loading');
            })
            .catch(error => {
                console.error('Error generating article:', error);
                generateBtn.classList.remove('loading');
                articleContent.innerHTML = `<div class="error-message">
                    <p><i class="fas fa-exclamation-circle"></i> Sorry, there was an error generating your article. Please try again.</p>
                    <p class="error-details">${error.message}</p>
                </div>`;
                showOutputSection();
            });
    });

    // Copy button functionality
    copyBtn.addEventListener('click', function() {
        const articleText = articleContent.innerText;
        navigator.clipboard.writeText(articleText)
            .then(() => {
                showNotification('Article copied to clipboard!');
                
                // Visual feedback
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                showNotification('Failed to copy article', 'error');
            });
    });

    // Download button functionality
    downloadBtn.addEventListener('click', function() {
        const articleText = articleContent.innerText;
        const topic = topicInput.value.trim();
        const fileName = topic.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-article.txt';
        
        const blob = new Blob([articleText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
        
        showNotification('Article downloaded!');
    });    // Generate article using Gemini API
    async function generateArticle(topic, length, tone, humanlike, keywords) {
        // Show that we're waiting for a response
        showOutputSection();
        articleContent.innerHTML = '<div class="loading-message"><p>Generating your article...</p><div class="dots-loading"><span></span><span></span><span></span></div></div>';
        
        // Create the prompt for Gemini
        const prompt = createPrompt(topic, length, tone, humanlike, keywords);
        
        // Call Gemini API to generate content
        try {
            const temperature = getTemperature(humanlike);
            const maxTokens = getMaxTokens(length);
            
            // Make the API request to Gemini
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: temperature,
                        maxOutputTokens: maxTokens,
                        topP: 0.9,
                        topK: 40
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to generate content');
            }
            
            const data = await response.json();
            
            // Extract the generated text from the response
            if (data.candidates && data.candidates.length > 0 && 
                data.candidates[0].content && 
                data.candidates[0].content.parts && 
                data.candidates[0].content.parts.length > 0) {
                
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('No content generated');
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }// Create a prompt based on user inputs
    function createPrompt(topic, length, tone, humanlike, keywords) {
        let wordCount;
        switch(length) {
            case 'short': wordCount = 300; break;
            case 'medium': wordCount = 600; break;
            case 'long': wordCount = 1000; break;
            case 'detailed': wordCount = 1500; break;
            default: wordCount = 600;
        }
        
        const humanFactor = parseInt(humanlike) / 10; // 0.1 to 1.0
        
        let prompt = `Write a well-structured ${wordCount}-word article about "${topic}" in a ${tone} tone. 
        The writing should ${humanFactor > 0.7 ? 'sound natural and human-like' : 'be clear and concise'}.`;
        
        // Add keywords if provided
        if (keywords && keywords.trim() !== '') {
            const keywordsList = keywords.split(',').map(k => k.trim()).filter(k => k);
            if (keywordsList.length > 0) {
                prompt += `\n\nPlease naturally incorporate the following keywords throughout the article: ${keywordsList.join(', ')}.`;
            }
        }
        
        prompt += `\n\nUse markdown formatting:
        - Use # for main heading, ## for subheadings, and ### for smaller headings
        - Use **bold** for important points
        - Use bullet points (* item) for lists where appropriate
        - Separate paragraphs with blank lines
        
        The article should have:
        1. An engaging introduction
        2. Well-organized body paragraphs with subheadings
        3. A concise conclusion
        
        Make the content engaging, informative, and well-structured with approximately ${wordCount} words.`;
        
        return prompt;
    }

    // Get appropriate max tokens based on length
    function getMaxTokens(length) {
        switch(length) {
            case 'short': return 512;
            case 'medium': return 1024;
            case 'long': return 2048;
            case 'detailed': return 3072;
            default: return 1024;
        }
    }

    // Get temperature setting based on humanlike factor
    function getTemperature(humanlike) {
        // Higher values (0.7-1.0) for more creative/human-like text
        // Lower values (0.1-0.5) for more deterministic/structured text
        return 0.3 + (parseInt(humanlike) / 10) * 0.7; // Range from 0.3 to 1.0
    }

    // Display the generated article
    function displayArticle(topic, content) {
        // Update the title
        articleTitle.textContent = formatTitle(topic);
        
        // Format and set the content
        articleContent.innerHTML = formatArticleContent(content);
        
        // Calculate and set word count
        const words = content.split(/\s+/).filter(word => word.length > 0);
        const count = words.length;
        wordCount.textContent = `${count} words`;
        
        // Calculate read time (average reading speed: 200 words per minute)
        const minutes = Math.ceil(count / 200);
        readTime.textContent = `${minutes} min read`;
        
        // Show the output section
        showOutputSection();
    }

    // Show the output section with animation
    function showOutputSection() {
        articleOutput.classList.remove('hidden');
        setTimeout(() => {
            articleOutput.classList.add('visible');
        }, 10);
    }

    // Format the article title
    function formatTitle(topic) {
        return topic.charAt(0).toUpperCase() + topic.slice(1);
    }    // Format article content with proper HTML for WYSIWYG editor
    function formatArticleContent(content) {
        // Normalize line breaks first
        let formattedContent = content.trim().replace(/\r\n/g, '\n');
        
        // Ensure content starts with a proper paragraph
        if (!formattedContent.startsWith('#') && !formattedContent.startsWith('<')) {
            // Find the first paragraph break or heading
            const firstBreak = formattedContent.search(/\n\s*\n|\n\s*#/);
            if (firstBreak > 0) {
                // Wrap the first paragraph in <p> tags
                const firstPara = formattedContent.substring(0, firstBreak);
                const rest = formattedContent.substring(firstBreak);
                formattedContent = '<p>' + firstPara + '</p>' + rest;
            } else {
                // If no paragraph breaks, wrap the whole content
                formattedContent = '<p>' + formattedContent + '</p>';
            }
        }
        
        // Replace code blocks with pre tags
        formattedContent = formattedContent.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
        
        // Format headings (e.g., # Heading 1, ## Heading 2) - more strict matching
        formattedContent = formattedContent.replace(/^\s*### (.*?)$/gm, '<h3>$1</h3>');
        formattedContent = formattedContent.replace(/^\s*## (.*?)$/gm, '<h2>$1</h2>');
        formattedContent = formattedContent.replace(/^\s*# (.*?)$/gm, '<h1>$1</h1>');
        
        // Format bold text
        formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Format lists
        formattedContent = formattedContent.replace(/^\s*\* (.*?)$/gm, '<li>$1</li>');
        formattedContent = formattedContent.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        
        // Replace double line breaks with paragraph breaks, but be careful not to break existing HTML
        formattedContent = formattedContent.replace(/(?<![>])\n\s*\n(?![<])/g, '</p><p>');
        
        // Make sure all text is wrapped in paragraph tags
        const paragraphWrapped = /<p>.*<\/p>/s.test(formattedContent);
        if (!paragraphWrapped) {
            formattedContent = '<p>' + formattedContent + '</p>';
        }
        
        // Clean up any empty paragraphs
        formattedContent = formattedContent.replace(/<p>\s*<\/p>/g, '');
        
        // Initialize the WYSIWYG editor after content is set
        setTimeout(() => {
            // Make sure buttons are properly set based on current content
            updateButtonStates();
        }, 100);
        
        return formattedContent;
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<p>${message}</p>`;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
      // Initialize the app
    initializeApp();
    initializeWysiwygEditor();
    setupKeywords();

    // WYSIWYG Editor functionality
    function initializeWysiwygEditor() {
        const editorButtons = document.querySelectorAll('.editor-btn');
        const editor = document.getElementById('article-content');
        
        // Add click event listeners to toolbar buttons
        editorButtons.forEach(button => {
            button.addEventListener('click', function() {
                const command = this.dataset.command;
                const value = this.dataset.value || null;
                
                if (command === 'createLink') {
                    const url = prompt('Enter the URL:');
                    if (url) document.execCommand(command, false, url);
                } else if (command === 'insertImage') {
                    const url = prompt('Enter the image URL:');
                    if (url) document.execCommand(command, false, url);
                } else {
                    document.execCommand(command, false, value);
                }
                
                // Update active state of buttons
                updateButtonStates();
            });
        });
        
        // Monitor editor selection changes to update button states
        editor.addEventListener('mouseup', updateButtonStates);
        editor.addEventListener('keyup', updateButtonStates);
        
        // Update button active states
        function updateButtonStates() {
            editorButtons.forEach(button => {
                const command = button.dataset.command;
                
                if (command === 'formatBlock') {
                    const value = button.dataset.value;
                    const formatValue = document.queryCommandValue('formatBlock');
                    button.classList.toggle('active', formatValue === value);
                } else {
                    button.classList.toggle('active', document.queryCommandState(command));
                }
            });
        }
    }
});

// Add CSS for notifications
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    background: linear-gradient(135deg, var(--gradient-1), var(--gradient-3));
    color: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1000;
}

.notification.error {
    background: linear-gradient(135deg, var(--danger), #d63031);
}

.notification.info {
    background: linear-gradient(135deg, var(--gradient-3), var(--gradient-4));
}

.notification.show {
    transform: translateY(0);
    opacity: 1;
}

.loading-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: var(--text-muted);
}

.dots-loading {
    display: flex;
    gap: 8px;
    margin-top: 1rem;
}

.dots-loading span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--primary);
    display: inline-block;
    animation: dotPulse 1.5s infinite ease-in-out;
}

.dots-loading span:nth-child(1) {
    animation-delay: 0s;
}

.dots-loading span:nth-child(2) {
    animation-delay: 0.3s;
}

.dots-loading span:nth-child(3) {
    animation-delay: 0.6s;
}

@keyframes dotPulse {
    0%, 100% {
        transform: scale(0.5);
        opacity: 0.5;
    }
    50% {
        transform: scale(1);
        opacity: 1;
    }
}

.error-message {
    padding: 1rem;
    border-left: 4px solid var(--danger);
    background-color: rgba(225, 112, 85, 0.1);
    border-radius: var(--radius-sm);
}

.error-message i {
    color: var(--danger);
    margin-right: 8px;
}

.error-details {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-muted);
}
`;
document.head.appendChild(notificationStyle);
