import React, { useState } from 'react'
import { uploadPost } from '../services/api'

function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [formData, setFormData] = useState({
    image: null,
    caption: '',
    hashtags: '',
    product: '',
    brand: 'wttt',
    platforms: 'instagram,facebook,twitter',
    hourDelay: '0'
  })
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'image') {
      setFormData(prev => ({ ...prev, image: files[0] }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData(prev => ({ ...prev, image: e.dataTransfer.files[0] }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.image) {
      alert('Please select an image')
      return
    }

    setIsUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append('image', formData.image)
      uploadData.append('caption', formData.caption)
      uploadData.append('hashtags', formData.hashtags)
      uploadData.append('product', formData.product)
      uploadData.append('brand', formData.brand)
      uploadData.append('platforms', formData.platforms)
      uploadData.append('hourDelay', formData.hourDelay)

      const result = await uploadPost(uploadData)
      onUploadSuccess(result.post)
      handleClose()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      image: null,
      caption: '',
      hashtags: '',
      product: '',
      brand: 'wttt',
      platforms: 'instagram,facebook,twitter',
      hourDelay: '0'
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold gradient-text">Upload New Post</h2>
              <p className="text-gray-600 mt-2">Create amazing content for your social media</p>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <i className="fas fa-times text-gray-600"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload Image *
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {formData.image ? (
                  <div className="space-y-4">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg shadow-lg"
                    />
                    <p className="text-sm text-gray-600">{formData.image.name}</p>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto">
                      <i className="fas fa-cloud-upload-alt text-white text-2xl"></i>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-700">Drop your image here</p>
                      <p className="text-gray-500">or click to browse</p>
                    </div>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="btn-primary cursor-pointer inline-block"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Caption
              </label>
              <textarea
                name="caption"
                value={formData.caption}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="Write an engaging caption for your post..."
              />
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hashtags
              </label>
              <input
                type="text"
                name="hashtags"
                value={formData.hashtags}
                onChange={handleInputChange}
                className="input-field"
                placeholder="#amazing #product #viral"
              />
            </div>

            {/* Product & Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product
                </label>
                <input
                  type="text"
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Brand name"
                />
              </div>
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Platforms
              </label>
              <input
                type="text"
                name="platforms"
                value={formData.platforms}
                onChange={handleInputChange}
                className="input-field"
                placeholder="instagram,facebook,twitter"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate platforms with commas
              </p>
            </div>

            {/* Hour Delay */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Schedule Delay (hours)
              </label>
              <input
                type="number"
                name="hourDelay"
                value={formData.hourDelay}
                onChange={handleInputChange}
                className="input-field"
                min="0"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave as 0 to post immediately
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isUploading || !formData.image}
              >
                {isUploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload mr-2"></i>
                    Upload Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UploadModal
