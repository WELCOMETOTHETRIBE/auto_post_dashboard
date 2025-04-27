const postsContainer = document.getElementById('posts-container');

async function fetchPosts() {
  try {
    const response = await fetch('posts.json');
    const posts = await response.json();
    displayPosts(posts);
  } catch (error) {
    console.error('Error loading posts:', error);
  }
}

function updateMetaTags(caption, imageUrl, hashtags) {
  document.getElementById('meta-og-title').setAttribute('content', caption);
  document.getElementById('meta-og-image').setAttribute('content', imageUrl);
  document.getElementById('meta-og-description').setAttribute('content', hashtags.join(' '));
}

function displayPosts(posts) {
  posts.forEach((post, index) => {
    const postCard = document.createElement('div');
    postCard.classList.add('post-card');

    const img = document.createElement('img');
    img.src = post.imageUrl;
    img.alt = 'Draft Image';

    const captionTextarea = document.createElement('textarea');
    captionTextarea.placeholder = "Enter caption...";
    captionTextarea.value = post.caption || "";

    const hashtagsTextarea = document.createElement('textarea');
    hashtagsTextarea.placeholder = "Enter hashtags...";
    hashtagsTextarea.value = post.hashtags ? post.hashtags.join(' ') : "";

    const generateBtn = document.createElement('button');
    generateBtn.textContent = "Generate Caption";
    generateBtn.addEventListener('click', async () => {
      await generateCaption(post.imageUrl, captionTextarea, hashtagsTextarea);
      updateMetaTags(captionTextarea.value, post.imageUrl, hashtagsTextarea.value.split(' '));
    });

    const saveBtn = document.createElement('button');
    saveBtn.textContent = "Save Changes";
    saveBtn.addEventListener('click', () => {
      updateMetaTags(captionTextarea.value, post.imageUrl, hashtagsTextarea.value.split(' '));
      alert('Changes saved for Buffer share!');
    });

    postCard.appendChild(img);
    postCard.appendChild(captionTextarea);
    postCard.appendChild(hashtagsTextarea);
    postCard.appendChild(generateBtn);
    postCard.appendChild(saveBtn);

    postsContainer.appendChild(postCard);
  });
}

async function generateCaption(imageUrl, captionTextarea, hashtagsTextarea) {
  try {
    const response = await fetch('/api/generate-caption', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl })
    });

    const data = await response.json();
    console.log(data);

    if (data.choices && data.choices[0]) {
      const messageContent = JSON.parse(data.choices[0].message.content);
      captionTextarea.value = messageContent.caption;
      hashtagsTextarea.value = messageContent.hashtags.join(' ');
    } else {
      captionTextarea.value = "Error generating caption.";
    }
  } catch (error) {
    console.error('OpenAI Error:', error);
    captionTextarea.value = "Error generating caption.";
  }
}

fetchPosts();
