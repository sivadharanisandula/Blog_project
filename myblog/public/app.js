// Set the API URL for the backend server
const API_URL = 'http://localhost:5000/posts';

// --- GLOBAL STATE & DOM REFERENCES ---------------------------------------

const postsContainer = document.getElementById('posts-container');
const postForm = document.getElementById('post-form');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const newPostContainer = document.getElementById('new-post-container');

let currentPostToDeleteId = null;
let currentPostToEditId = null;

// --- UTILITY FUNCTIONS ---------------------------------------------------

/**
 * Handles closing any modal window and clearing associated state.
 * @param {HTMLElement} modal - The modal element to close.
 */
const closeModal = (modal) => {
    modal.classList.add('hidden');
    if (modal.id === 'confirmation-modal') {
        currentPostToDeleteId = null;
    }
    if (modal.id === 'edit-modal') {
        currentPostToEditId = null;
    }
};

/**
 * Fetches data from the API and handles basic error/status checking.
 * @param {string} url - The API endpoint to fetch.
 * @param {object} options - Fetch options (method, headers, body).
 * @returns {Promise<object | null>} The JSON response data or null on error/204/404.
 */
async function apiFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (response.status === 204) return null; // No content for delete
        
        if (response.status === 404) {
            return null; // Post not found
        }
        
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorBody.message || 'Server error.'}`);
        }
        return response.json();
    } catch (error) {
        console.error('API Fetch Error:', error);
        // Only show a critical error on the main container if we are fetching the post list
        if (url === API_URL) {
             postsContainer.innerHTML = `<div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
                <p class="font-bold">Error connecting to the backend.</p>
                <p>Ensure the server is running on **http://localhost:5000**.</p>
            </div>`;
        }
        return null;
    }
}

// --- RENDERING LOGIC -----------------------------------------------------

/**
 * Renders a single post card for the list view or the full detail view.
 * @param {object} post - The post data object.
 * @param {boolean} isSingleView - Whether to render the full content (true) or a truncated preview (false).
 * @returns {string} HTML string for the post.
 */
function renderPost(post, isSingleView = false) {
    const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    // Content preparation: Content is treated as plain text from the textarea
    const contentDisplay = post.content || '';
    const plainText = contentDisplay; 
    
    let previewText;
    if (!isSingleView) {
        // Use the first 300 characters of plain text for list view preview
        previewText = plainText.substring(0, 300) + (plainText.length > 300 ? '...' : '');
    }

    // Image rendering block with robust onerror fallback (loads a placeholder if the URL fails)
    const imageHtml = post.imageUrl
        ? `
        <div class="relative overflow-hidden ${isSingleView ? 'max-h-96' : 'h-64'} w-full">
            <img src="${post.imageUrl}" alt="${post.title}" 
                onerror="this.onerror=null; this.src='https://placehold.co/800x450/eeeeee/333333?text=Image+Not+Found';"
                class="w-full h-full object-cover transition duration-300 ease-in-out hover:scale-[1.03] ${isSingleView ? 'rounded-b-none' : 'rounded-t-xl'}">
        </div>
        `
        : '';

    const actionButtons = `
        <div class="flex space-x-2 mt-4">
            <button onclick="handleEditClick(${post.id})" 
                class="px-3 py-1 text-sm font-medium text-white bg-indigo-500 rounded-md hover:bg-indigo-600 transition duration-150">
                Edit
            </button>
            <button onclick="handleDeleteClick(${post.id})"
                class="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-150">
                Delete
            </button>
        </div>
    `;

    // Full post content view
    if (isSingleView) {
        return `
            <article class="bg-white p-8 rounded-xl shadow-2xl">
                ${imageHtml}
                <h1 class="text-4xl font-extrabold text-gray-900 mt-4 mb-2">${post.title}</h1>
                <p class="text-gray-500 text-sm mb-6 border-b pb-3">
                    Author: <span class="font-semibold text-indigo-600">${post.author || 'Anonymous'}</span> | 
                    Date: ${formattedDate}
                </p>
                <!-- Use whitespace-pre-wrap class to preserve line breaks from textarea -->
                <div class="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">${contentDisplay}</div>
                ${actionButtons}
            </article>
        `;
    }

    // Post list preview card
    return `
        <article class="bg-white rounded-xl shadow-xl hover:shadow-2xl transition duration-300 overflow-hidden">
            ${imageHtml}
            <div class="p-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">${post.title}</h2>
                <p class="text-gray-500 text-sm mb-3">
                    Author: <span class="font-medium">${post.author || 'Anonymous'}</span> | 
                    Date: ${formattedDate}
                </p>
                <div class="text-gray-700 mb-4 line-clamp-3">${previewText || 'No content preview available.'}</div>
                <a href="#post/${post.id}" 
                   class="text-indigo-600 font-semibold hover:text-indigo-800 transition duration-150 mr-4">
                    Continue reading...
                </a>
                ${actionButtons}
            </div>
        </article>
    `;
}

// --- ROUTING AND CONTENT LOADING -----------------------------------------

/**
 * Main function to load content based on the URL hash (SPA routing).
 */
async function loadContent() {
    postsContainer.innerHTML = '<div class="text-center py-8 text-gray-500">Loading posts...</div>';
    const hash = window.location.hash.substring(1); // Remove '#'

    if (hash.startsWith('post/')) {
        // Single Post View
        const postId = parseInt(hash.split('/')[1]);
        if (isNaN(postId)) {
            postsContainer.innerHTML = '<div class="p-4 bg-yellow-100 text-yellow-700 rounded-lg">Invalid Post ID.</div>';
            return;
        }
        
        const post = await apiFetch(`${API_URL}/${postId}`);
        if (post) {
            postsContainer.innerHTML = renderPost(post, true);
        } else {
            postsContainer.innerHTML = '<div class="p-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-xl shadow-lg">Post Not Found. Check if the ID is correct.</div>';
        }

        // Hide the sidebar admin form for single view
        newPostContainer.classList.add('hidden');
        postsContainer.classList.remove('space-y-8'); 

    } else {
        // Homepage View (List of Posts)
        const posts = await apiFetch(API_URL);

        if (posts && posts.length > 0) {
            postsContainer.innerHTML = posts.map(post => renderPost(post, false)).join('');
        } else if (posts) { // API call successful but no posts returned
            postsContainer.innerHTML = `
                <div class="p-10 bg-white rounded-xl shadow-lg border-l-4 border-yellow-500">
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">No Posts Yet!</h2>
                    <p class="text-secondary-gray">Start your blog by using the **Create New Post** form to the right.</p>
                </div>`;
        }
        // If posts is null, apiFetch already updated the container with an error message.

        // Show the sidebar admin form for list view
        newPostContainer.classList.remove('hidden');
        postsContainer.classList.add('space-y-8');
    }
}

// --- CRUD HANDLERS -------------------------------------------------------

// --- CREATE (POST) FUNCTIONALITY ---

postForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const submitButton = document.getElementById('submit-button');
    submitButton.disabled = true;
    submitButton.textContent = 'Publishing...';

    try {
        const formData = new FormData(postForm);
        
        // Content retrieval from standard textarea
        const content = formData.get('content');

        const newPost = {
            title: formData.get('title'),
            author: formData.get('author'),
            content: content, 
            imageUrl: formData.get('imageUrl') || null 
        };

        const createdPost = await apiFetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPost)
        });

        if (createdPost) {
            // Reset UI
            postForm.reset(); 
            window.location.hash = ''; // Go to home list
            loadContent(); 
            console.log('Post published successfully:', createdPost);
        }
    } catch (e) {
        console.error('Failed to publish post.', e);
        // NOTE: Using a simple JS alert for feedback.
        alert('Failed to publish post. See console for details.');
    } finally {
         submitButton.disabled = false;
         submitButton.textContent = 'Publish Post';
    }
});


// --- DELETE FUNCTIONALITY ---

/**
 * Opens the confirmation modal for deletion (attached to window for inline use).
 * @param {number} postId - ID of the post to delete.
 */
window.handleDeleteClick = (postId) => {
    currentPostToDeleteId = postId;
    confirmationModal.classList.remove('hidden');
};

confirmDeleteBtn.addEventListener('click', async () => {
    if (currentPostToDeleteId !== null) {
        const url = `${API_URL}/${currentPostToDeleteId}`;
        const result = await apiFetch(url, { method: 'DELETE' });

        if (result === null) { // 204 No Content response
            closeModal(confirmationModal);
            window.location.hash = ''; // Go back to the home view
            loadContent();
            console.log(`Post ${currentPostToDeleteId} deleted successfully.`);
        }
    }
});


// --- UPDATE (EDIT) FUNCTIONALITY ---

/**
 * Opens the edit modal and populates it with post data (attached to window for inline use).
 * @param {number} postId - ID of the post to edit.
 */
window.handleEditClick = async (postId) => {
    const post = await apiFetch(`${API_URL}/${postId}`);
    if (!post) {
        console.error('Could not fetch post details for editing.');
        return;
    }

    currentPostToEditId = postId;

    // Populate the form fields
    document.getElementById('edit-title').value = post.title;
    document.getElementById('edit-author').value = post.author || '';
    document.getElementById('edit-imageUrl').value = post.imageUrl || ''; 
    
    // IMPORTANT: Populate the standard textarea content directly
    document.getElementById('edit-content').value = post.content || '';

    editModal.classList.remove('hidden');
};

editForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (currentPostToEditId === null) return;
    
    const submitButton = document.getElementById('edit-submit-button');
    submitButton.disabled = true;
    submitButton.textContent = 'Saving...';

    try {
        const formData = new FormData(editForm);
        
        // Content retrieval from standard textarea
        const content = formData.get('content');

        const updatedPost = {
            title: formData.get('title'),
            author: formData.get('author'),
            content: content,
            imageUrl: formData.get('imageUrl') || null 
        };

        const url = `${API_URL}/${currentPostToEditId}`;
        const result = await apiFetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedPost)
        });

        if (result) {
            closeModal(editModal);
            console.log('Changes saved successfully!');
            // Reload content to reflect updates
            // Check if the user is on a single post view and reload that, otherwise go home
            if (window.location.hash === `#post/${currentPostToEditId}`) {
                loadContent(); 
            } else {
                window.location.hash = '';
                loadContent();
            }
        }
    } catch (e) {
        console.error('Failed to save changes.', e);
        alert('Failed to save changes. See console for details.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Save Changes';
    }
});

// --- INITIALIZATION AND EVENT LISTENERS ----------------------------------

// 1. Listen for hash changes to navigate the SPA
window.addEventListener('hashchange', loadContent);

// 2. Load content on initial page load (after DOM is fully loaded)
window.addEventListener('DOMContentLoaded', loadContent);

// 3. Attach event listeners to close buttons for both modals
[editModal, confirmationModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        // Close if clicking the backdrop or an element marked data-action="cancel"
        if (e.target === modal || e.target.getAttribute('data-action') === 'cancel') {
            closeModal(modal);
        }
    });
});
