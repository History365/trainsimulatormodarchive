// TSMA API Client - Add to main.js or create separate file

const TSMA_API_URL = 'https://api.trainsimarchive.org'; // Replace with your Worker URL

// Fetch file info and update the page
async function loadFileInfo(filename) {
  try {
    const response = await fetch(`${TSMA_API_URL}/api/file-info/${encodeURIComponent(filename)}`);
    
    if (!response.ok) {
      console.error('Failed to fetch file info');
      return null;
    }
    
    const fileInfo = await response.json();
    return fileInfo;
  } catch (error) {
    console.error('Error loading file info:', error);
    return null;
  }
}

// Update file details on page
async function updateFileDetails(filename, targetSelector = '.file-details-box') {
  const fileInfo = await loadFileInfo(filename);
  
  if (!fileInfo) return;
  
  // Update all elements with file details - look for the container or within it
  const containers = document.querySelectorAll(targetSelector);
  
  containers.forEach(container => {
    // Find and update the display elements inside the file box
    const sizeSpan = container.querySelector('[data-file-size]');
    const uploadedSpan = container.querySelector('[data-file-uploaded]');
    const downloadsSpan = container.querySelector('[data-file-downloads]');
    
    if (sizeSpan) sizeSpan.textContent = fileInfo.sizeFormatted;
    if (uploadedSpan) {
      // Use relative time for recent uploads, then switch to date
      const now = new Date();
      const uploadDate = new Date(fileInfo.uploaded);
      const hoursDiff = Math.floor((now - uploadDate) / (1000 * 60 * 60));
      const daysDiff = Math.floor(hoursDiff / 24);
      
      let displayText;
      if (hoursDiff < 24) {
        displayText = fileInfo.uploadedAgo; // "X hours ago"
      } else if (daysDiff === 1) {
        displayText = 'yesterday';
      } else if (daysDiff < 7) {
        displayText = `${daysDiff} days ago`;
      } else {
        // Format as date for older uploads
        displayText = uploadDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      uploadedSpan.textContent = displayText;
    }
    if (downloadsSpan) downloadsSpan.textContent = fileInfo.downloads;
  });
}

// Track download when clicked
async function trackDownload(filename) {
  try {
    await fetch(`${TSMA_API_URL}/api/download/${encodeURIComponent(filename)}`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error tracking download:', error);
  }
}

// Track page view
async function trackPageView() {
  try {
    const pagePath = window.location.pathname;
    await fetch(`${TSMA_API_URL}/api/pageview/${encodeURIComponent(pagePath)}`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

// Initialize file info loading on page load
document.addEventListener('DOMContentLoaded', function() {
  // Track page view
  trackPageView();
  
  // Find all file-details-box containers with data-name attribute
  const fileBoxes = document.querySelectorAll('.file-details-box[data-name]');
  
  fileBoxes.forEach(box => {
    const filename = box.dataset.name;
    if (filename) {
      // Load file info for this file
      updateFileDetails(filename, `.file-details-box[data-name="${filename}"]`);
    }
  });
});

// Enhance existing download click handler to track downloads
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('download-trigger') || e.target.closest('.download-trigger')) {
    const btn = e.target.classList.contains('download-trigger') ? e.target : e.target.closest('.download-trigger');
    const filename = btn.dataset.name;
    
    if (filename) {
      // Track the download
      trackDownload(filename);
    }
  }
}, true); // Use capture phase to run before other handlers
