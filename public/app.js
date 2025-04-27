// Fetching data from posts.json
fetch('https://raw.githubusercontent.com/WELCOMETOTHETRIBE/auto_post_dashboard/main/posts.json')
  .then(response => response.json())
  .then(data => {
    if (data.length > 0) {
      const imageUrl = data[0].image_url; // Assuming you want to display the first image
      const captionText = data[0].caption || 'No caption provided.';
      
      // Setting the image URL in the img tag
      document.getElementById('image').src = imageUrl;
      
      // Setting the caption text
      document.getElementById('caption').innerText = captionText;
    } else {
      console.error("No posts found in posts.json.");
    }
  })
  .catch(error => {
    console.error('Error fetching posts.json:', error);
  });
