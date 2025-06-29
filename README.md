# DevTutor: AI-Powered Developer Learning Platform

**🔗 [Live Demo](https://dev-tutor-ten.vercel.app)**

## Overview

DevTutor is an intelligent learning platform that transforms how developers master new tools and technologies. By leveraging Google's Gemini AI, we've created a personalized educational experience that adapts to your learning style and pace.

## The Problem We Solve

As developers, we're constantly faced with reading difficult and often arcane documentation written by people who would rather be doing anything else. Traditional documentation is dry, generic, and doesn't adapt to different learning styles or experience levels.

## What DevTutor Does

- **Pre-loaded Courses**: Comes with comprehensive material for popular developer tools
- **Dynamic Course Generation**: Request any dev tool and DevTutor will create a personalized course just for you
- **Adaptive Learning**: AI adjusts teaching style based on your preferences and progress
- **Interactive Experience**: Learn through conversation rather than static documentation

## Key Features

- **Personalized Learning Paths**: Courses tailored to your specific needs and learning style
- **Real-time Progress Tracking**: Monitor your advancement through modules
- **Intelligent AI Tutor**: Powered by Google's Gemini API for natural, conversational learning
- **Tool Mastery Focus**: From popular frameworks to niche utilities
- **Adaptive Pace**: Whether beginner or expert, the platform adjusts to your level

## Tech Stack

- **Frontend**: React, Next.js
- **Backend**: Next.js API routes
- **Database**: MongoDB
- **AI**: Google Gemini API
- **Authentication**: Custom user management
- **Styling**: Tailwind CSS

## How We Built It

We used React and Next.js for a reactive frontend and streamlined backend architecture. Google's Gemini API powers both course generation and interactive tutoring sessions. The platform features a modular design that allows for easy expansion of courses and tools.

## Challenges We Overcame

We initially relied heavily on AI for development, which led to rapid prototyping but also required significant refactoring to maintain code quality and structure. This experience taught us the importance of maintaining control over our codebase while using AI as a supplemental tool.

## What We're Proud Of

- **Adaptive AI**: The system intelligently adjusts to user information and learning patterns
- **Dynamic Course Creation**: Ability to generate comprehensive courses from scratch for any developer tool
- **User Experience**: Seamless integration of AI tutoring with progress tracking

## What We Learned

The importance of maintaining architectural control while leveraging AI capabilities. While AI accelerated development, having a strong technical foundation and clear vision proved essential for creating a coherent, maintainable product.

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/RyanGarfinkel/DevTutor
   cd devtutor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Gemini API key and MongoDB connection string
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Future Roadmap

DevTutor serves as a powerful MVP with immense potential for growth. Our vision includes:

- Enhanced personalization algorithms
- Community-driven course contributions
- Integration with popular development environments
- Advanced analytics and learning insights
- Mobile application development

With proper planning, time, and resources, DevTutor could become an essential tool in every developer's learning arsenal.

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Ready to revolutionize your learning experience? [Try DevTutor now!](https://dev-tutor-ten.vercel.app)