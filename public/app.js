let openaiApiKey = "";
let assistantId = "";

// Fetch OpenAI API Key and Assistant ID from the server
async function fetchOpenAIKeyAndAssistant() {
    try {
        const response = await fetch('/api/key');
        const data = await response.json();
        openaiApiKey = data.key;
        assistantId = data.assistantId;
    } catch (error) {
        console.error("❌ Failed to fetch OpenAI key and Assistant ID:", error);
    }
}

// Fetch posts.json to load drafts
async function fetchPosts() {
    const response = await fetch('/posts.json');
    const data = await response.json();
    return data;
}

// Render posts on the dashboard
function renderPosts(posts) {
    const container = document.getElementById('posts-container');
    container.innerHTML = '';

    posts.forEach((post, index) => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';

        postCard.innerHTML = `
            <img src="${post.image}" alt="Post Image">
            <textarea id="keywords-${index}" class="keywords-input" placeholder="Enter keywords...">${post.keywords || ''}</textarea>
            <textarea id="caption-${index}" class="caption-input" placeholder="Caption will appear here...">${post.caption || ''}</textarea>
            <div class="platforms">
                <label><input type="checkbox" ${post.platforms?.includes('instagram') ? 'checked' : ''}> Instagram</label>
                <label><input type="checkbox" ${post.platforms?.includes('facebook') ? 'checked' : ''}> Facebook</label>
                <label><input type="checkbox" ${post.platforms?.includes('twitter') ? 'checked' : ''}> Twitter</label>
            </div>
            <div class="actions">
                <button onclick="generateCaption(${index})">Generate Caption</button>
            </div>
        `;

        container.appendChild(postCard);
    });
}

// Generate caption by sending keywords to OpenAI Assistant
async function generateCaption(index) {
    const keywordsInput = document.getElementById(`keywords-${index}`);
    const captionInput = document.getElementById(`caption-${index}`);
    const keywords = keywordsInput.value.trim();

    if (!keywords) {
        alert('Please enter some keywords first.');
        return;
    }

    try {
        const response = await fetch(`https://api.openai.com/v1/assistants/${assistantId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: {
                    text: `Create a catchy caption using these keywords: ${keywords}`
                }
            })
        });

        const data = await response.json();
        console.log("Assistant API Response:", data);

        if (data.result && data.result.text) {
            captionInput.value = data.result.text.trim();
        } else {
            captionInput.value = "❌ Error generating caption.";
        }
    } catch (error) {
        console.error("❌ OpenAI Assistant Error:", error);
        captionInput.value = "❌ Error generating caption.";
    }
}

// Initial load
async function init() {
    await fetchOpenAIKeyAndAssistant();
    const posts = await fetchPosts();
    renderPosts(posts);
}

init();
