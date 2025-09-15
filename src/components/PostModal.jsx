import React, { useState, useEffect } from 'react'
import { generateAICaption, generateAIHashtags } from '../services/api'

function PostModal({ post, onClose, onSave, onToast }) {
  const [formData, setFormData] = useState({
    description: '',
    caption: '',
    hashtags: '',
    brand: 'wttt',
    product_type: '',
    product: '',
    website: '',
    delay: 0,
    platforms: []
  })

  useEffect(() => {
    if (post) {
      setFormData({
        description: post.description || '',
        caption: post.caption || '',
        hashtags: post.hashtags || '',
        brand: post.brand || 'wttt',
        product_type: post.product_type || '',
        product: post.product || '',
        website: post.website || '',
        delay: post.delay || 0,
        platforms: post.platforms || []
      })
    }
  }, [post])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const handleSave = () => {
    const updatedPost = { ...post, ...formData }
    onSave(updatedPost)
  }

  const handleSubmitToZapier = async () => {
    try {
      onToast('Submitting to Zapier...', 'info')
      
      const response = await fetch('/api/submit-to-zapier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...post, ...formData })
      })
      
      const data = await response.json()
      
      if (data.success) {
        onToast('Successfully submitted to Zapier!', 'success')
        onClose()
      } else {
        throw new Error(data.message || 'Failed to submit')
      }
    } catch (error) {
      console.error('Zapier submission failed:', error)
      onToast('Failed to submit to Zapier', 'error')
    }
  }

  const generateCaption = async () => {
    try {
      onToast('Generating AI caption...', 'info')
      const result = await generateAICaption(post.image_url || post.imageUrl, formData.description)
      handleInputChange('caption', result.caption || 'Check out this amazing content! 🚀')
      onToast('AI caption generated!', 'success')
    } catch (error) {
      console.error('Caption generation failed:', error)
      // Fallback to simple caption
      const description = formData.description
      const aiCaption = `Check out this amazing ${description || 'content'}! 🚀 #amazing #content #viral`
      handleInputChange('caption', aiCaption)
      onToast('Generated fallback caption', 'info')
    }
  }

  const generateHashtags = async () => {
    try {
      onToast('Generating AI hashtags...', 'info')
      const result = await generateAIHashtags(formData.caption, formData.description)
      handleInputChange('hashtags', result.hashtags || '#viral #trending #amazing #content #socialmedia')
      onToast('AI hashtags generated!', 'success')
    } catch (error) {
      console.error('Hashtag generation failed:', error)
      // Fallback to simple hashtags
      const aiHashtags = `#viral #trending #amazing #content #socialmedia #instagram #facebook #twitter #linkedin #tiktok`
      handleInputChange('hashtags', aiHashtags)
      onToast('Generated fallback hashtags', 'info')
    }
  }

  if (!post) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="glass-card w-full max-w-3xl max-h-[92vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div>
              <h2 className="text-2xl font-bold gradient-text">Edit Post</h2>
              <p className="text-gray-600 mt-1">Customize your content for social media</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/70 hover:bg-white text-gray-700 flex items-center justify-center transition-all shadow-sm"
            >
              <i className="fas fa-times text-gray-600"></i>
            </button>
          </div>
          
          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(92vh-140px)] p-6">
            
            {/* Image Preview */}
            <div className="mb-6">
              <img 
                src={post.image_url || post.imageUrl || ''} 
                alt="Post image" 
                className="w-full h-56 object-cover rounded-xl shadow-lg"
              />
            </div>
            
            {/* Form */}
            <div className="space-y-6">
              
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Image Description
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="input-field resize-none" 
                  rows="3" 
                  placeholder=""
                />
                <p className="text-xs text-gray-500 mt-1">Help AI generate better captions</p>
              </div>
              
              {/* Caption */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Caption
                </label>
                <textarea 
                  value={formData.caption}
                  onChange={(e) => handleInputChange('caption', e.target.value)}
                  className="input-field resize-none" 
                  rows="4" 
                  placeholder=""
                />
                <button 
                  onClick={generateCaption}
                  className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
                >
                  <i className="fas fa-magic mr-2"></i>
                  Generate with AI
                </button>
              </div>
              
              {/* Hashtags */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Hashtags
                </label>
                <input 
                  value={formData.hashtags}
                  onChange={(e) => handleInputChange('hashtags', e.target.value)}
                  type="text" 
                  className="input-field" 
                  placeholder="" 
                />
                <button 
                  onClick={generateHashtags}
                  className="mt-3 w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium"
                >
                  <i className="fas fa-hashtag mr-2"></i>
                  Generate Hashtags
                </button>
              </div>
              
              {/* Brand & Product */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Brand</label>
                  <select 
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="input-field"
                  >
                    <option value="wttt">WTTT</option>
                    <option value="denlys">Denly</option>
                    <option value="jabronis">Jabroni</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Product Type</label>
                  <select 
                    value={formData.product_type}
                    onChange={(e) => handleInputChange('product_type', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select type</option>
                    <option value="supplement">Supplement</option>
                    <option value="apparel">Apparel</option>
                    <option value="accessory">Accessory</option>
                    <option value="digital">Digital</option>
                    <option value="service">Service</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              {/* Product Name & Website */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Product Name</label>
                  <input 
                    value={formData.product}
                    onChange={(e) => handleInputChange('product', e.target.value)}
                    type="text" 
                    className="input-field" 
                    placeholder="Product name" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Website URL</label>
                  <input 
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    type="url" 
                    className="input-field" 
                    placeholder="https://example.com" 
                  />
                </div>
              </div>
              
              {/* Platforms */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Posting Platforms
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: 'from-purple-500 to-pink-500' },
                    { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook', color: 'bg-blue-600' },
                    { id: 'twitter', name: 'Twitter', icon: 'fab fa-twitter', color: 'bg-blue-400' },
                    { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', color: 'bg-blue-700' },
                    { id: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok', color: 'bg-black' }
                  ].map(platform => (
                    <label 
                      key={platform.id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        checked={formData.platforms.includes(platform.id)}
                        onChange={() => handlePlatformToggle(platform.id)}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center mr-3`}>
                          <i className={`${platform.icon} text-white text-sm`}></i>
                        </div>
                        <span className="font-medium">{platform.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Delay */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Posting Delay
                </label>
                <div className="flex items-center space-x-4">
                  <input 
                    value={formData.delay}
                    onChange={(e) => handleInputChange('delay', parseInt(e.target.value) || 0)}
                    type="number" 
                    min="0" 
                    max="168" 
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center" 
                  />
                  <span className="text-sm text-gray-600">hours (0 = post immediately)</span>
                </div>
              </div>
              
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-white/20 bg-white/60 backdrop-blur-sm">
            <button 
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="btn-primary"
            >
              Save Changes
            </button>
            <button 
              onClick={handleSubmitToZapier}
              className="btn-primary"
            >
              <i className="fas fa-rocket mr-2"></i>
              Submit to Zapier
            </button>
          </div>
          
        </div>
      </div>
    </div>
  )
}

export default PostModal
