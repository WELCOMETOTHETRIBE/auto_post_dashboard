<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auto Post Dashboard</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Auto Post Dashboard</h1>
  <div id="posts-container">
    <!-- Posts will be dynamically injected here -->
  </div>
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

  <script>
    // Fetch the posts data from posts.json
    fetch('posts.json')
      .then(response => response.json())
      .then(data => {
        data.forEach((post, index) => {
          let postElement = document.createElement('div');
          postElement.classList.add('post');
          postElement.innerHTML = `
            <img src="${post.image_url}" alt="Image">
            <div>
              <label for="caption-${index}">Caption:</label>
              <input type="text" id="caption-${index}" value="${post.caption || ''}" />
            </div>
            <div>
              <label for="hashtags-${index}">Hashtags:</label>
              <input type="text" id="hashtags-${index}" value="${post.hashtags || ''}" />
            </div>
            <button onclick="generateCaption(${index})">Generate Caption</button>
          `;
          document.getElementById('posts-container').appendChild(postElement);
        });
      })
      .catch(error => console.error('Error loading posts:', error));
// Send data to the server-side /submit endpoint (Zapier proxy)
function submitToSheet(index, image_url) {
  const caption = document.getElementById(`caption-${index}`).value;
  const hashtags = document.getElementById(`hashtags-${index}`).value;
  const platform = document.getElementById(`platform-${index}`).value;
  const publish_now = document.getElementById(`publish-${index}`).checked;

    function generateCaption(index) {
      const captionInput = document.getElementById(`caption-${index}`);
      const hashtagsInput = document.getElementById(`hashtags-${index}`);
      const caption = captionInput.value;
      const hashtags = hashtagsInput.value;
  const payload = {
    image_url,
    caption,
    hashtags,
    platform,
    publish_now
  };

      // You can call the Buffer API or your AI service here to generate caption and hashtags
      console.log(`Generating caption for post ${index}: ${caption} ${hashtags}`);
    }
  </script>
</body>
</html>
  fetch('/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      alert('✅ Submitted to Zapier successfully!');
      console.log(data);
    })
    .catch(error => {
      console.error('Error submitting to sheet:', error);
      alert('❌ Error submitting to Zapier.');
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
