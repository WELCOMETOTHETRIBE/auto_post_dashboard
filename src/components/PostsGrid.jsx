import React from 'react'
import PostCard from './PostCard'

function PostsGrid({ posts, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {posts.map(post => (
        <PostCard
          key={post.token_id}
          post={post}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default PostsGrid
