// ================================
// API CONFIGURATION
// ================================
// REPLACE 'YOUR_API_KEY_HERE' WITH YOUR ACTUAL TMDB API KEY
// Get your free API key from: https://www.themoviedb.org/settings/api
const API_KEY = 'dbed69351567c2e24f34dffba1311fab'; // ← PUT YOUR API KEY HERE
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// ================================
// DOM ELEMENTS
// ================================
const moviesGrid = document.getElementById('moviesGrid');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryButtons = document.querySelectorAll('.category-btn');

// ================================
// STATE MANAGEMENT
// ================================
let currentCategory = 'popular';
let currentPage = 1;
let isLoading = false;

// ================================
// API FUNCTIONS
// ================================

/**
 * Fetches movies from TMDB API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Additional parameters
 */
async function fetchMovies(endpoint, params = {}) {
    // Validate API key
    if (API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY) {
        showError('Please add your TMDB API key in the script.js file');
        return;
    }

    try {
        showLoading();
        isLoading = true;

        const queryParams = new URLSearchParams({
            api_key: API_KEY,
            language: 'en-US',
            page: currentPage,
            ...params
        });

        const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        displayMovies(data.results);
        
    } catch (error) {
        console.error('Error fetching movies:', error);
        showError('Failed to load movies. Please check your API key and try again.');
    } finally {
        hideLoading();
        isLoading = false;
    }
}

/**
 * Fetches movies by category
 */
function fetchMoviesByCategory(category) {
    currentCategory = category;
    currentPage = 1;
    
    const endpoints = {
        popular: '/movie/popular',
        top_rated: '/movie/top_rated',
        upcoming: '/movie/upcoming',
        now_playing: '/movie/now_playing'
    };

    fetchMovies(endpoints[category]);
}

/**
 * Searches for movies
 */
function searchMovies() {
    const query = searchInput.value.trim();
    if (query) {
        currentPage = 1;
        fetchMovies('/search/movie', { query });
    } else {
        fetchMoviesByCategory(currentCategory);
    }
}

// ================================
// UI FUNCTIONS
// ================================

/**
 * Displays movies in the grid
 */
function displayMovies(movies) {
    if (!movies || movies.length === 0) {
        moviesGrid.innerHTML = '<p class="no-results">No movies found. Try a different search.</p>';
        return;
    }

    const moviesHTML = movies.map(movie => `
        <div class="movie-card" onclick="showMovieDetails(${movie.id})">
            <img 
                src="${movie.poster_path ? IMAGE_BASE_URL + movie.poster_path : 'https://via.placeholder.com/500x750/333/fff?text=No+Image'}" 
                alt="${movie.title}"
                class="movie-poster"
                loading="lazy"
            >
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-year">${movie.release_date ? movie.release_date.substring(0, 4) : 'TBA'}</p>
                <div class="movie-rating">
                    <span>⭐</span>
                    <span>${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                </div>
            </div>
        </div>
    `).join('');

    if (currentPage === 1) {
        moviesGrid.innerHTML = moviesHTML;
    } else {
        moviesGrid.innerHTML += moviesHTML;
    }
}

/**
 * Shows loading state
 */
function showLoading() {
    loading.style.display = 'block';
    errorMessage.style.display = 'none';
}

/**
 * Hides loading state
 */
function hideLoading() {
    loading.style.display = 'none';
}

/**
 * Shows error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    moviesGrid.innerHTML = '';
}

/**
 * Updates active category button
 */
function updateActiveCategory(activeCategory) {
    categoryButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === activeCategory);
    });
}

/**
 * Shows movie details (placeholder for future enhancement)
 */
function showMovieDetails(movieId) {
    alert(`Movie ID: ${movieId}\n\nThis would show detailed information about the movie.\nYou can enhance this by creating a modal or separate detail page.`);
}

// ================================
// EVENT LISTENERS
// ================================

// Category buttons
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        updateActiveCategory(category);
        fetchMoviesByCategory(category);
    });
});

// Search functionality
searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

// Infinite scroll (optional enhancement)
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 && !isLoading) {
        currentPage++;
        fetchMoviesByCategory(currentCategory);
    }
});

// ================================
// INITIALIZATION
// ================================

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchMoviesByCategory('popular');
});