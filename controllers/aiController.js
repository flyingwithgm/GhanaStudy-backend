const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const solveQuestion = async (req, res) => {
  try {
    const { question, subject } = req.body;
    
    if (!question || !subject) {
      return res.status(400).json({ 
        success: false,
        message: 'Question and subject are required' 
      });
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are a helpful Ghanaian study assistant helping students in Ghana.
    
    Subject: ${subject}
    Question: ${question}
    
    Please provide:
    1. A clear explanation of the concept
    2. Step-by-step solution (if applicable)
    3. Key points to remember
    4. Related examples relevant to Ghanaian curriculum
    
    Keep the explanation clear, simple, and educational.
    Use examples that Ghanaian students can relate to.
    Format your response in clear paragraphs.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();
    
    res.json({
      success: true,
       {
        answer: answer,
        subject: subject,
        question: question,
        type: "explanation"
      }
    });
  } catch (error) {
    if (error.message.includes('API_KEY_INVALID')) {
      res.status(401).json({ 
        success: false,
        message: 'Invalid API key. Please contact support.' 
      });
    } else if (error.message.includes('quota')) {
      res.status(429).json({ 
        success: false,
        message: 'API quota exceeded. Please try again later.' 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: 'Failed to solve question. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

const testGeminiAPI = async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = "Say hello and confirm the API is working";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({
      success: true,
      message: "Gemini API is working correctly",
      response: text
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gemini API test failed",
      error: error.message
    });
  }
};

module.exports = { solveQuestion, testGeminiAPI };
