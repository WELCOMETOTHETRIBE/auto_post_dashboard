import React from 'react'

function PostCard({ post, onEdit, onDelete }) {
  const imageUrl = post.image_url || post.imageUrl || ''
  const caption = post.caption || 'No caption'
  const isPosted = post.status === 'posted'
  const hashtagCount = (post.hashtags || '').split(' ').filter(tag => tag.trim()).length

  return (
    <div className="card group">
      <div className="relative">
        <img 
          src={imageUrl} 
          alt="Post image" 
          className="w-full h-48 object-cover" 
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isPosted ? (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Posted
            </span>
          ) : (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Active
            </span>
          )}
        </div>
        
        {/* Delete Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onDelete(post.token_id)
          }}
          className="absolute top-3 left-3 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600"
        >
          <i className="fas fa-times text-sm"></i>
        </button>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
      </div>
      
      <div className="p-4">
        <p className="text-gray-900 text-sm line-clamp-2 mb-3">
          {caption}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <i className="fas fa-hashtag mr-1"></i>
            <span>{hashtagCount} tags</span>
          </div>
          
          <button 
            onClick={() => onEdit(post)}
            className="btn-secondary text-xs"
          >
            <i className="fas fa-edit mr-1"></i>
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

export default PostCard
