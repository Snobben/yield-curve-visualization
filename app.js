// Main Application Controller
// Orchestrates data loading, visualization, and user controls

class YieldCurveApp {
  constructor() {
    this.dataService = new TreasuryDataService();
    this.data = null;
    this.visualization = null;
    this.isPlaying = false;
    this.currentIndex = 0;
    this.animationSpeed = 200;
    this.timeoutId = null;
    this.isScrubbing = false;
    this.wasPlayingBeforeScrub = false;

    this.initializeEventListeners();
    this.loadInitialData();
  }

  /**
   * Set up all event listeners
   */
  initializeEventListeners() {
    // Data source selection
    document.querySelectorAll('input[name="dataSource"]').forEach(radio => {
      radio.addEventListener('change', (e) => this.handleDataSourceChange(e));
    });

    // Load data button
    document.getElementById('load-data-btn')?.addEventListener('click', () => {
      this.loadDataFromAPI();
    });

    // Playback controls
    document.getElementById('play-pause-btn')?.addEventListener('click', () => {
      this.togglePlayPause();
    });

    document.getElementById('step-back-btn')?.addEventListener('click', () => {
      this.stepBack();
    });

    document.getElementById('step-forward-btn')?.addEventListener('click', () => {
      this.stepForward();
    });

    document.getElementById('restart-btn')?.addEventListener('click', () => {
      this.restart();
    });

    // Speed control
    document.getElementById('speed-select')?.addEventListener('change', (e) => {
      this.animationSpeed = parseInt(e.target.value);
      CONFIG.animationDuration = this.animationSpeed;
      if (this.isPlaying) {
        this.pause();
        this.play();
      }
    });

    // Timeline scrubber
    const timelineSlider = document.getElementById('timeline-slider');
    if (timelineSlider) {
      timelineSlider.addEventListener('input', (e) => {
        const index = parseInt(e.target.value);
        this.seekToIndex(index);
      });

      // Pause and mark as scrubbing when user grabs slider
      timelineSlider.addEventListener('mousedown', () => {
        this.isScrubbing = true;
        this.wasPlayingBeforeScrub = this.isPlaying;
        if (this.isPlaying) this.pause();
      });

      // Resume playing after scrubbing
      timelineSlider.addEventListener('mouseup', () => {
        this.isScrubbing = false;
        if (this.wasPlayingBeforeScrub) {
          this.wasPlayingBeforeScrub = false;
          this.play();
        }
      });

      // Handle case where mouse leaves while dragging
      timelineSlider.addEventListener('mouseleave', () => {
        if (this.isScrubbing) {
          this.isScrubbing = false;
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      switch(e.key) {
        case ' ':
          e.preventDefault();
          this.togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.stepBack();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.stepForward();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          this.restart();
          break;
      }
    });
  }

  /**
   * Handle data source radio button change
   */
  handleDataSourceChange(event) {
    const yearSelector = document.getElementById('year-selector');
    if (event.target.value === 'api') {
      yearSelector.style.display = 'flex';
    } else {
      yearSelector.style.display = 'none';
      this.loadInitialData();
    }
  }

  /**
   * Load initial data (CSV)
   */
  async loadInitialData() {
    this.showLoading();
    try {
      this.data = await this.dataService.loadFromCSV(CONFIG.dataSource);
      this.initializeVisualization();
      this.hideLoading();
    } catch (error) {
      this.showError('Failed to load initial data', error);
    }
  }

  /**
   * Load data from Treasury API
   */
  async loadDataFromAPI() {
    const yearSelect = document.getElementById('year-select');
    const year = parseInt(yearSelect.value);

    this.showLoading();
    this.hideError();

    try {
      this.data = await this.dataService.loadFromAPI(year);

      // Update title
      CONFIG.title = `US Treasury Yield Development - ${year}`;

      // Reinitialize visualization
      this.clearVisualization();
      this.initializeVisualization();

      this.hideLoading();
    } catch (error) {
      this.hideLoading();
      this.showError(`Failed to load data for ${year}`, error);
    }
  }

  /**
   * Initialize or reinitialize the visualization
   */
  initializeVisualization() {
    if (!this.data || this.data.length === 0) {
      this.showError('No data available', new Error('Data array is empty'));
      return;
    }

    // Clear existing visualization
    this.clearVisualization();

    // Reset state
    this.currentIndex = 0;
    this.isPlaying = false;

    // Update timeline slider
    const timelineSlider = document.getElementById('timeline-slider');
    if (timelineSlider) {
      timelineSlider.max = this.data.length - 1;
      timelineSlider.value = 0;
    }

    // Update timeline info
    this.updateTimelineInfo();

    // Create visualization with callback for animation control
    this.visualization = createVisualizationWithControls(
      this.data,
      (index) => this.onAnimationFrame(index)
    );

    // Update play/pause button
    this.updatePlayPauseButton();

    // Start playing automatically
    setTimeout(() => this.play(), 500);
  }

  /**
   * Callback for each animation frame
   */
  onAnimationFrame(index) {
    this.currentIndex = index;
    this.updateTimelineInfo();

    const timelineSlider = document.getElementById('timeline-slider');
    if (timelineSlider && !this.isScrubbing) {
      timelineSlider.value = index;
    }
  }

  /**
   * Clear the visualization
   */
  clearVisualization() {
    const svg = d3.select('#yield-curve-chart');
    svg.selectAll('*').remove();

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Play animation
   */
  play() {
    if (!this.data || this.isPlaying) return;

    this.isPlaying = true;
    this.updatePlayPauseButton();

    // Resume or start animation
    if (window.visualizationControl) {
      window.visualizationControl.play();
    }
  }

  /**
   * Pause animation
   */
  pause() {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.updatePlayPauseButton();

    if (window.visualizationControl) {
      window.visualizationControl.pause();
    }
  }

  /**
   * Toggle play/pause
   */
  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Step backward one frame
   */
  stepBack() {
    if (!this.data) return;

    this.pause();

    const newIndex = this.currentIndex > 0
      ? this.currentIndex - 1
      : this.data.length - 1;

    this.seekToIndex(newIndex);
  }

  /**
   * Step forward one frame
   */
  stepForward() {
    if (!this.data) return;

    this.pause();

    const newIndex = (this.currentIndex + 1) % this.data.length;
    this.seekToIndex(newIndex);
  }

  /**
   * Restart animation from beginning
   */
  restart() {
    this.seekToIndex(0);
    if (!this.isPlaying) {
      this.play();
    }
  }

  /**
   * Seek to specific index
   */
  seekToIndex(index) {
    if (!this.data || index < 0 || index >= this.data.length) return;

    this.currentIndex = index;

    if (window.visualizationControl) {
      window.visualizationControl.seekTo(index);
    }

    this.updateTimelineInfo();

    const timelineSlider = document.getElementById('timeline-slider');
    if (timelineSlider) {
      timelineSlider.value = index;
    }
  }

  /**
   * Update play/pause button text
   */
  updatePlayPauseButton() {
    const btn = document.getElementById('play-pause-btn');
    if (btn) {
      btn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
    }
  }

  /**
   * Update timeline info display
   */
  updateTimelineInfo() {
    if (!this.data) return;

    const currentDateEl = document.getElementById('current-date');
    const positionEl = document.getElementById('timeline-position');

    if (currentDateEl && this.data[this.currentIndex]) {
      currentDateEl.textContent = this.data[this.currentIndex].date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    if (positionEl) {
      positionEl.textContent = `${this.currentIndex + 1} / ${this.data.length}`;
    }
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    const loader = document.getElementById('loading-indicator');
    if (loader) loader.style.display = 'block';
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    const loader = document.getElementById('loading-indicator');
    if (loader) loader.style.display = 'none';
  }

  /**
   * Show error message
   */
  showError(message, error) {
    console.error(message, error);

    const errorEl = document.getElementById('error-message');
    if (errorEl) {
      errorEl.innerHTML = `
        <h3>⚠️ ${message}</h3>
        <p>${error.message}</p>
        <p style="margin-top: 10px; font-size: 12px; opacity: 0.8;">
          Check the browser console for more details.
        </p>
      `;
      errorEl.style.display = 'block';
    }

    this.hideLoading();
  }

  /**
   * Hide error message
   */
  hideError() {
    const errorEl = document.getElementById('error-message');
    if (errorEl) errorEl.style.display = 'none';
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new YieldCurveApp();
});
