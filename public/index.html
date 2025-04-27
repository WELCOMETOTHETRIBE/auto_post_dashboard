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

    function generateCaption(index) {
      const captionInput = document.getElementById(`caption-${index}`);
      const hashtagsInput = document.getElementById(`hashtags-${index}`);
      const caption = captionInput.value;
      const hashtags = hashtagsInput.value;

      // You can call the Buffer API or your AI service here to generate caption and hashtags
      console.log(`Generating caption for post ${index}: ${caption} ${hashtags}`);
    }
  </script>
</body>
</html>
