#Dynamic Blog Platform (Client-Side SPA)
This project is a dynamic, client-side Single Page Application (SPA) designed to function as a simple blog management system. It relies on a separate backend API (required to run on http://localhost:5000) for all data persistence and manipulation.

##Features
This application provides a complete content management workflow using standard web technologies (HTML, Tailwind CSS, and vanilla JavaScript).

Single Page Application (SPA): Uses client-side routing based on URL hashes (#) for fast transitions between the post list and individual post views.

CRUD Operations: Fully supports Create, Read (list/detail), Update, and Delete actions via API calls.

Plain Text Content: Uses standard HTML <textarea> inputs for content creation and editing, displaying text with preserved line breaks.

Responsive Design: Styled using Tailwind CSS for an adaptive layout across mobile and desktop devices.

Image Fallback: Includes a robust onerror handler to display a generic placeholder image if a provided image URL is invalid or fails to load.

##Prerequisites
To run this application locally, you must have the following running on your machine:

A Modern Web Browser (Chrome, Firefox, Edge, etc.)

A Live Backend API: This front-end requires a running backend service exposed at: http://localhost:5000/posts.

The backend must support standard RESTful endpoints (GET, POST, PUT, DELETE).

##Local Setup & Running
Since this is a client-side application, setup is very simple.

Clone the Repository:

git clone [YOUR-REPO-URL]
cd dynamic-blog

Start the Backend: Ensure your companion backend API service is running on http://localhost:5000.

Launch the Front-end: Simply open the index.html file directly in your web browser.

Note: Because the application makes live fetch requests to localhost:5000, opening the file directly should work. If you encounter CORS issues, you may need to serve the file using a simple local server (e.g., Python's http.server or Node's serve).

##Important Deployment Note
If you deploy this front-end to a live hosting service like GitHub Pages (where the domain is public, e.g., https://myuser.github.io/blog-app/), the application will not work initially because it is still configured to look for the API at http://localhost:5000.

To make the deployed application functional, you MUST perform these steps:

Deploy your Backend API to a public domain (e.g., using Render, Vercel, or a similar cloud provider).

Update app.js: Change the value of API_URL to the public domain of your live backend.

// In app.js
const API_URL = '[https://your-live-backend-url.com/posts](https://your-live-backend-url.com/posts)'; 

Commit and Push this change to your repository.
