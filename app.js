async function fetchPosts() {
  const response = await fetch('posts.json');
  const posts = await response.json();
  return posts;
}

async function updatePost(index, updatedPost) {
  console.log("Simulated saving updated post:", updatedPost);
  // In a full version, this would update your backend/database
}

async function generateCaption(index) {
  const keywordsInput = document.getElementById(`keywords-${index}`);
  const captionField = document.getElementById(`caption-${index}`);
  const hashtagsField = document.getElementById(`hashtags-${index}`);
  const keywords = keywordsInput.value.trim();

  if (!keywords) {
    alert('Please enter some keywords first.');
    return;
  }

  captionField.value = "⏳ Generating caption...";
  hashtagsField.value = "⏳ Generating hashtags...";

  try {
    // 🔥 Fetch the OpenAI API Key from your key.json file
    const keyRes = await fetch('/api/key');
    const keyData = await keyRes.json();
    const OPENAI_API_KEY = keyData.key;

    // 🔥 Now call OpenAI with the user's keywords
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a social media copywriter. Based on given keywords, write a short, engaging Instagram caption and 5 related hashtags."
          },
          {
            role: "user",
            content: `Keywords: ${keywords}\n\nWrite a caption and hashtags.`
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI Error:", data.error);
      captionField.value = "❌ Error generating caption.";
      hashtagsField.value = "❌ Error.";
      return;
    }

    const output = data.choices[0].message.content;
    const parts = output.split("Hashtags:");

    captionField.value = parts[0].trim();
    hashtagsField.value = (parts[1] || "").trim();

    await updatePost(index, {
      caption: captionField.value,
      hashtags: hashtagsField.value
    });

  } catch (error) {
    console.error(error);
    captionField.value = "❌ Error generating caption.";
    hashtagsField.value = "❌ Error.";
  }
}

function renderPosts(posts) {
  const postsContainer = document.getElementById('posts');
  postsContainer.innerHTML = '';

  posts.forEach((post, index) => {
    const postElement = document.createElement('div');
    postElement.className = 'post';

    postElement.innerHTML = `
      <img src="${post['Image URL']}" alt="Post Image">
      <input type="text" id="keywords-${index}" placeholder="Enter keywords..." class="keywords-input">
      <button onclick="generateCaption(${index})">Generate Caption</button>
      <textarea id="caption-${index}" placeholder="Caption...">${post.Caption || ''}</textarea>
      <textarea id="hashtags-${index}" placeholder="Hashtags...">${post.Hashtags || ''}</textarea>
      <p>Status: ${post.Status}</p>
    `;

    postsContainer.appendChild(postElement);
  });
}

// Initialize dashboard
fetchPosts().then(renderPosts);
