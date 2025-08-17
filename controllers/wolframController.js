const axios = require('axios');

const solveMathProblem = async (req, res) => {
  try {
    const { problem, subject = 'Mathematics' } = req.body;
    const appId = process.env.WOLFRAM_APP_ID;
    
    if (!problem) {
      return res.status(400).json({ 
        success: false,
        message: 'Problem is required' 
      });
    }
    
    const encodedProblem = encodeURIComponent(problem);
    
    const response = await axios.get(
      `http://api.wolframalpha.com/v2/query?input=${encodedProblem}&appid=${appId}&format=plaintext&output=json&scantimeout=10`
    );
    
    const data = response.data.queryresult;
    
    if (data.success && data.pods && data.pods.length > 0) {
      const resultPod = data.pods.find(pod => pod.id === 'Result');
      const solutionPod = data.pods.find(pod => pod.title === 'Solution');
      const stepsPod = data.pods.find(pod => pod.title === 'Steps');
      const inputPod = data.pods.find(pod => pod.id === 'Input');
      
      const solution = {
        input: problem,
        subject: subject,
        result: resultPod ? resultPod.subpods[0].plaintext : null,
        solution: solutionPod ? solutionPod.subpods[0].plaintext : null,
        steps: stepsPod ? stepsPod.subpods[0].plaintext : null,
        inputInterpretation: inputPod ? inputPod.subpods[0].plaintext : null,
        additionalInfo: data.pods.slice(0, 5).map(pod => ({
          title: pod.title,
          content: pod.subpods[0].plaintext
        }))
      };
      
      res.json({
        success: true,
         solution
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: "Could not solve the problem. Please check the input or try rephrasing.",
        tips: [
          "Make sure the problem is clearly stated",
          "Use mathematical notation (e.g., x^2 for x squared)",
          "Try breaking complex problems into smaller parts"
        ]
      });
    }
  } catch (error) {
    if (error.response?.status === 401) {
      res.status(401).json({ 
        success: false,
        message: "Invalid API key. Please contact support." 
      });
    } else if (error.response?.status === 429) {
      res.status(429).json({ 
        success: false,
        message: "Too many requests. Please try again in a moment." 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: 'Failed to solve math problem. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

const testWolframAPI = async (req, res) => {
  try {
    const appId = process.env.WOLFRAM_APP_ID;
    const response = await axios.get(
      `http://api.wolframalpha.com/v2/query?input=2+2&appid=${appId}&format=plaintext&output=json`
    );
    
    res.json({
      success: true,
      message: "Wolfram Alpha API is working correctly",
      sample: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Wolfram Alpha API test failed",
      error: error.message
    });
  }
};

module.exports = { solveMathProblem, testWolframAPI };
