// Setup keywords functionality
function setupKeywords() {
    const keywordInput = document.getElementById('keyword-input');
    const keywordsContainer = document.getElementById('keywords-tags');
    const addKeywordBtn = document.getElementById('add-keyword-btn');
    const keywordsHiddenInput = document.getElementById('keywords');
    
    if (!keywordInput || !keywordsContainer || !addKeywordBtn || !keywordsHiddenInput) {
        console.error('Keyword elements not found in the DOM');
        return;
    }
    
    // Add keyword when clicking the add button
    addKeywordBtn.addEventListener('click', addKeyword);
    
    // Add keyword when pressing Enter in the input field
    keywordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addKeyword();
        }
    });
    
    // Function to add a keyword
    function addKeyword() {
        const keyword = keywordInput.value.trim();
        
        if (keyword) {
            // Create keyword tag
            const keywordTag = document.createElement('div');
            keywordTag.className = 'keyword-tag';
            keywordTag.innerHTML = `
                <span>${keyword}</span>
                <div class="keyword-tag-remove">
                    <i class="fas fa-times"></i>
                </div>
            `;
            
            // Add remove functionality
            const removeBtn = keywordTag.querySelector('.keyword-tag-remove');
            removeBtn.addEventListener('click', function() {
                keywordTag.remove();
                updateKeywordsInput();
            });
            
            // Add to container
            keywordsContainer.appendChild(keywordTag);
            
            // Clear input
            keywordInput.value = '';
            
            // Update hidden input
            updateKeywordsInput();
            
            // Focus back on input
            keywordInput.focus();
        }
    }
    
    // Function to update the hidden input with comma-separated keywords
    function updateKeywordsInput() {
        const keywordTags = keywordsContainer.querySelectorAll('.keyword-tag span');
        const keywordList = Array.from(keywordTags).map(tag => tag.textContent);
        keywordsHiddenInput.value = keywordList.join(',');
    }
}

// Call this function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    setupKeywords();
});
