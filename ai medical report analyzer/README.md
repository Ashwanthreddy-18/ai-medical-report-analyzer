# Medical Report Analyzer AI

This is a web app designed to analyze medical reports, such as PDFs and images, and explain the results in simpler terms. Built with Next.js, Groq API, and LlamaParse, the app parses medical documents, processes the data with the Llama model via the Groq API, and generates easy-to-understand outputs.

<img width="1850" alt="Xnapper-2024-12-08-19 00 55" src="https://github.com/user-attachments/assets/15bc863f-e3a6-4715-85a5-8032ea13b265">

## Live Demo


https://github.com/user-attachments/assets/eed34700-f8c2-4710-b08b-b6956f6da994



## Features

- Upload medical reports in PDF or image formats.
- Automatically parse and extract text from the uploaded file using LlamaParse.
- Analyze the extracted data with the Groq API, powered by the Llama model.
- Receive detailed, user-friendly explanations of the report.
- Supports real-time processing and output generation.

## Behind the code

<img width="445" alt="Xnapper-2024-12-08-19 02 05" src="https://github.com/user-attachments/assets/db285967-0cab-4f5c-aa2d-d84dbccb567e">


## Technologies Used

- **Next.js**: For building the frontend and backend logic of the app.
- **Groq API**: For analyzing medical report data using the Llama model.
- **LlamaParse**: For parsing text from medical reports in image or PDF format.
- **React**: For building the interactive UI components.

## Setup

To run this project locally, follow these steps:

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Groq API key for accessing the Llama model

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/medical-report-analyzer-ai.git
   cd medical-report-analyzer-ai
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables. Create a `.env.local` file at the root of the project with the following content:

   ```
   GROQ_API_KEY=your_groq_api_key
   ```

4. Run the app in development mode:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Visit [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Upload Report**: Users upload a medical report in PDF or image format.
2. **Parsing**: LlamaParse extracts text from the document.
3. **Analysis**: The extracted text is sent to the Groq API for analysis using the Llama model.
4. **Output**: The analyzed data is returned and displayed as simplified, easy-to-understand explanations for the user.

