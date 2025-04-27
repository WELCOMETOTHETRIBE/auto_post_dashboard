const sheetUrl = './posts.json'; // Local JSON file

async function fetchPosts() {
  try {
    const response = await fetch(sheetUrl);
    const posts = await response.json();
    renderPosts(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

function renderPosts(posts) {
  const container = document.getElementById('posts');
  container.innerHTML = '';

  posts.forEach((post, index) => {
    if (!post['Image URL']) return;

    const postDiv = document.createElement('div');
    postDiv.className = "post";

    postDiv.innerHTML = `
      <img src="${post['Image URL']}" alt="Post Image" class="post-image">
      <div class="post-content">
        <div class="status-badge">${post['Status'] || 'Draft'}</div>
        <p class="caption">${post['Caption'] || ''}</p>
        <p class="hashtags">${post['Hashtags'] || ''}</p>

        <div class="platforms">
          <input type="checkbox" id="insta-${index}">
          <label for="insta-${index}">Instagram</label>

          <input type="checkbox" id="fb-${index}">
          <label for="fb-${index}">Facebook</label>

          <input type="checkbox" id="linkedin-${index}">
          <label for="linkedin-${index}">LinkedIn</label>

          <input type="checkbox" id="twitter-${index}">
          <label for="twitter-${index}">X (Twitter)</label>
        </div>

        <button class="save-button" onclick="savePlatforms(${index})">Save Platforms</button>
      </div>
    `;

    container.appendChild(postDiv);
  });
}

function savePlatforms(index) {
  const platforms = [];
  if (document.getElementById(`insta-${index}`).checked) platforms.push("Instagram");
  if (document.getElementById(`fb-${index}`).checked) platforms.push("Facebook");
  if (document.getElementById(`linkedin-${index}`).checked) platforms.push("LinkedIn");
  if (document.getElementById(`twitter-${index}`).checked) platforms.push("X");

  alert(`Platforms selected for Post ${index + 1}: ${platforms.join(', ')}`);

  // 🔥 TODO NEXT: Hook into Zapier / Webhook to automate posting
}

// Load posts immediately
fetchPosts();

