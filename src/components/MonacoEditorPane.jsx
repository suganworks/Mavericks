// src/components/MonacoEditorPane.jsx
import React, { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import keywordSuggestions from "../assets/keywordSuggestions";

export default function MonacoEditorPane({ code, setCode, language }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [autoComplete, setAutoComplete] = useState(true);

  const GEMINI_API_KEY = "AIzaSyCT9QX5-WFds2hMh223Q1yrrRh-RbzN3UE";

  /** Register autocomplete providers */
  const registerProviders = (monaco) => {
    // Local keyword completions — trigger on ANY letter
    monaco.languages.registerCompletionItemProvider(language, {
      triggerCharacters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".split(""),
      provideCompletionItems: () => {
        if (!autoComplete) return { suggestions: [] };
        if (keywordSuggestions[language]) {
          return {
            suggestions: keywordSuggestions[language].map((word) => ({
              label: word,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: word,
              detail: "Keyword"
            }))
          };
        }
        return { suggestions: [] };
      }
    });

    // AI autocomplete — runs only after local results are shown
    monaco.languages.registerCompletionItemProvider(language, {
      triggerCharacters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".split(""),
      provideCompletionItems: async () => {
        if (!autoComplete) return { suggestions: [] };
        try {
          const codeContext = editorRef.current?.getValue() || "";
          const prompt = `Suggest next possible ${language} code completion for:\n${codeContext}`;

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            }
          ).then((r) => r.json());

          const suggestionText = res?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (!suggestionText.trim()) return { suggestions: [] };

          return {
            suggestions: [
              {
                label: suggestionText.split("\n")[0],
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: suggestionText,
                detail: "AI Suggested"
              }
            ]
          };
        } catch {
          return { suggestions: [] };
        }
      }
    });
  };

  /** When editor mounts */
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.editor.setTheme("vs-dark");

    // JS/TS IntelliSense
    if (language === "javascript" || language === "typescript") {
      monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true
      });
    }

    registerProviders(monaco);
  };

  /** Toggle auto-complete */
  const toggleAutoComplete = () => {
    setAutoComplete((prev) => {
      const newState = !prev;
      if (monacoRef.current) {
        registerProviders(monacoRef.current);
      }
      return newState;
    });
  };

  return (
    <div className="w-full h-full relative group font-code">
      {/* Auto-Complete Toggle Button */}
      <button
        onClick={toggleAutoComplete}
        className="absolute top-3 right-3 z-20 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-md text-xs text-white font-medium tracking-wide hover:bg-white/20 transition"
      >
        {autoComplete ? "✨ Auto-Complete: ON" : "❌ Auto-Complete: OFF"}
      </button>

      {/* Monaco Editor */}
      <Editor
        height="100%"
        width="100%"
        theme="vs-dark"
        language={language}
        value={code}
        onChange={(value) => setCode(value || "")}
        onMount={handleEditorDidMount}
        options={{
          fontFamily: "'JetBrains Mono','Fira Code', monospace",
          fontSize: 15,
          fontLigatures: true,
          lineHeight: 22,
          minimap: { enabled: false },
          smoothScrolling: true,
          automaticLayout: true,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          quickSuggestions: autoComplete
            ? { other: true, comments: false, strings: true }
            : false,
          suggestOnTriggerCharacters: autoComplete,
          acceptSuggestionOnEnter: autoComplete ? "on" : "off",
          tabCompletion: autoComplete ? "on" : "off"
        }}
        className="relative z-10 p-2 rounded-xl"
      />
    </div>
  );
}
