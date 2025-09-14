import React from 'react'

function PostCard({ post, onEdit, onDelete }) {
  const imageUrl = post.image_url || post.imageUrl || ''
  const caption = post.caption || 'No caption'
  const isPosted = post.status === 'posted'
  const hashtagCount = (post.hashtags || '').split(' ').filter(tag => tag.trim()).length

  return (
    <div className="card group cursor-pointer">
      <div className="relative overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Post image" 
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {isPosted ? (
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              <i className="fas fa-check-circle mr-1"></i>
              Posted
            </span>
          ) : (
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              <i className="fas fa-clock mr-1"></i>
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
          className="absolute top-4 left-4 w-10 h-10 bg-red-500/90 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:bg-red-600 hover:scale-110 shadow-lg"
        >
          <i className="fas fa-times text-sm"></i>
        </button>
        
        {/* Edit Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => onEdit(post)}
            className="btn-primary transform scale-90 group-hover:scale-100 transition-transform duration-300"
          >
            <i className="fas fa-edit mr-2"></i>
            Edit Post
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-gray-800 text-sm line-clamp-2 mb-4 font-medium leading-relaxed">
          {caption}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            <i className="fas fa-hashtag mr-1 text-blue-500"></i>
            <span className="font-medium">{hashtagCount} tags</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500 font-medium">Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostCard
