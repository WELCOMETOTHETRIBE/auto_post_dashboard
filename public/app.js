document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('posts-container');

  // Add upload UI
  // (Handled by index.html form, so no need to duplicate here)

  // Handle upload form submission
  const uploadForm = document.getElementById('upload-form');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const input = document.getElementById('file-upload');
      if (!input.files.length) return alert('Please select file(s).');

      const formData = new FormData();
      for (const file of input.files) {
        formData.append('image', file);
      }

      try {
        const res = await fetch('/upload-image', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) throw new Error('Upload failed.');

        const result = await res.json();
        alert(`✅ Uploaded ${result.image_urls.length} file(s)!`);
        location.reload(); // Refresh to show new posts
      } catch (err) {
        console.error('Upload error:', err);
        alert('❌ Failed to upload file(s).');
      }
    });
  }

  // Load visible posts
  const res = await fetch('/posts.json');
  const posts = await res.json();
  const visiblePosts = posts.filter(post => post.status !== 'hidden');

  function isVideo(url) {
    return url.match(/\.(mp4|webm|ogg|mov|m4v|qt)$/i);
  }

  visiblePosts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'post';
    card.setAttribute('data-image-url', post.image_url);

    const captionText = post.caption || '';
    const hashtagsText = post.hashtags || '';

    // Use <video> for videos, <img> for images
    const mediaHtml = isVideo(post.image_url)
      ? `<video src="${post.image_url}" controls class="post-media" style="width:100%;height:100%;border-radius:8px;background:#e9eef6;"></video>`
      : `<img src="${post.image_url}" class="post-image" />`;

    card.innerHTML = `
      <div class="image-wrapper">
        ${mediaHtml}
      </div>
      <div>
        <label>Product</label>
        <select>
          <option value="N/A">N/A</option>
          <option value="THRIVE">THRIVE</option>
          <option value="DRIVE">DRIVE</option>
          <option value="ALIGN">ALIGN</option>
          <option value="Clusters">Clusters</option>
        </select>
      </div>
      <div>
        <label>Prompt</label>
        <textarea placeholder="Describe the image or message...">${captionText}</textarea>
      </div>
      <div>
        <label>Generated Caption</label>
        <textarea></textarea>
        <button class="fix-caption-btn">🧤 Generate Caption</button>
      </div>
      <div>
        <label>Generated Hashtags</label>
        <input type="text" value="${hashtagsText}" />
        <button class="fix-caption-btn">#️ Generate Hashtags</button>
      </div>
      <div>
        <label>Link</label>
        <input type="text" value="${post.link || ''}" />
      </div>
      <div>
        <label>Platforms</label>
        <div class="platform-buttons">
          <button type="button" class="platform-button" data-platform="Instagram">Instagram</button>
          <button type="button" class="platform-button" data-platform="Facebook">Facebook</button>
          <button type="button" class="platform-button" data-platform="LinkedIn">LinkedIn</button>
          <button type="button" class="platform-button" data-platform="X">X (Twitter)</button>
          <button type="button" class="platform-button" data-platform="Pinterest">Pinterest</button>
          <button type="button" class="platform-button" data-platform="Reddit">Reddit</button>
        </div>
        <input type="hidden" value="${post.platform || ''}" />
      </div>
      <div class="checkbox-container">
        <input type="checkbox">
        <label>Publish Now</label>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="post-now-btn">POST NOW</button>
      </div>
    `;

    const captionInput = card.querySelector('textarea');
    const hashtagsInput = card.querySelector('input[type="text"]');
    const platformInput = card.querySelector('input[type="hidden"]');
    const publishCheckbox = card.querySelector('input[type="checkbox"]');
    const promptInput = card.querySelectorAll('textarea')[0];
    const generatedCaption = card.querySelectorAll('textarea')[1];

    // --- Platform Button Active State Logic ---
    const platformButtons = card.querySelectorAll('.platform-button');
    if (platformInput.value) {
      platformButtons.forEach(btn => {
        if (btn.dataset.platform === platformInput.value) {
          btn.classList.add('active');
        }
      });
    }
    platformButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        platformButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        platformInput.value = btn.dataset.platform;
      });
    });
    // --- End Platform Button Logic ---

    card.querySelector('.fix-caption-btn').addEventListener('click', async () => {
      try {
        generatedCaption.placeholder = '⏳ Generating...';
        const captionRes = await fetch('/api/generate-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptInput.value })
        });
        const { caption } = await captionRes.json();
        generatedCaption.value = caption;

        const hashtagRes = await fetch('/api/generate-hashtags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caption })
        });
        const { hashtags } = await hashtagRes.json();
        hashtagsInput.value = hashtags;
      } catch (err) {
        alert('⚠️ Error generating content.');
        console.error(err);
      }
    });

    card.querySelector('.post-now-btn').addEventListener('click', async () => {
      try {
        const payload = {
          image_url: post.image_url,
          post_text: generatedCaption.value,
          caption: generatedCaption.value,
          hashtags: hashtagsInput.value,
          platform: platformInput.value,
          publish_now: publishCheckbox.checked,
          link: card.querySelectorAll('input[type="text"]')[1].value,
          product: card.querySelector('select').value,
          token_id: 'token_' + Math.random().toString(36).substring(2, 10)
        };

        const response = await fetch('/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.status === 'ok') {
          console.log(`✅ Submitted post for ${post.image_url}`);
          card.remove();
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
