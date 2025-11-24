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
    
    if (sizeSpan) {
      sizeSpan.style.opacity = '0';
      sizeSpan.style.transition = 'opacity 0.5s ease-in';
      sizeSpan.textContent = fileInfo.sizeFormatted;
      setTimeout(() => sizeSpan.style.opacity = '1', 100);
    }
    if (uploadedSpan) {
      uploadedSpan.style.opacity = '0';
      uploadedSpan.style.transition = 'opacity 0.5s ease-in';
      
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
      setTimeout(() => uploadedSpan.style.opacity = '1', 100);
    }
    if (downloadsSpan) {
      downloadsSpan.style.opacity = '0';
      downloadsSpan.style.transition = 'opacity 0.5s ease-in';
      downloadsSpan.textContent = fileInfo.downloads;
      setTimeout(() => downloadsSpan.style.opacity = '1', 100);
    }
  });
}

// Track download when clicked
async function trackDownload(filename) {
  try {
    console.log('Tracking download for:', filename);
    const response = await fetch(`${TSMA_API_URL}/api/download/${encodeURIComponent(filename)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true, // Keep connection alive even if page unloads
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Download tracked successfully:', data);
      return true;
    } else {
      console.error('Failed to track download:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error tracking download:', error);
    // Fallback: use sendBeacon if fetch fails (browser navigation)
    try {
      const url = `${TSMA_API_URL}/api/download/${encodeURIComponent(filename)}`;
      const blob = new Blob(['{}'], { type: 'application/json' });
      const sent = navigator.sendBeacon(url, blob);
      console.log('Beacon sent:', sent);
      return sent;
    } catch (beaconError) {
      console.error('Beacon also failed:', beaconError);
      return false;
    }
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
  
  // Auto-load related mods if container exists
  const relatedModsContainer = document.getElementById('related-mods-container');
  if (relatedModsContainer) {
    loadRelatedMods(); // Will auto-detect mod ID from URL
  }
});

// Enhance existing download click handler to track downloads
document.addEventListener('click', async function(e) {
  if (e.target.classList.contains('download-trigger') || e.target.closest('.download-trigger')) {
    const btn = e.target.classList.contains('download-trigger') ? e.target : e.target.closest('.download-trigger');
    
    // Get the download URL first
    const downloadUrl = btn.dataset.url || btn.getAttribute('href');
    
    if (downloadUrl && downloadUrl !== '#') {
      // Prevent default to stop immediate navigation
      e.preventDefault();
      e.stopPropagation();
      
      // Extract filename from URL (decode URI to get actual filename)
      let filename;
      try {
        const urlObj = new URL(downloadUrl);
        filename = decodeURIComponent(urlObj.pathname.split('/').pop());
      } catch (err) {
        // Fallback to data-name if URL parsing fails
        filename = btn.dataset.name;
      }
      
      if (filename) {
        // Track the download and wait for it
        console.log('Download button clicked, tracking:', filename);
        await trackDownload(filename);
        
        // Now allow the download to proceed
        console.log('Opening download URL:', downloadUrl);
        window.location.href = downloadUrl;
      }
    }
  }
}, true); // Use capture phase to run before other handlers

// Auto-detect mod ID from URL
function getModIdFromUrl() {
  const path = window.location.pathname;
  const match = path.match(/\/([^\/]+)\.html$/);
  return match ? match[1] : null;
}

// Load and display related mods with caching
async function loadRelatedMods(modId) {
  const container = document.getElementById('related-mods-container');
  
  if (!container) return;
  
  // Auto-detect mod ID if not provided
  if (!modId) {
    modId = getModIdFromUrl();
    if (!modId) return;
  }
  
  // Check localStorage cache first
  const cacheKey = `related_mods_${modId}`;
  const cachedData = localStorage.getItem(cacheKey);
  
  if (cachedData) {
    try {
      const cached = JSON.parse(cachedData);
      // Check if cache is less than 1 hour old
      if (Date.now() - cached.timestamp < 3600000) {
        renderRelatedMods(cached.data, container);
        return;
      }
    } catch (e) {
      // Invalid cache, continue to fetch
    }
  }
  
  // No loading state - container stays empty until data arrives
  try {
    const response = await fetch(`${TSMA_API_URL}/api/related/${encodeURIComponent(modId)}`);
    
    if (!response.ok) {
      console.error('Failed to fetch related mods');
      return;
    }
    
    const data = await response.json();
    
    if (!data.relatedMods || data.relatedMods.length === 0) {
      return;
    }
    
    // Cache the data
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: data.relatedMods
      }));
    } catch (e) {
      // Storage quota exceeded, ignore
    }
    
    renderRelatedMods(data.relatedMods, container);
  } catch (error) {
    console.error('Error loading related mods:', error);
  }
}

// Render related mods HTML
function renderRelatedMods(relatedMods, container) {
  let html = '<div class="related-mods-section">';
  html += '<h2 class="related-mods-title">Related Mods</h2>';
  html += '<div class="related-mods-grid">';
  
  relatedMods.forEach(mod => {
    // If we're already in the same directory, just use the filename
    // e.g., if viewing trurail-simulations/csx-road-bundle.html, link to just "adriana-county-bundle.html"
    let relativeUrl = mod.url;
    
    // Extract just the filename if the URL contains a path
    if (mod.url.includes('/')) {
      relativeUrl = mod.url.split('/').pop(); // Get just the filename
    }
    
    html += `
      <a href="${relativeUrl}" class="related-mod-card">
        <div class="related-mod-image" style="background-image: url('${mod.image}');"></div>
        <div class="related-mod-content">
          <h3 class="related-mod-title">${mod.title}</h3>
        </div>
      </a>
    `;
  });
  
  html += '</div></div>';
  container.innerHTML = html;
}
