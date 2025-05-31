import React, { useState } from 'react'
import "./App.css"
import Navbar from './components/Navbar'
import Editor from '@monaco-editor/react';
import Select from 'react-select';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown'
import HashLoader from "react-spinners/HashLoader";
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

const App = () => {
  const options = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'rust', label: 'Rust' },
    { value: 'dart', label: 'Dart' },
    { value: 'scala', label: 'Scala' },
    { value: 'perl', label: 'Perl' },
    { value: 'haskell', label: 'Haskell' },
    { value: 'elixir', label: 'Elixir' },
    { value: 'r', label: 'R' },
    { value: 'matlab', label: 'MATLAB' },
    { value: 'bash', label: 'Bash' }
  ];

  const [selectedOption, setSelectedOption] = useState(options[0]);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#18181b', // dark background (similar to bg-zinc-900)
      borderColor: '#3f3f46',
      color: '#fff',
      width: "100%"
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#18181b', // dropdown bg
      color: '#fff',
      width: "100%"
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#fff',  // selected option text
      width: "100%"
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#27272a' : '#18181b',  // hover effect
      color: '#fff',
      cursor: 'pointer',
      // width: "30%"
    }),
    input: (provided) => ({
      ...provided,
      color: '#fff',
      width: "100%"
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#a1a1aa',  // placeholder text color
      width: "100%"
    }),
  };

  const [code, setCode] = useState("");

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
  if (!apiKey) {
    console.error('API Key not found. Please check your .env file.');
    toast.error('Something went wrong! Please try again later.');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey }); 
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  async function reviewCode() {
    setResponse("")
    setLoading(true);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are an expert-level software developer, skilled in writing efficient, clean, and advanced code.
      I’m sharing a piece of code written in ${selectedOption.value}.
      Your job is to deeply review this code and provide the following:

      1️⃣ A quality rating: Better, Good, Normal, or Bad.
      2️⃣ Detailed suggestions for improvement, including best practices and advanced alternatives.
      3️⃣ A clear explanation of what the code does, step by step.
      4️⃣ A list of any potential bugs or logical errors, if found.
      5️⃣ Identification of syntax errors or runtime errors, if present.
      6️⃣ Solutions and recommendations on how to fix each identified issue.

      Analyze it like a senior developer reviewing a pull request.

      Code: ${code}
      `,
      });
      setResponse(response.text)
      setLoading(false);
  }

  async function fixCode() {
    setResponse("")
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `You are an expert-level software developer with extensive experience in debugging and fixing code.
        I'm providing you with a piece of code written in ${selectedOption.value} that may contain errors, bugs, or inefficiencies.
        
        Your task is to:
        1️⃣ Identify all syntax errors, logical errors, runtime errors, and potential bugs
        2️⃣ Fix these issues and improve the code quality
        3️⃣ Apply best practices and optimization techniques
        4️⃣ Provide ONLY the corrected, clean, and optimized version of the code
        
        IMPORTANT: Please respond with ONLY the fixed code, no explanations, no markdown formatting, no code blocks, no additional text. Just return the clean, corrected code that can be directly placed in the editor.
        
        Original Code:
        ${code}`,
      });
      
      // Update the code in the editor with the fixed version
      setCode(response.text.trim());
      
      // Set a response message to show the action was completed
      setResponse("✅ **Code has been fixed and updated in the editor!**\n\nThe corrected code has been automatically placed in the code editor. Review the changes and test your code.");
      
    } catch (error) {
      setResponse(`❌ **Error fixing code:** ${error.message}`);
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} />

      <div className="main flex justify-between" style={{ height: "calc(100vh - 90px" }}>
        <div className="left h-[87.5%] w-[50%]">
          <div className="tabs !mt-5 !px-5 !mb-3 w-full flex items-center gap-[10px]">
            <Select
              value={selectedOption}
              onChange={(e) => { setSelectedOption(e) }}
              options={options}
              styles={customStyles}
            />
            <button 
              onClick={() => {
                if (code === "") {
                  toast.dismiss();
                  toast.error("Please enter code first")
                } else {
                  fixCode()
                }
              }} 
              className="btnNormal bg-zinc-900 min-w-[120px] transition-all hover:bg-zinc-800"
            >
              Fix Code
            </button>
            <button onClick={() => {
              if (code === "") {
                toast.dismiss();
                toast.error("Please enter code first")
              }
              else {
                reviewCode()
              }
            }} className="btnNormal bg-zinc-900 min-w-[120px] transition-all hover:bg-zinc-800">Review</button>
          </div>

          <Editor height="100%" theme='vs-dark' language={selectedOption.value} value={code} onChange={(e) => { setCode(e) }} />
        </div>

        <div className="right overflow-scroll !p-[10px] bg-zinc-900 w-[50%] h-[101%]">
          <div className="topTab border-b-[1px] border-t-[1px] border-[#27272a] flex items-center justif-between h-[60px]">
            <p className='font-[700] text-[17px]'>Response</p>
          </div>
          {loading && (
            <div className="flex justify-center items-center h-[520px]">
              <HashLoader color='#9333ea'/>
            </div>
          )}
          <Markdown>{response}</Markdown>
        </div>
      </div>
    </>
  )
}

export default App