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
  const [isGenerating, setIsGenerating] = useState({ caption: false, hashtags: false })

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
      
      const response = await fetch('/api/submit', {
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
      setIsGenerating(prev => ({ ...prev, caption: true }))
      onToast('Generating AI caption...', 'info')
      const result = await generateAICaption(post.image_url || post.imageUrl, formData.description)
      handleInputChange('caption', result.caption || 'Check out this amazing content! 🚀')
      onToast('AI caption generated!', 'success')
    } catch (error) {
      console.error('Caption generation failed:', error)
      // No mock fallback content in production
      handleInputChange('caption', '')
      onToast('Caption generation unavailable', 'warning')
    } finally {
      setIsGenerating(prev => ({ ...prev, caption: false }))
    }
  }

  const generateHashtags = async () => {
    try {
      setIsGenerating(prev => ({ ...prev, hashtags: true }))
      onToast('Generating AI hashtags...', 'info')
      const result = await generateAIHashtags(formData.caption, formData.description)
      handleInputChange('hashtags', result.hashtags || '#viral #trending #amazing #content #socialmedia')
      onToast('AI hashtags generated!', 'success')
    } catch (error) {
      console.error('Hashtag generation failed:', error)
      // No mock fallback content in production
      handleInputChange('hashtags', '')
      onToast('Hashtag generation unavailable', 'warning')
    } finally {
      setIsGenerating(prev => ({ ...prev, hashtags: false }))
    }
  }

  if (!post) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Post</h2>
            <p className="text-gray-600 mt-1">Customize your content for social media</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200"
          >
            <i className="fas fa-times text-gray-600"></i>
          </button>
        </div>
        
        {/* Content */}
        <div className="modal-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column - Image */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Preview</h3>
                <div className="relative rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={post.image_url || post.imageUrl || ''} 
                    alt="Post image" 
                    className="w-full h-56 md:h-64 object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Image Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="form-textarea" 
                  rows="3" 
                  placeholder="Describe what you see in the image to help AI generate better content..."
                />
                <p className="form-help">Help AI generate better captions and hashtags</p>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="space-y-6">
              {/* Caption */}
              <div>
                <label className="form-label">Caption</label>
                <textarea 
                  value={formData.caption}
                  onChange={(e) => handleInputChange('caption', e.target.value)}
                  className="form-textarea" 
                  rows="4" 
                  placeholder="Write an engaging caption..."
                />
                <button 
                  onClick={generateCaption}
                  disabled={isGenerating.caption}
                  className="mt-3 w-full btn btn-secondary"
                >
                  {isGenerating.caption ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic"></i>
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
              
              {/* Hashtags */}
              <div>
                <label className="form-label">Hashtags</label>
                <input 
                  value={formData.hashtags}
                  onChange={(e) => handleInputChange('hashtags', e.target.value)}
                  type="text" 
                  className="form-input" 
                  placeholder="#hashtag1 #hashtag2" 
                />
                <button 
                  onClick={generateHashtags}
                  disabled={isGenerating.hashtags}
                  className="mt-3 w-full btn btn-secondary"
                >
                  {isGenerating.hashtags ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-hashtag"></i>
                      Generate Hashtags
                    </>
                  )}
                </button>
              </div>
              
              {/* Brand & Product */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Brand</label>
                  <select 
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="form-input"
                  >
                    <option value="wttt">WTTT</option>
                    <option value="denlys">Denly</option>
                    <option value="jabronis">Jabroni</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Product Type</label>
                  <select 
                    value={formData.product_type}
                    onChange={(e) => handleInputChange('product_type', e.target.value)}
                    className="form-input"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Product Name</label>
                  <input 
                    value={formData.product}
                    onChange={(e) => handleInputChange('product', e.target.value)}
                    type="text" 
                    className="form-input" 
                    placeholder="Product name" 
                  />
                </div>
                <div>
                  <label className="form-label">Website URL</label>
                  <input 
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    type="url" 
                    className="form-input" 
                    placeholder="https://example.com" 
                  />
                </div>
              </div>
              
              {/* Platforms */}
              <div>
                <label className="form-label">Posting Platforms</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: 'from-purple-500 to-pink-500' },
                    { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook-f', color: 'bg-blue-600' },
                    { id: 'twitter', name: 'X', icon: 'fa-brands fa-x-twitter', color: 'bg-black' },
                    { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin-in', color: 'bg-blue-700' },
                    { id: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok', color: 'bg-black' }
                  ].map(platform => (
                    <label 
                      key={platform.id}
                      className="flex items-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 select-none"
                    >
                      <input 
                        type="checkbox" 
                        checked={formData.platforms.includes(platform.id)}
                        onChange={() => handlePlatformToggle(platform.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      />
                      <div className="flex items-center">
                        <div className={`w-9 h-9 ${platform.color} rounded-lg flex items-center justify-center mr-3`}>
                          <i className={`${platform.icon} text-white text-base leading-none`}></i>
                        </div>
                        <span className="font-medium text-gray-900">{platform.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Delay */}
              <div>
                <label className="form-label">Posting Delay</label>
                <div className="flex items-center space-x-4">
                  <input 
                    value={formData.delay}
                    onChange={(e) => handleInputChange('delay', parseInt(e.target.value) || 0)}
                    type="number" 
                    min="0" 
                    max="168" 
                    className="w-20 form-input text-center" 
                  />
                  <span className="text-sm text-gray-600">hours (0 = post immediately)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="modal-footer">
          <div className="flex flex-1 flex-col-reverse sm:flex-row gap-3 justify-end">
            <button 
              onClick={onClose}
              className="btn btn-sm btn-ghost w-full sm:w-auto"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="btn btn-sm btn-secondary w-full sm:w-auto"
            >
              Save Changes
            </button>
            <button 
              onClick={handleSubmitToZapier}
              className="btn btn-sm btn-primary w-full sm:w-auto"
            >
              <i className="fas fa-paper-plane"></i>
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostModal