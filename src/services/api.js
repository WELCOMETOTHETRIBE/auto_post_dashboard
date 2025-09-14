// API service for Tribe SPA

const API_BASE = window.location.origin

export const fetchPosts = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/git/posts`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.posts || []
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    // Fallback to mock data
    try {
      const response = await fetch(`${API_BASE}/posts.json`)
      const data = await response.json()
      return data || []
    } catch (fallbackError) {
      console.error('Failed to fetch fallback posts:', fallbackError)
      return []
    }
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

export const submitToZapier = async (postData) => {
  const response = await fetch(`${API_BASE}/api/submit-to-zapier`, {
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
