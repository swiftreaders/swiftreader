# Swiftreader

## Overview
Swiftreaders provides a fun and intuitive platform to improve your reading speed, comprehension rate and learning throughput. We leverage generative AI and eye-tracking technology to personalise training to your individual needs. By integrating [WebGazer](https://webgazer.cs.brown.edu/) for real-time eye-tracking, this web-based platform dynamically adjusts reading speeds based on user engagement. It offers multiple reading modes, comprehension assessments, and a repository of public domain texts to enhance reading efficiency and retention.

We welcome you to try the platform out for yourselves here: [Swiftreader](swiftreader.vercel.app)
> Note: In order to use our our eye-tracking software, please use Google Chrome on a Laptop or Desktop equipped with a webcam.  

## Features

### 🔍 WebGazer Integration
- Utilizes WebGazer for real-time eye-tracking via a webcam.
- Calibration step to fine-tune eye-tracking accuracy.

### 📖 Reading Modes
1. **Standard Speed-Reading Mode**: Fixed words-per-minute (WPM) rate to help users get accustomed to speed reading.
2. **Adaptive Speed-Reading Mode**: Dynamically adjusts WPM based on eye-tracking data, allowing users to progress at their natural pace.
3. **Summarised Adaptive Speed-Reading Mode (Non-fiction only)**: Uses Generative AI to provide summaries of each sentence or paragraph, optimizing information intake.

### ✅ Comprehension Assessment
- Post-reading quizzes to gauge comprehension.
- AI-generated questions (approved by an admin) or manually created by an admin.
- Gamification through difficulty levels assigned to texts based on past user performance.

### 📚 Text Repository
- Collection of public domain fiction and non-fiction texts.
- Generative AI non-fiction texts and summaries
- Difficulty grading based on word complexity and user comprehension performance.

### 🔧 Admin Interface
- Manage text material.
- View aggregated user performance analytics.

### 📊 User Dashboard
- Track reading progress.
- Access available texts and historical quiz results.
- Compete against friends around the world 

## 🛠️ Tech Stack
- **Frontend**: [Next.js](https://nextjs.org/) (Deployed on [Vercel](https://vercel.com/))
- **Backend**: [Firebase](https://firebase.google.com/)
- **Authentication**: [Auth0](https://auth0.com/)
- **Eye Tracking**: [WebGazer](https://webgazer.cs.brown.edu/)
- **AI Summarization**: Gemini AI

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed:
- Node.js (Latest LTS recommended)
- Yarn or npm

### Installation
```sh
# Clone the repository
https://github.com/swiftreaders/swiftreader.git
cd swiftreaders

# Install dependencies
npm install  # or yarn install
```

### Environment Variables
Create a `.env.local` file in the root directory and add the following variables:
```
AUTH0_SECRET=
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
NEXT_PUBLIC_GEMINI_API_KEY=
```

### Running the Development Server
```sh
npm run dev  # or yarn dev
```
The application will be available at `http://localhost:3000`

### Deployment
The project is designed for deployment on [Vercel](https://vercel.com/). Simply push to your repository, and Vercel will automatically handle the deployment.

## 📜 License
This project is licensed under the MIT License.

## 📬 Authors
Thank you for checking out Swiftreader!
For any inquiries or contributions, feel free to reach out or submit a pull request!
- Sriharsha Vitta (harsha.vitta22@imperial.ac.uk)
- Siddhant Gadkari (siddhant.gadkari22@imperial.ac.uk)
- Toan Truong (toan.truong22@imperial.ac.uk)
- Hardiv Harshakumar (hardiv.harshakumar22@imperial.ac.uk)
- Kevin Halm (kevin.halm-alvarez22@imperial.ac.uk)
- Vivian Lopez (vivian.lopez22@imperial.ac.uk)

