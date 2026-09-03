import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const chat = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const result = await model.generateContent(prompt);
  const text = result.response?.text?.() ?? "";

  ApiResponse.ok({ text }, "OK").send(res);
});
