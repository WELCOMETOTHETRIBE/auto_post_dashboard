document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('post-container');

  // Load visible posts
  const res = await fetch('/posts.json');
  const posts = await res.json();
  const visiblePosts = posts.filter(post => post.status !== 'hidden');

  visiblePosts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.setAttribute('data-image-url', post.image_url);

    const captionText = post.caption || '';
    const hashtagsText = post.hashtags || '';

    card.innerHTML = `
      <img src="${post.image_url}" class="post-image" />
      <textarea class="caption-input" placeholder="Caption...">${captionText}</textarea>
      <textarea class="hashtag-input" placeholder="#hashtags...">${hashtagsText}</textarea>
      <button class="generate-btn">Generate</button>
      <button class="post-now-btn">POST NOW</button>
    `;

    const captionInput = card.querySelector('.caption-input');
    const hashtagInput = card.querySelector('.hashtag-input');

    // === GENERATE button ===
    card.querySelector('.generate-btn').addEventListener('click', async () => {
      try {
        const captionRes = await fetch('/api/generate-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: captionInput.value })
        });
        const { caption } = await captionRes.json();
        captionInput.value = caption;

        const hashtagRes = await fetch('/api/generate-hashtags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caption })
        });
        const { hashtags } = await hashtagRes.json();
        hashtagInput.value = hashtags;
      } catch (err) {
        alert('⚠️ Error generating content.');
        console.error(err);
      }
    });

    // === POST NOW button ===
    card.querySelector('.post-now-btn').addEventListener('click', async () => {
      try {
        const response = await fetch('/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: post.image_url,
            post_text: captionInput.value,
            caption: captionInput.value,
            hashtags: hashtagInput.value,
            platform: post.platform || '',
            publish_now: true
          })
        });

        const data = await response.json();

        if (data.status === 'ok') {
          console.log(`✅ Submitted post for ${post.image_url}`);
          card.remove(); // Remove card from view
        } else {
          alert(`❌ Submission failed: ${data.message}`);
          console.error(data.message);
        }
      } catch (err) {
        alert('❌ Error submitting post.');
        console.error(err);
      }
    });

    container.appendChild(card);
  });
});
