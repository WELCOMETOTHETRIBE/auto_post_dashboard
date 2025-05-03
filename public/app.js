// Load posts from posts.json and build the UI
fetch('posts.json')
  .then(response => response.json())
  .then(data => {
    data.forEach((post, index) => {
      const postElement = document.createElement('div');
      postElement.classList.add('post');
      postElement.innerHTML = `
        <img src="${post.image_url}" alt="Image" />
        <div>
          <label for="caption-${index}">Caption:</label>
          <input type="text" id="caption-${index}" value="${post.caption || ''}" />
        </div>
        <div>
          <label for="hashtags-${index}">Hashtags:</label>
          <input type="text" id="hashtags-${index}" value="${post.hashtags || ''}" />
        </div>
        <div>
          <label for="platform-${index}">Platform:</label>
          <select id="platform-${index}">
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="TikTok">TikTok</option>
            <option value="LinkedIn">LinkedIn</option>
          </select>
        </div>
        <div>
          <input type="checkbox" id="publish-${index}" />
          <label for="publish-${index}">Publish Now</label>
        </div>
        <div style="margin-top: 10px;">
          <button onclick="generateCaption(${index})">Generate Caption</button>
          <button onclick="submitToSheet(${index}, '${post.image_url}')">Submit to Sheet</button>
        </div>
      `;
      document.getElementById('posts-container').appendChild(postElement);
    });
  })
  .catch(error => console.error('Error loading posts:', error));

// Send data to the server-side /submit and /update-jsons endpoints
function submitToSheet(index, image_url) {
  const caption = document.getElementById(`caption-${index}`).value;
  const hashtags = document.getElementById(`hashtags-${index}`).value;
  const platform = document.getElementById(`platform-${index}`).value;
  const publish_now = document.getElementById(`publish-${index}`).checked;

  const payload = {
    image_url,
    caption,
    hashtags,
    platform,
    publish_now
  };

  // First, send to Zapier
  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      console.log('✅ Submitted to Zapier:', data);

      // Then, update local JSON files
      return fetch('/update-jsons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    })
    .then(res => res.json())
    .then(updateResponse => {
      console.log('✅ Updated JSONs:', updateResponse);
      alert('✅ Post moved to Drafts.');
      window.location.reload();
    })
    .catch(error => {
      console.error('Error submitting:', error);
      alert('❌ Submission failed.');
    });
}

// Optional: Call your OpenAI caption generator
function generateCaption(index) {
  const prompt = document.getElementById(`caption-${index}`).value || "Generate a caption";
  fetch('/api/generate-caption', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  })
    .then(res => res.json())
    .then(data => {
      if (data.caption) {
        document.getElementById(`caption-${index}`).value = data.caption;
      } else {
        alert("No caption returned.");
      }
    })
    .catch(error => {
      console.error('Error generating caption:', error);
      alert('❌ Failed to generate caption.');
    });
}
