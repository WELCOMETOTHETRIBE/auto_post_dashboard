async function fetchPosts() {
  const response = await fetch('/posts.json');
  const posts = await response.json();
  return posts;
}

async function generateCaption(keywords) {
  try {
    const response = await fetch('/api/generate-caption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Assistant API Error:', data.error);
      return 'Error generating caption.';
    }

    console.log('Assistant API Response:', data);
    return data.caption;
  } catch (error) {
    console.error('Fetch error:', error);
    return 'Error generating caption.';
  }
}

function createPostElement(post) {
  const postDiv = document.createElement('div');
  postDiv.classList.add('post');

  const img = document.createElement('img');
  img.src = post.image;
  postDiv.appendChild(img);

  const keywordsInput = document.createElement('input');
  keywordsInput.type = 'text';
  keywordsInput.placeholder = 'Enter keywords...';
  keywordsInput.value = post.keywords || '';
  postDiv.appendChild(keywordsInput);

  const captionTextarea = document.createElement('textarea');
  captionTextarea.placeholder = 'Generated caption will appear here...';
  captionTextarea.value = post.caption || '';
  postDiv.appendChild(captionTextarea);

  const generateButton = document.createElement('button');
  generateButton.textContent = 'Generate Caption';
  generateButton.onclick = async () => {
    const caption = await generateCaption(keywordsInput.value);
    captionTextarea.value = caption;
  };
  postDiv.appendChild(generateButton);

  return postDiv;
}

async function loadPosts() {
  const postsContainer = document.getElementById('posts-container');
  const posts = await fetchPosts();

  posts.forEach(post => {
    const postElement = createPostElement(post);
    postsContainer.appendChild(postElement);
  });
}

document.addEventListener('DOMContentLoaded', loadPosts);
