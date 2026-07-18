# 🌾 Fagroo Backend

Backend REST API for the **Fagroo Agriculture Marketplace**. This application is built with **Node.js**, **Express.js**, **Firebase Authentication**, and **Cloud Firestore**. It provides secure APIs for product management, category management, buyer enquiries, and role-based admin operations.

---

## 📖 Project Overview

Fagroo is an agriculture marketplace that connects buyers and sellers.

The backend is responsible for:

- User authentication and authorization
- Product management
- Category management
- Buyer enquiry management
- Discount calculation
- Admin dashboard statistics
- Firestore database operations

---

## 🚀 Features

### Authentication

- Firebase Authentication
- Protected API routes
- Role-based authorization
- Admin-only endpoints

### Products

- View all active products
- View product details
- Add new products
- Update product information
- Delete products
- Activate/Deactivate products
- Update stock quantity
- Update discounts

### Categories

- View categories
- Add new categories

### Buyer Enquiries

- Submit product enquiries
- Generate unique enquiry reference numbers
- Validate stock availability
- View all enquiries (Admin)

### Dashboard

- Total products
- Active products
- Total enquiries

---

## 🛠️ Technologies Used

- Node.js
- Express.js
- Firebase Admin SDK
- Firebase Authentication
- Cloud Firestore
- UUID
- CORS
- Dotenv

---

## 📁 Project Structure

```
Fagroo-project-main
│
├── config
│   └── firebase.js
│
├── controllers
│   ├── adminController.js
│   ├── categoryController.js
│   ├── enquiryController.js
│   └── productController.js
│
├── middleware
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── uploadMiddleware.js
│
├── routes
│   ├── adminRoutes.js
│   ├── categoryRoutes.js
│   ├── enquiryRoutes.js
│   └── productRoutes.js
│
├── services
│   └── storageService.js
│
├── config
├── package.json
├── package-lock.json
├── index.js
└── README.md
```

---

## ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/your-username/fagroo-backend.git
```

Navigate to the project folder

```bash
cd Fagroo-project-main
```

Install dependencies

```bash
npm install
```

Start the server

```bash
npm start
```

or

```bash
node index.js
```

---

## 📦 API Endpoints

### Products

| Method | Endpoint |
|---------|----------|
| GET | `/api/products` |
| GET | `/api/products/:id` |
| POST | `/api/products/calculate` |

### Categories

| Method | Endpoint |
|---------|----------|
| GET | `/api/categories` |
| POST | `/api/categories` |

### Buyer Enquiries

| Method | Endpoint |
|---------|----------|
| POST | `/api/enquiries` |
| GET | `/api/enquiries/admin` |

### Admin

| Method | Endpoint |
|---------|----------|
| GET | `/api/admin/dashboard` |
| GET | `/api/admin/products` |
| POST | `/api/admin/products` |
| PUT | `/api/admin/products/:id` |
| PATCH | `/api/admin/products/:id/stock` |
| PATCH | `/api/admin/products/:id/discount` |
| PATCH | `/api/admin/products/:id/activate` |
| PATCH | `/api/admin/products/:id/deactivate` |
| DELETE | `/api/admin/products/:id` |

---

## 🗄️ Firestore Collections

### users

```
uid
name
email
role
```

### products

```
name
description
category
seller
location
price
discount
availableQty
minimumQty
image
active
createdAt
updatedAt
```

### categories

```
name
description
createdAt
```

### enquiries

```
referenceNumber
userId
buyerName
mobile
email
deliveryLocation
requiredQty
message
productId
productName
status
createdAt
```

---

## 🔒 Security Features

- Firebase Authentication
- JWT Token Verification
- Role-based Authorization
- Protected Admin Routes
- Server-side Input Validation
- Global Error Handling
- Backend Discount Calculation

---

## 🌐 Deployment

- **Backend:** Render
- **Database:** Cloud Firestore
- **Authentication:** Firebase Authentication

---

## 👨‍💻 Author

**Surya**



**Project Title:** Fagroo - Agriculture Marketplace

---

## 📄 License

This project is developed for educational purposes.