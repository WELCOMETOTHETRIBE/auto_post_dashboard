async function fetchPosts() {
  try {
    const response = await fetch('/posts.json');
    const posts = await response.json();
    displayPosts(posts);
  } catch (error) {
    console.error('Failed to load posts:', error);
  }
}

function displayPosts(posts) {
  const container = document.getElementById('posts-container');
  container.innerHTML = '';

  posts.forEach((post, index) => {
    const card = document.createElement('div');
    card.className = 'post-card';

    card.innerHTML = `
      <img src="${post.image}" alt="Post Image" class="post-image" />
      <div class="form-group">
        <label for="keywords-${index}">📝 Keywords (for AI caption generation):</label>
        <input type="text" id="keywords-${index}" placeholder="Enter keywords..." />
      </div>
      <div class="form-group">
        <button onclick="generateCaption(${index})">✨ Generate Caption</button>
      </div>
      <div class="form-group">
        <label for="caption-${index}">🖋️ Final Caption:</label>
        <textarea id="caption-${index}" rows="3" placeholder="Generated caption will appear here..."></textarea>
      </div>
    `;

    container.appendChild(card);
  });
}

async function generateCaption(postIndex) {
  const keywordInput = document.getElementById(`keywords-${postIndex}`);
  const prompt = keywordInput.value.trim();

  if (!prompt) {
    alert('❗ Please enter some keywords before generating a caption.');
    return;
  }

  try {
    const response = await fetch('/api/generate-caption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    console.log('Assistant API Response:', data);

    if (data.caption) {
      document.getElementById(`caption-${postIndex}`).value = data.caption;
    } else {
      alert('❌ Failed to generate caption. Try again.');
    }
  } catch (error) {
    console.error('Assistant API Error:', error);
    alert('⚡ Error generating caption.');
  }
}

// Load posts immediately
fetchPosts();
