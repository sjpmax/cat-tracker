# 🐱 Cat Tracker

A modern web application for tracking your cats' feeding habits and basic information. Built with Vue 3, TypeScript, and Supabase.

## ✨ Features

- **User Authentication**: Secure sign-up and login with Supabase Auth
- **Cat Management**: Add and manage multiple cats with details like:
  - Name, age, weight, and color
  - Automatic size categorization based on weight
- **Feeding Tracking**: Log feeding activities with:
  - Amount of food
  - Food type (dry/wet)
  - Automatic timestamp tracking
- **Responsive Design**: Beautiful UI with Tailwind CSS and DaisyUI
- **Real-time Data**: Powered by Supabase for real-time database updates

## 🛠️ Tech Stack

- **Frontend**: Vue 3 with Composition API
- **Language**: TypeScript
- **Styling**: Tailwind CSS with DaisyUI components
- **Backend**: Supabase (Authentication & Database)
- **State Management**: Pinia
- **Routing**: Vue Router
- **Build Tool**: Vite
- **Testing**: Vitest with Vue Test Utils

## 📋 Prerequisites

- Node.js (^20.19.0 || >=22.12.0)
- npm or yarn
- Supabase account and project

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd cat-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

Set up the following tables in your Supabase database:

```sql
-- Cats table
CREATE TABLE cats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  color VARCHAR NOT NULL,
  weight DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedings table
CREATE TABLE feedings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cat_id UUID REFERENCES cats(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('dry', 'wet')),
  fed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedings ENABLE ROW LEVEL SECURITY;

-- Policies for cats table
CREATE POLICY "Users can view their own cats" ON cats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cats" ON cats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for feedings table
CREATE POLICY "Users can view feedings for their cats" ON feedings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cats WHERE cats.id = feedings.cat_id AND cats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert feedings for their cats" ON feedings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cats WHERE cats.id = feedings.cat_id AND cats.user_id = auth.uid()
    )
  );
```

### 5. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test:unit` - Run unit tests
- `npm run type-check` - Type check with TypeScript
- `npm run lint` - Lint and fix code

## 🗂️ Project Structure

```
cat-tracker/
├── src/
│   ├── components/
│   │   └── Auth/
│   │       └── LoginForm.vue
│   ├── stores/
│   │   └── auth.ts
│   ├── views/
│   │   ├── DashboardView.vue
│   │   └── LoginView.vue
│   ├── router/
│   │   └── index.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── App.vue
│   └── main.ts
├── public/
├── package.json
└── README.md
```

## 🔐 Authentication

The app uses Supabase Authentication with email/password. Users can:
- Sign up with email and password
- Login to existing accounts
- Access is protected with route guards
- Automatic session management

## 🐱 Cat Size Categories

Cats are automatically categorized by weight:
- **Small**: < 8 lbs
- **Medium**: 8-12 lbs  
- **Large**: > 12 lbs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Issues

If you find any bugs or have feature requests, please open an issue on the GitHub repository.

## 📞 Support

For questions or support, please open an issue or contact the maintainers.

---

Made with ❤️ for cat lovers everywhere! 🐾
