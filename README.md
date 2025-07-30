# Simple lightboox photo gallery with EXIF information.

A beautiful, responsive image gallery with lightbox functionality, EXIF data display, and comprehensive image protection features. Built with modern web technologies and optimized for performance.

![Gallery Preview](https://bawva.work/photos/gallery/)

## ✨ Features

### 🎨 **Visual & Layout**
- **Masonry Grid Layout** - Beautiful column-based responsive design
- **Aspect Ratio Preservation** - Thumbnails maintain correct proportions
- **Subtle Corner Radius** - Modern 8px rounded corners for image and EXIF panel
- **Smooth Animations** - Fade transitions and hover effects
- **Loading Indicators** - Individual image spinners and global overlay
- **Mobile Optimized** - Touch gestures, responsive columns, optimized padding

### ⚡ **Performance**
- **Lazy Loading** - Images load only when visible using Intersection Observer API
- **Thumbnail Optimization** - Dynamic image resizing using Canvas API
- **Efficient Rendering** - CSS columns for optimal browser performance
- **Progressive Enhancement** - Graceful fallbacks for all features

### 🔍 **Lightbox Experience**
- **PhotoSwipe Integration** - Industry-standard lightbox with zoom and pan
- **Keyboard Navigation** - Arrow keys, ESC, and other shortcuts
- **Touch Gestures** - Swipe, pinch-to-zoom, double-tap
- **Responsive Padding** - Adaptive spacing for different screen sizes
- **Portrait Image Handling** - Intelligent positioning for vertical images

### 📊 **EXIF Data Display**
- **Automatic Extraction** - Reads camera metadata from images
- **Smart Positioning** - Panel attaches seamlessly to bottom of image
- **Responsive Layout** - Flexbox grid adapts to content and screen size
- **Selective Display** - Shows Camera, Lens, Focal Length, Aperture, Shutter, ISO
- **Smooth Animations** - Fade-in effects and seamless navigation updates

### 🛡️ **Image Protection**
- **Download Prevention** - Multiple layers of protection against casual downloading
- **Right-Click Disabled** - Context menu blocking
- **Drag Protection** - Prevents image dragging and saving
- **Keyboard Shortcuts Blocked** - Disables common save/inspect shortcuts
- **Developer Tools Protection** - Blocks F12 and inspect shortcuts
- **Selection Prevention** - Disables text and image selection
- **Hotlink Protection** - Server-side protection via .htaccess
- **SEO Blocking** - Prevents search engine indexing

### 🔒 **Privacy & Security**
- **No Search Engine Indexing** - robots.txt and meta tags
- **HTTP Header Protection** - X-Robots-Tag headers
- **CORS Handling** - Proper cross-origin resource sharing
- **Console Warnings** - Visible protection status messages

## 🚀 Quick Start

### 1. Clone the Repository

### 2. Add Your Images
- Place your images in the `/images` folder
- Supported formats: JPG, JPEG, PNG, WebP
- The gallery automatically detects all images in the folder

### 3. Update Image List
Edit the `imagePaths` array in `script.js`:
```javascript
const imagePaths = [
    'your-image-1.jpg',
    'your-image-2.jpg',
    // ... add your image filenames
];
```

### 4. Configure Your Domain
Update `.htaccess` with your domain:
```apache
RewriteCond %{HTTP_REFERER} !^https?://(www\.)?yourdomain\.com [NC]
```

### 5. Serve the Files
- **Local Development**: Use a local server (Live Server, Python's http.server, etc.)
- **Production**: Upload to your web server with Apache (for .htaccess support)

## 📁 Project Structure

```
advanced-image-gallery/
├── index.html          # Main HTML structure
├── style.css           # All styling and responsive design
├── script.js           # Gallery logic and interactions
├── .htaccess          # Apache server configuration
├── robots.txt         # Search engine instructions
├── images/            # Your image files go here
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
└── README.md          # This file
```

## ⚙️ Configuration Options

### Responsive Breakpoints
Customize column counts in `style.css`:
```css
.gallery-grid { column-count: 5; }          /* Desktop */
@media (max-width: 1400px) { column-count: 4; }  /* Large tablet */
@media (max-width: 1024px) { column-count: 3; }  /* Tablet */
@media (max-width: 768px) { column-count: 2; }   /* Mobile */
```

### Thumbnail Quality
Adjust thumbnail optimization in `script.js`:
```javascript
createThumbnail(imageSrc, maxWidth = 400)  // Change 400 to desired max width
```

### PhotoSwipe Settings
Modify lightbox behavior:
```javascript
const lightbox = new PhotoSwipeLightbox({
    initialZoomLevel: 'fit',     // or 'fill', number, or function
    secondaryZoomLevel: 1.5,     // Secondary zoom level
    maxZoomLevel: 3,             // Maximum zoom
    // ... other options
});
```

## 📚 Built With & Credits

This project is built with the following amazing open-source libraries and technologies:

### 🎯 **Core Libraries**
- **[PhotoSwipe](https://photoswipe.com/)** (v5.4.4) by [Dmytro Semenov](https://github.com/dimsemenov)
  - *The most popular JavaScript image gallery and lightbox*
  - License: MIT
  - [GitHub Repository](https://github.com/dimsemenov/photoswipe)

- **[EXIF.js](https://github.com/exif-js/exif-js)** (v2.3.0) by [Jacob Seidelin](https://github.com/jseidelin)
  - *JavaScript library for reading EXIF image metadata*
  - License: MIT  
  - [GitHub Repository](https://github.com/exif-js/exif-js)

### 📸 **Sample Photos**
- **[PixelPeeper](https://pixelpeeper.com/)** - Sample photos with EXIF metadata
  - *Platform for learning photo editing from JPG metadata*
  - Sample photos used for demonstration purposes
  - **Note**: All sample photos are sourced from PixelPeeper.com. I do not hold any copyrights for these images.

## 📖 Documentation

### EXIF Data Fields
The gallery automatically extracts and displays:
- **Camera**: Make and Model (e.g., "FUJIFILM X-T3")
- **Lens**: Lens model information
- **Focal Length**: Focal length in mm
- **Aperture**: F-stop value (e.g., "f/1.4")
- **Shutter Speed**: Exposure time (e.g., "1/250s")
- **ISO**: ISO sensitivity value

### Image Protection Methods
Multiple protection layers are implemented:
1. **CSS Protection**: `user-select: none`, `user-drag: none`
2. **JavaScript Events**: `contextmenu`, `dragstart`, `selectstart` blocking
3. **Keyboard Shortcuts**: F12, Ctrl+S, Ctrl+U, etc. disabled
4. **Server Headers**: `X-Robots-Tag` via .htaccess
5. **SEO Blocking**: robots.txt and meta tags

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses
- PhotoSwipe: MIT License
- EXIF.js: MIT License

**Note:** While this project uses GPL v3.0, the third-party libraries (PhotoSwipe and EXIF.js) retain their original MIT licenses, which are compatible with GPL v3.0.

## ⚠️ Legal Note

### Image Protection
The image protection features are designed to deter casual downloading but cannot prevent determined users with technical knowledge. For sensitive content, consider additional server-side protection, watermarking, or legal measures.

### Sample Photos Copyright
**Important**: The sample photos included in this project are sourced from [PixelPeeper.com](https://pixelpeeper.com/) and are used for demonstration purposes only. I do not hold any copyrights for these images. All rights to the sample photos remain with their respective photographers and copyright holders. If you plan to use this gallery for commercial purposes, please replace the sample photos with your own images or ensure you have proper licensing for any images you use.
