// API service for Tribe SPA

const API_BASE = window.location.origin

export const fetchPosts = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/git/posts`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    // API returns array directly, not wrapped in object
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    // No mock fallback in production
    return []
  }
}

export const deletePost = async (tokenId) => {
  const response = await fetch(`${API_BASE}/api/delete-post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token_id: tokenId })
  })

  if (!response.ok) {
    throw new Error(`Failed to delete post: ${response.status}`)
  }

  return response.json()
}

export const uploadPost = async (formData) => {
  const response = await fetch(`${API_BASE}/api/upload-image`, {
    method: 'POST',
    body: formData // FormData with file and other fields
  })

  if (!response.ok) {
    throw new Error(`Failed to upload post: ${response.status}`)
  }

  return response.json()
}

export const generateAICaption = async (imageUrl, description = '') => {
  const response = await fetch(`${API_BASE}/api/generate-caption`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl, description })
  })

  if (!response.ok) {
    throw new Error(`Failed to generate caption: ${response.status}`)
  }

  return response.json()
}

export const generateAIHashtags = async (caption = '', description = '') => {
  const response = await fetch(`${API_BASE}/api/generate-hashtags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ caption, description })
  })

  if (!response.ok) {
    throw new Error(`Failed to generate hashtags: ${response.status}`)
  }

  return response.json()
}

export const submitToZapier = async (postData) => {
  const response = await fetch(`${API_BASE}/api/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData)
  })

  if (!response.ok) {
    throw new Error(`Failed to submit to Zapier: ${response.status}`)
  }

  return response.json()
}
