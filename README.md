# Fuelmywork - Creator Support Platform

A modern web platform that connects creators with supporters, enabling direct financial support without intermediaries. Built with Next.js, MongoDB, and integrated with Razorpay for seamless payments.

## 🚀 Features

### For Creators
- **Profile Management**: Complete profile setup with bio, social links, and payment methods
- **Payment Integration**: Secure UPI and Razorpay integration for receiving payments
- **Dashboard Analytics**: Track supporters, payments, and profile completion
- **Payment Verification**: Manual verification system for received payments
- **Social Media Integration**: Connect Twitter, Instagram, YouTube, and website links

### For Supporters
- **Creator Discovery**: Search and discover creators by username
- **Direct Support**: Send financial support directly to creators
- **Multiple Payment Options**: UPI, credit/debit cards via Razorpay
- **Payment Tracking**: View payment history and status

### Technical Features
- **Authentication**: NextAuth.js with GitHub OAuth and email/password
- **Database**: MongoDB with optimized queries and indexing
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Image Handling**: Profile and banner image upload with cropping
- **Security**: Encrypted storage of sensitive payment data
- **Real-time Updates**: Dynamic content updates and notifications

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **Payments**: Razorpay Integration
- **UI Components**: Radix UI, Shadcn/ui
- **Image Processing**: React Image Crop
- **Notifications**: Sonner Toast
- **Icons**: Lucide React

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| \`MONGODB_URI\` | MongoDB connection string | Yes |
| \`NEXTAUTH_URL\` | Your app's URL | Yes |
| \`NEXTAUTH_SECRET\` | NextAuth secret key | Yes |
| \`GITHUB_ID\` | GitHub OAuth client ID | No |
| \`GITHUB_SECRET\` | GitHub OAuth client secret | No |
| \`NEXT_PUBLIC_RAZORPAY_KEY_ID\` | Razorpay public key | Yes |
| \`RAZORPAY_KEY_SECRET\` | Razorpay secret key | Yes |
| \`ENCRYPTION_KEY\` | 32-character encryption key | Yes |

## 🗄️ Database Schema

### Users Collection
\`\`\`javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  username: String (unique),
  password: String (hashed),
  bio: String,
  profileImage: String,
  bannerImage: String,
  socialLinks: {
    website: String,
    twitter: String,
    instagram: String,
    youtube: String
  },
  paymentMethods: {
    upiId: String,
    razorpayId: String (encrypted),
    razorpaySecret: String (encrypted)
  },
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Supporters Collection
\`\`\`javascript
{
  _id: ObjectId,
  creatorId: ObjectId,
  supporterName: String,
  supporterEmail: String,
  amount: Number,
  message: String,
  paymentId: String,
  paymentMethod: String,
  status: String, // 'pending', 'verified', 'failed'
  createdAt: Date,
  verifiedAt: Date
}
\`\`\`

## 🚦 API Routes

### Authentication
- \`POST /api/auth/[...nextauth]\` - NextAuth.js authentication

### User Management
- \`GET /api/user/profile\` - Get user profile
- \`PUT /api/user/profile\` - Update user profile
- \`GET /api/user/profile-by-username\` - Get profile by username
- \`POST /api/user/check-username\` - Check username availability

### Creator Features
- \`GET /api/creator/stats\` - Get creator statistics
- \`GET /api/creator/pending-payments\` - Get pending payments
- \`POST /api/creator/verify-payment\` - Verify a payment

### Payments
- \`POST /api/create-payment\` - Create Razorpay payment order
- \`POST /api/verify-payment\` - Verify payment completion
- \`POST /api/add-supporter\` - Add supporter after payment

### Search
- \`GET /api/search-creators\` - Search creators by username


## 🔐 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **Data Encryption**: AES-256-CBC for sensitive payment data
- **CSRF Protection**: Built-in NextAuth.js CSRF protection
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API route protection (recommended for production)


## 🧪 Testing

### Test User Credentials
After running the setup script, you can use these credentials:
- **Email**: test@fuelmywork.com
- **Password**: testpassword123

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Razorpay](https://razorpay.com/) for payment processing
- [MongoDB](https://www.mongodb.com/) for the database
- [Vercel](https://vercel.com/) for hosting and deployment

---

**Made with ❤️ for creators and supporters worldwide**
