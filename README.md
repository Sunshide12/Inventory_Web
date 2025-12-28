# 📦 Inventory Management System

A modern, full-featured inventory management system built with vanilla JavaScript and Supabase. This Single Page Application (SPA) provides real-time product and category management with an intuitive dashboard interface.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-4ECDC4?style=flat&logo=supabase&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat&logo=bootstrap&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)

## ✨ Features

### 🔐 Authentication & Security
- **User Registration** with email verification
- **Secure Login** with Supabase Auth
- **Session Management** with automatic authentication checks
- **Protected Routes** ensuring only authenticated users can access the dashboard

### 📊 Dashboard & Analytics
- **Real-time Statistics**:
  - Total products count
  - Total inventory value
  - Low stock alerts
  - Available products overview
- **Dynamic Data Visualization** with live updates
- **Responsive Design** optimized for all screen sizes

### 🛍️ Product Management
- **Full CRUD Operations** (Create, Read, Update, Delete)
- **Product Search** with real-time filtering
- **Stock Management** with inline editing
- **Category Association** for organized product classification
- **Status Indicators** (Available/Low Stock/Out of Stock)
- **Client-side Caching** for improved performance

### 📁 Category Management
- **Complete Category CRUD** functionality
- **Product-Category Relationships** with foreign key constraints
- **Category Validation** and error handling
- **Dynamic Dropdown Population** in product forms

### 🎨 User Interface
- **Modern Landing Page** with animated galaxy background
- **Single Page Application (SPA)** architecture for seamless navigation
- **Bootstrap 5** components for consistent styling
- **Custom Animations** and transitions
- **Responsive Layout** that works on desktop, tablet, and mobile devices

### 🎵 Interactive Elements
- **Background Music** control with YouTube integration
- **Volume Slider** with smooth animations
- **Animated GIF** integration for enhanced user experience

## 🛠️ Technologies Used

- **Frontend:**
  - Vanilla JavaScript (ES6+)
  - HTML5
  - CSS3 (Custom animations and responsive design)
  - Bootstrap 5.3.2
  - Bootstrap Icons

- **Backend & Database:**
  - Supabase (PostgreSQL database)
  - Supabase Auth (Authentication)
  - Supabase JavaScript Client

- **Architecture:**
  - Single Page Application (SPA)
  - Modular JavaScript architecture
  - Client-side caching
  - RESTful API integration

## 📁 Project Structure

```
proyecto/
├── CSS/
│   ├── auth.css          # Authentication page styles
│   ├── dashboard.css     # Dashboard styles
│   └── landing.css        # Landing page styles with animations
├── JS/
│   ├── Auth/
│   │   ├── auth.js        # Core authentication functions
│   │   ├── login.js       # Login page logic
│   │   └── register.js   # Registration page logic
│   ├── Config/
│   │   └── supabaseClient.js  # Supabase client configuration
│   └── Dashboard/
│       ├── dashboard.js       # Main dashboard orchestration
│       ├── dashboardStats.js  # Statistics calculation
│       ├── productos.js      # Product management logic
│       └── categorias.js      # Category management logic
├── Views/
│   ├── Auth/
│   │   ├── login.html         # Login page
│   │   ├── register.html      # Registration page
│   │   └── verificado.html    # Email verification page
│   └── Dashboard/
│       └── dashboard.html      # Main dashboard interface
├── index.html                 # Landing page
└── README.md                  # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A Supabase account and project
- Node.js (optional, for local development server)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sunshide12/inventory-management-system.git
   cd inventory-management-system
   ```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Create the following tables in your Supabase SQL editor:

   ```sql
   -- Products table
   CREATE TABLE products (
     id BIGSERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     description TEXT,
     price DECIMAL(10, 2) NOT NULL,
     stock INTEGER NOT NULL DEFAULT 0,
     category_id BIGINT REFERENCES categories(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Categories table
   CREATE TABLE categories (
     id BIGSERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT NOT NULL UNIQUE,
     description TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security (RLS)
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

   -- Create policies for products
   CREATE POLICY "Users can view their own products"
     ON products FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own products"
     ON products FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own products"
     ON products FOR UPDATE
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own products"
     ON products FOR DELETE
     USING (auth.uid() = user_id);

   -- Create policies for categories
   CREATE POLICY "Users can view their own categories"
     ON categories FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own categories"
     ON categories FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own categories"
     ON categories FOR UPDATE
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own categories"
     ON categories FOR DELETE
     USING (auth.uid() = user_id);
   ```

3. **Configure Supabase Client**
   - Open `JS/Config/supabaseClient.js`
   - Replace the `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your project credentials:
   ```javascript
   const SUPABASE_URL = "your-project-url";
   const SUPABASE_ANON_KEY = "your-anon-key";
   ```

4. **Run the Application**
   - Option 1: Use a local development server
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server -p 8000
     ```
   - Option 2: Open `index.html` directly in your browser (some features may be limited)

5. **Access the Application**
   - Navigate to `http://localhost:8000` (or your chosen port)
   - Register a new account or log in with existing credentials

## 💻 Usage

### Landing Page
- Visit the landing page to learn about the system's features
- Click "Get Started" to navigate to the login page

### Authentication
1. **Register**: Create a new account with email, password, username, and phone
2. **Verify Email**: Check your email and click the verification link
3. **Login**: Use your credentials to access the dashboard

### Dashboard
- **View Statistics**: See real-time inventory statistics on the main dashboard
- **Navigate Sections**: Use the sidebar to switch between Products, Categories, and Dashboard

### Product Management
- **Add Products**: Click "Add Product" to create new inventory items
- **Edit Products**: Click the edit icon to modify product details
- **Delete Products**: Click the delete icon to remove products
- **Search Products**: Use the search bar to filter products in real-time
- **Manage Stock**: Click the stock edit button to update inventory quantities

### Category Management
- **Add Categories**: Create product categories for better organization
- **Edit Categories**: Update category names and descriptions
- **Delete Categories**: Remove unused categories (products will be unlinked)

## 🎯 Key Features in Detail

### Real-time Search
The product search feature uses debouncing (300ms delay) to optimize performance and provide instant filtering as you type.

### Client-side Caching
Products and categories are cached in memory to reduce API calls and improve response times.

### Inline Stock Editing
Quick stock updates without opening a modal, with visual feedback and validation.

### Responsive Design
The application adapts seamlessly to different screen sizes, from mobile phones to large desktop displays.

## 🔒 Security Features

- **Row Level Security (RLS)**: Database policies ensure users can only access their own data
- **Email Verification**: New users must verify their email before accessing the system
- **Session Management**: Automatic session validation and logout functionality
- **Input Validation**: Client and server-side validation for all user inputs

## 🚧 Future Enhancements

- [ ] Export inventory data to CSV/Excel
- [ ] Barcode scanning integration
- [ ] Multi-language support
- [ ] Advanced reporting and analytics
- [ ] Product image uploads
- [ ] Inventory alerts via email
- [ ] Mobile app version
- [ ] Dark/Light theme toggle
- [ ] Product history and audit logs
- [ ] Bulk operations for products
- [ ] Advanced filtering and sorting
- [ ] Data backup and restore functionality

## 📸 Screenshots

> **Note**: Add screenshots of your application here to showcase the UI and features.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Sunshide12**

- GitHub: [@Sunshide12](https://github.com/Sunshide12)
<!-- - Portfolio: [] -->

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend infrastructure
- [Bootstrap](https://getbootstrap.com) for the UI components
- [Bootstrap Icons](https://icons.getbootstrap.com) for the icon set

---

⭐ If you found this project helpful, please consider giving it a star!
