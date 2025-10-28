# REST Test 2.0 - A Modern API Client

Project Demo - [https://resttest2.netlify.app/](https://resttest2.netlify.app/)

This is a fork of the wonderful project https://github.com/jeroen/resttesttest

A simple, fast, and modern web API client for making HTTP requests and inspecting responses. This project is a complete refactor of a legacy application, now built with a cutting-edge tech stack including React, Vite, and Tailwind CSS.

## 🚀 About the Project

This project was born from the need to modernize an internal API testing tool. The goal was to create a robust, high-performance codebase with an excellent developer experience, ready for future expansion and open source contributions.

### ✨ Main Features

- **Multiple HTTP Methods:** Full support for GET, POST, PUT, DELETE, PATCH, and more.
- **Resizable Panels:** Layout inspired by professional tools like Postman and Insomnia, with adjustable request and response panels.
- **Tabbed Interface:** Organize request details (Parameters, Authentication, Headers) and response (Body, Headers) in intuitive tabs.
- **Flexible Authentication:** Integrated support for:
  - Basic Auth
  - Bearer Token
  - API Key in Headers
- **File Uploads:** Support for `multipart/form-data` requests.
- **Syntax Highlighting:** Pleasant, colorful visualization for JSON responses.
- **Save and Load Requests:** Store your most used requests in the browser's `localStorage` for easy reuse.
- **Environment System:** Define variables like `{{baseUrl}}` to reuse in different contexts (development, production, etc.).
- **Collection Management:** Organize your requests into workspaces and collections for better structure.
- **Request History:** Keep an automatic log of requests with detailed statistics.
- **Proxy Settings:** Work around CORS limitations with support for different proxy types.

### 🛠️ Built With

- **[React](https://reactjs.org/)** - The library for building user interfaces.
- **[TypeScript](https://www.typescriptlang.org/)** - For safer, more maintainable code.
- **[Vite](https://vitejs.dev/)** - Extremely fast build tool.
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for modern, customizable styling.
- **[Axios](https://axios-http.com/)** - HTTP client for making requests.
- **[React Resizable Panels](https://react-resizable-panels.com/)** - For resizable layout panels.
- **[React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)** - For JSON syntax highlighting.

## 🏁 Getting Started

To get a local copy of the project running, follow these simple steps.

### Prerequisites

You need Node.js and npm (or yarn/pnpm) installed on your machine.

- [Node.js](https://nodejs.org/)

### Installation

1.  Clone the repository:
    ```sh
    git clone [https://github.com/Qiua/resttesttest.git](https://github.com/Qiua/resttesttest.git)
    ```
2.  Navigate to the project folder:
    ```sh
    cd resttesttest
    ```
3.  Install dependencies:
    ```sh
    npm install
    ```
4.  Start the development server:
    ```sh
    npm run dev
    ```
    The app will be available at `http://localhost:5173` (or the port shown in your terminal).

## 🗺️ Roadmap

We have lots of ideas for the future! Feel free to pick one and contribute.

- [x] ~~Implement a "Collections" system to group requests.~~
- [x] ~~Add environment management (e.g., development, production).~~
- [x] ~~Create a recent request history.~~
- [x] ~~Implement workspace system for organization.~~
- [x] ~~Add support for proxy/CORS settings.~~
- [x] ~~Create import/export data system.~~
- [x] ~~Implement internationalization (i18n) - Portuguese/English.~~
- [x] ~~Add tab system for multiple requests.~~
- [x] ~~Implement light/dark themes.~~
- [x] ~~Add confirmation and notification modals.~~
- [ ] Support for more authentication types (e.g., OAuth 2.0).
- [ ] Improve visualization for other response types (HTML, XML).
- [ ] Implement automated request tests.
- [ ] Add automatic API documentation.
- [ ] Create templates for common requests.
- [ ] New demonstration video.

### 📖 Additional Documentation

- [**Environment Guide**](ENVIRONMENTS.md) - How to use the variable and environment system
- [**Proxy Guide**](CORS-PROXY-GUIDE.md) - Proxy configuration to work around CORS

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contribution you make will be **very welcome**.

If you have a suggestion to improve the project, please fork the repository and create a pull request. You can also simply open an issue with the "enhancement" tag.

1.  **Fork** the project.
2.  Create your **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your changes (`git commit -m 'Add AmazingFeature'`).
4.  **Push** to the branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.

## 📄 License

Distributed under the GPL-3.0-or-later License. See `LICENSE.txt` for more information.

---
