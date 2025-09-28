# Dynamic Blog Platform (Client-Side SPA)

A dynamic, client-side **Single Page Application (SPA)** designed as a simple blog management system.  
This application relies on a separate backend API (running on `http://localhost:5000`) for all data persistence and manipulation.

---

## 🚀 Features

- **Single Page Application (SPA):**  
  Uses client-side routing with URL hashes (`#`) for fast transitions between the post list and individual post views.  

- **CRUD Operations:**  
  Fully supports **Create, Read, Update, and Delete** actions via API calls.  

- **Plain Text Content:**  
  Standard HTML `<textarea>` inputs for content creation and editing, displaying text with preserved line breaks.  

- **Responsive Design:**  
  Styled using **Tailwind CSS** for an adaptive layout across mobile and desktop devices.  

- **Image Fallback:**  
  Includes a robust `onerror` handler to display a generic placeholder image if a provided image URL is invalid or fails to load.  

---

## 📦 Prerequisites

To run this application locally, you must have:

- A modern web browser (Chrome, Firefox, Edge, etc.)  
- A live backend API running at:  
