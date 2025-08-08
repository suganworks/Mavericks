import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import MonacoEditor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { motion } from "framer-motion";
import keywordSuggestions from "../../data/KeywordSuggestions";
import useAssessmentSecurity from "../hooks/useAssessmentSecurity";

// --- Language Icons ---
const LanguageIcons = {
    python: (
        <svg viewBox="0 0 128 128" className="w-5 h-5 mr-2">
            <linearGradient id="python-original-a" gradientUnits="userSpaceOnUse" x1="70.252" y1="1237.476" x2="170.659" y2="1151.089" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)"><stop offset="0" stopColor="#5A9FD4"></stop><stop offset="1" stopColor="#306998"></stop></linearGradient>
            <linearGradient id="python-original-b" gradientUnits="userSpaceOnUse" x1="209.474" y1="1098.811" x2="173.62" y2="1149.537" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)"><stop offset="0" stopColor="#FFD43B"></stop><stop offset="1" stopColor="#FFE873"></stop></linearGradient>
            <path fill="url(#python-original-a)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" transform="translate(0 10.26)"></path><path fill="url(#python-original-b)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" transform="translate(0 10.26)"></path><path opacity=".444" fill="#fff" fillRule="nonzero" d="M97.309 119.597c0 3.543-14.816 6.416-33.091 6.416-18.276 0-33.092-2.873-33.092-6.416 0-3.544 14.815-6.417 33.092-6.417 18.275 0 33.091 2.872 33.091 6.417z"></path>
        </svg>
    ),
    javascript: (
        <svg viewBox="0 0 128 128" className="w-5 h-5 mr-2">
            <path fill="#F0DB4F" d="M1.408 1.408h125.184v125.185H1.408z"></path><path fill="#323330" d="M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.54 6.545 18.873 11.531 1.297 6.104-4.486 8.08-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.63 4.26 5.795 9.068 9.198 31.76 8.746 35.83-5.176.165-.478 1.261-3.666.38-8.581zM69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.34-.714 14.149-1.713 3.558-6.152 3.117-8.175 2.427-2.059-1.012-3.106-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.07-17.444.06-10.735.001-21.468.001-32.237z"></path>
        </svg>
    ),
    cpp: (
        <svg viewBox="0 0 128 128" className="w-5 h-5 mr-2">
            <path fill="#D26383" d="M115.4 30.7L67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.4 1 3.5l106.8-62c-.6-1.2-1.5-2.1-2.4-2.7z"></path><path fill="#9C033A" d="M10.7 95.3c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c0-.9-.1-1.9-.6-2.8l-106.6 62z"></path><path fill="#fff" d="M85.3 76.1C81.1 83.5 73.1 88.5 64 88.5c-13.5 0-24.5-11-24.5-24.5s11-24.5 24.5-24.5c9.1 0 17.1 5 21.3 12.5l13-7.5c-6.8-11.9-19.6-20-34.3-20-21.8 0-39.5 17.7-39.5 39.5s17.7 39.5 39.5 39.5c14.6 0 27.4-8 34.2-19.8l-12.9-7.6z"></path><path d="M82.1 61.8h5.2v-5.3h4.4v5.3H97v4.4h-5.3v5.2h-4.4v-5.2h-5.2v-4.4zm18.5 0h5.2v-5.3h4.4v5.3h5.3v4.4h-5.3v5.2h-4.4v-5.2h-5.2v-4.4z" fill="#fff"></path>
        </svg>
    ),
    java: (
        <svg viewBox="0 0 128 128" className="w-5 h-5 mr-2">
            <path fill="#0074BD" d="M47.617 98.12s-4.767 2.774 3.397 3.71c9.892 1.13 14.947.968 25.845-1.092 0 0 2.871 1.795 6.873 3.351-24.439 10.47-55.308-.607-36.115-5.969zm-2.988-13.665s-5.348 3.959 2.823 4.805c10.567 1.091 18.91 1.18 33.354-1.6 0 0 1.993 2.025 5.132 3.131-29.542 8.64-62.446.68-41.309-6.336z"></path><path fill="#EA2D2E" d="M69.802 61.271c6.025 6.935-1.58 13.17-1.58 13.17s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.792 15.635-29.58 0 .001-42.731 10.67-22.324 34.187z"></path><path fill="#0074BD" d="M102.123 108.229s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.094.171-4.451-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.953-3.487-32.013 6.85-13.743 9.815 49.821 8.076 90.817-3.637 77.896-9.468zM49.912 70.294s-22.686 5.389-8.033 7.348c6.188.828 18.518.638 30.011-.326 9.39-.789 18.813-2.474 18.813-2.474s-3.308 1.419-5.704 3.053c-23.042 6.061-67.544 3.238-54.731-2.958 10.832-5.239 19.644-4.643 19.644-4.643zm40.697 22.747c23.421-12.167 12.591-23.86 5.032-22.285-1.848.385-2.677.72-2.677.72s.688-1.079 2-1.543c14.953-5.255 26.451 15.503-4.823 23.725 0-.002.359-.327.468-.617z"></path><path fill="#EA2D2E" d="M76.491 1.587S89.459 14.563 64.188 34.51c-20.266 16.006-4.621 25.13-.007 35.559-11.831-10.673-20.509-20.07-14.688-28.815C58.041 28.42 81.722 22.195 76.491 1.587z"></path><path fill="#0074BD" d="M52.214 126.021c22.476 1.437 57-.8 57.817-11.436 0 0-1.571 4.032-18.577 7.231-19.186 3.612-42.854 3.191-56.887.874 0 .001 2.875 2.381 17.647 3.331z"></path>
        </svg>
    )
};

// --- Config ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY || "";

// --- Mood GIFs ---
const moods = {
    neutral: "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif",
    running: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXNqZ3Y0Z2RkZ2w5a2ZqY2ZpZ3J5b3R4c3B6c3h6eXJtY3h5eHh5eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l4KhVp1b2e4M2o2mQ/giphy.gif",
    success: "https://i.giphy.com/media/111ebonMs90YLu/giphy.gif",
    fail: "https://i.giphy.com/media/26n6WywJyh39n1pBu/giphy.gif"
};

// --- Get Quiz Questions by Topic ---
const getQuizQuestionsByTopic = (topic) => {
    // All possible questions organized by topic
    const allQuestions = {
        "arrays": [
            {
                question: "What is the time complexity of accessing an element in an array by index?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(1)"
            },
            {
                question: "Which of the following operations is NOT O(1) for arrays?",
                options: ["Access by index", "Insertion at the end (with space)", "Insertion at the beginning", "Updating an element"],
                correctAnswer: "Insertion at the beginning"
            },
            {
                question: "What is the space complexity of an array with n elements?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(n)"
            },
            {
                question: "In JavaScript, which method adds elements to the end of an array?",
                options: ["push()", "pop()", "shift()", "unshift()"],
                correctAnswer: "push()"
            },
            {
                question: "Which data structure is an array optimized for?",
                options: ["Random access", "Insertion/deletion in the middle", "Dynamic size management", "Hierarchical data"],
                correctAnswer: "Random access"
            },
            {
                question: "What is the output of [1,2,3,4,5].slice(1,3) in JavaScript?",
                options: ["[1,2,3]", "[2,3]", "[2,3,4]", "[1,2]"],
                correctAnswer: "[2,3]"
            },
            {
                question: "Which sorting algorithm has the best average time complexity?",
                options: ["Bubble Sort", "Insertion Sort", "Quick Sort", "Selection Sort"],
                correctAnswer: "Quick Sort"
            },
            {
                question: "What is the time complexity of searching for an element in an unsorted array?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(n)"
            },
            {
                question: "In Python, what does the list comprehension [x for x in range(5)] produce?",
                options: ["[0, 1, 2, 3, 4]", "[1, 2, 3, 4, 5]", "[0, 1, 2, 3, 4, 5]", "[1, 2, 3, 4]"],
                correctAnswer: "[0, 1, 2, 3, 4]"
            },
            {
                question: "Which of these is NOT a valid way to iterate through an array in JavaScript?",
                options: ["for (let i = 0; i < arr.length; i++)", "for (let item of arr)", "arr.forEach(item => {})", "arr.iterate(item => {})"],
                correctAnswer: "arr.iterate(item => {})"
            }
        ],
        "strings": [
            {
                question: "What is the time complexity of string concatenation in most languages?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(n)"
            },
            {
                question: "Which of the following is true about strings in most programming languages?",
                options: ["Strings are mutable", "Strings are immutable", "Strings are primitive types in all languages", "Strings have O(1) concatenation"],
                correctAnswer: "Strings are immutable"
            },
            {
                question: "What is the time complexity of checking if a string is a palindrome?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(n)"
            },
            {
                question: "In Python, what does the method str.strip() do?",
                options: ["Removes all whitespace", "Removes leading and trailing whitespace", "Removes specified characters", "Splits the string"],
                correctAnswer: "Removes leading and trailing whitespace"
            },
            {
                question: "Which algorithm is commonly used for pattern matching in strings?",
                options: ["Bubble Sort", "Dijkstra's Algorithm", "Knuth-Morris-Pratt", "Breadth-First Search"],
                correctAnswer: "Knuth-Morris-Pratt"
            },
            {
                question: "What is the output of 'Hello'.substring(1,3) in JavaScript?",
                options: ["'He'", "'el'", "'ell'", "'ello'"],
                correctAnswer: "'el'"
            },
            {
                question: "Which of these is NOT a common string operation?",
                options: ["Concatenation", "Substring", "Sorting", "Comparison"],
                correctAnswer: "Sorting"
            },
            {
                question: "What is the space complexity of creating a substring?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(n)"
            },
            {
                question: "In JavaScript, which method converts a string to lowercase?",
                options: ["toLowerCase()", "toLower()", "lowerCase()", "caseLower()"],
                correctAnswer: "toLowerCase()"
            },
            {
                question: "What is the result of 'a' + 'b' + 'c' in most programming languages?",
                options: ["Error", "abc", "a+b+c", "[a,b,c]"],
                correctAnswer: "abc"
            }
        ],
        "recursion": [
            {
                question: "What is a base case in recursion?",
                options: [
                    "The case where the function calls itself", 
                    "The case where the function returns without calling itself", 
                    "The first call to the function", 
                    "The last call to the function"
                ],
                correctAnswer: "The case where the function returns without calling itself"
            },
            {
                question: "What happens if a recursive function doesn't have a base case?",
                options: [
                    "It will run faster", 
                    "It will eventually stop on its own", 
                    "It will cause a stack overflow", 
                    "It will automatically optimize itself"
                ],
                correctAnswer: "It will cause a stack overflow"
            },
            {
                question: "Which of these problems is best solved using recursion?",
                options: [
                    "Finding the maximum value in an array", 
                    "Traversing a binary tree", 
                    "Sorting an array of integers", 
                    "Checking if a string is a palindrome"
                ],
                correctAnswer: "Traversing a binary tree"
            },
            {
                question: "What is tail recursion?",
                options: [
                    "A recursion that never ends", 
                    "A recursive call that is the last operation in the function", 
                    "A recursion with multiple base cases", 
                    "A recursion that uses global variables"
                ],
                correctAnswer: "A recursive call that is the last operation in the function"
            },
            {
                question: "What is the space complexity of a recursive function with depth n?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(n)"
            },
            {
                question: "Which of these is NOT a common use case for recursion?",
                options: [
                    "Tree traversal", 
                    "Calculating factorial", 
                    "Sorting large datasets", 
                    "Solving Tower of Hanoi"
                ],
                correctAnswer: "Sorting large datasets"
            },
            {
                question: "What is memoization in the context of recursion?",
                options: [
                    "A technique to avoid infinite recursion", 
                    "A way to store previously computed results to avoid redundant calculations", 
                    "A method to reduce the number of recursive calls", 
                    "A technique to convert recursion to iteration"
                ],
                correctAnswer: "A way to store previously computed results to avoid redundant calculations"
            },
            {
                question: "What is the recurrence relation for the Fibonacci sequence?",
                options: [
                    "F(n) = F(n-1) + F(n-2)", 
                    "F(n) = F(n-1) * n", 
                    "F(n) = F(n-1) + n", 
                    "F(n) = F(n/2) + 1"
                ],
                correctAnswer: "F(n) = F(n-1) + F(n-2)"
            },
            {
                question: "Which of these algorithms commonly uses recursion?",
                options: [
                    "Bubble Sort", 
                    "Linear Search", 
                    "Merge Sort", 
                    "Insertion Sort"
                ],
                correctAnswer: "Merge Sort"
            },
            {
                question: "What is the main disadvantage of recursion compared to iteration?",
                options: [
                    "Recursion is always slower", 
                    "Recursion uses more memory due to the call stack", 
                    "Recursion cannot solve all problems that iteration can", 
                    "Recursion is more difficult to debug"
                ],
                correctAnswer: "Recursion uses more memory due to the call stack"
            }
        ],
        "data-structures": [
            {
                question: "Which data structure uses LIFO (Last In First Out) principle?",
                options: ["Queue", "Stack", "Linked List", "Tree"],
                correctAnswer: "Stack"
            },
            {
                question: "Which data structure uses FIFO (First In First Out) principle?",
                options: ["Stack", "Queue", "Binary Search Tree", "Heap"],
                correctAnswer: "Queue"
            },
            {
                question: "What is the time complexity of searching in a balanced binary search tree?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(log n)"
            },
            {
                question: "Which of these is NOT a linear data structure?",
                options: ["Array", "Linked List", "Stack", "Tree"],
                correctAnswer: "Tree"
            },
            {
                question: "What is the main advantage of a hash table?",
                options: [
                    "Ordered elements", 
                    "Fast average case insertion, deletion, and lookup", 
                    "Memory efficiency", 
                    "Hierarchical organization"
                ],
                correctAnswer: "Fast average case insertion, deletion, and lookup"
            },
            {
                question: "In a min-heap, which element is at the root?",
                options: [
                    "The largest element", 
                    "The smallest element", 
                    "The middle element", 
                    "A random element"
                ],
                correctAnswer: "The smallest element"
            },
            {
                question: "What is the worst-case time complexity for insertion in a linked list if you have a reference to the insertion position?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(1)"
            },
            {
                question: "Which data structure would be most efficient for implementing a dictionary?",
                options: ["Array", "Linked List", "Hash Table", "Stack"],
                correctAnswer: "Hash Table"
            },
            {
                question: "What is a graph?",
                options: [
                    "A collection of nodes with edges between them", 
                    "A hierarchical data structure with a root node", 
                    "A linear data structure with constant time access", 
                    "A visualization of numerical data"
                ],
                correctAnswer: "A collection of nodes with edges between them"
            },
            {
                question: "Which of these operations is NOT typically O(1) for a hash table?",
                options: ["Insertion", "Deletion", "Lookup", "Finding the minimum value"],
                correctAnswer: "Finding the minimum value"
            }
        ],
        "algorithms": [
            {
                question: "Which sorting algorithm has the best average-case time complexity?",
                options: ["Bubble Sort", "Quick Sort", "Insertion Sort", "Selection Sort"],
                correctAnswer: "Quick Sort"
            },
            {
                question: "What is the time complexity of binary search?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(log n)"
            },
            {
                question: "Which algorithm is used to find the shortest path in a weighted graph?",
                options: ["Depth-First Search", "Breadth-First Search", "Dijkstra's Algorithm", "Bubble Sort"],
                correctAnswer: "Dijkstra's Algorithm"
            },
            {
                question: "What is the worst-case time complexity of quicksort?",
                options: ["O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
                correctAnswer: "O(n²)"
            },
            {
                question: "Which of these is NOT a divide-and-conquer algorithm?",
                options: ["Merge Sort", "Quick Sort", "Binary Search", "Bubble Sort"],
                correctAnswer: "Bubble Sort"
            },
            {
                question: "What is the primary goal of dynamic programming?",
                options: [
                    "To solve problems by breaking them into subproblems and storing their solutions", 
                    "To find the shortest path in a graph", 
                    "To sort data efficiently", 
                    "To optimize memory usage"
                ],
                correctAnswer: "To solve problems by breaking them into subproblems and storing their solutions"
            },
            {
                question: "Which algorithm is used for topological sorting of a directed acyclic graph?",
                options: ["Breadth-First Search", "Depth-First Search", "Dijkstra's Algorithm", "Prim's Algorithm"],
                correctAnswer: "Depth-First Search"
            },
            {
                question: "What is the time complexity of the best sorting algorithms?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
                correctAnswer: "O(n log n)"
            },
            {
                question: "Which of these is a greedy algorithm?",
                options: ["Merge Sort", "Dynamic Programming", "Kruskal's Algorithm", "Binary Search"],
                correctAnswer: "Kruskal's Algorithm"
            },
            {
                question: "What is the primary difference between BFS and DFS?",
                options: [
                    "BFS uses a queue, DFS uses a stack", 
                    "BFS is faster than DFS", 
                    "DFS uses less memory than BFS", 
                    "BFS can only be used on trees, DFS on any graph"
                ],
                correctAnswer: "BFS uses a queue, DFS uses a stack"
            }
        ],
        "dynamic-programming": [
            {
                question: "What are the two key attributes of a dynamic programming problem?",
                options: [
                    "Sorting and searching", 
                    "Overlapping subproblems and optimal substructure", 
                    "Recursion and iteration", 
                    "Greedy choice and memoization"
                ],
                correctAnswer: "Overlapping subproblems and optimal substructure"
            },
            {
                question: "What is memoization in dynamic programming?",
                options: [
                    "A technique to sort arrays faster", 
                    "A way to store previously computed results to avoid redundant calculations", 
                    "A method to reduce space complexity", 
                    "A technique to convert recursion to iteration"
                ],
                correctAnswer: "A way to store previously computed results to avoid redundant calculations"
            },
            {
                question: "Which of these problems is typically solved using dynamic programming?",
                options: ["Finding the shortest path in an unweighted graph", "Sorting an array", "The knapsack problem", "Finding a specific element in an array"],
                correctAnswer: "The knapsack problem"
            },
            {
                question: "What is the difference between 'top-down' and 'bottom-up' approaches in dynamic programming?",
                options: [
                    "Top-down uses more memory, bottom-up is faster", 
                    "Top-down uses recursion with memoization, bottom-up uses iteration with tabulation", 
                    "Top-down is for optimization problems, bottom-up is for counting problems", 
                    "There is no difference, they are just different names"
                ],
                correctAnswer: "Top-down uses recursion with memoization, bottom-up uses iteration with tabulation"
            },
            {
                question: "Which of these is NOT a classic dynamic programming problem?",
                options: ["Longest Common Subsequence", "Fibonacci Sequence", "Binary Search", "Edit Distance"],
                correctAnswer: "Binary Search"
            },
            {
                question: "What is the time complexity of computing the nth Fibonacci number using dynamic programming?",
                options: ["O(1)", "O(log n)", "O(n)", "O(2^n)"],
                correctAnswer: "O(n)"
            },
            {
                question: "What is the 'state' in a dynamic programming problem?",
                options: [
                    "The final answer to the problem", 
                    "The variables that define a subproblem", 
                    "The recursive function used", 
                    "The base case of the recursion"
                ],
                correctAnswer: "The variables that define a subproblem"
            },
            {
                question: "Which of these techniques is NOT used in dynamic programming?",
                options: ["Memoization", "Tabulation", "State transition", "Backtracking"],
                correctAnswer: "Backtracking"
            },
            {
                question: "What is the primary advantage of dynamic programming over recursion?",
                options: [
                    "It's easier to implement", 
                    "It avoids redundant calculations", 
                    "It always uses less memory", 
                    "It's always faster"
                ],
                correctAnswer: "It avoids redundant calculations"
            },
            {
                question: "Which of these problems would NOT benefit from dynamic programming?",
                options: [
                    "Finding all possible subsets of a set", 
                    "Longest increasing subsequence", 
                    "Matrix chain multiplication", 
                    "Finding the maximum element in an array"
                ],
                correctAnswer: "Finding the maximum element in an array"
            }
        ],
        "weekly-challenge": [
            {
                question: "What is a minimum spanning tree?",
                options: [
                    "A tree with the minimum number of nodes", 
                    "A subset of edges that forms a tree including every vertex with minimum total edge weight", 
                    "A binary tree with minimum height", 
                    "A path that visits each node exactly once"
                ],
                correctAnswer: "A subset of edges that forms a tree including every vertex with minimum total edge weight"
            },
            {
                question: "Which algorithm finds the maximum flow in a flow network?",
                options: ["Dijkstra's Algorithm", "Prim's Algorithm", "Ford-Fulkerson Algorithm", "Bellman-Ford Algorithm"],
                correctAnswer: "Ford-Fulkerson Algorithm"
            },
            {
                question: "What is the time complexity of the Floyd-Warshall algorithm for finding shortest paths?",
                options: ["O(V)", "O(E log V)", "O(V²)", "O(V³)"],
                correctAnswer: "O(V³)"
            },
            {
                question: "In graph theory, what is a bipartite graph?",
                options: [
                    "A graph with exactly two connected components", 
                    "A graph whose vertices can be divided into two disjoint sets such that every edge connects vertices from different sets", 
                    "A graph with exactly two cycles", 
                    "A graph with exactly two nodes"
                ],
                correctAnswer: "A graph whose vertices can be divided into two disjoint sets such that every edge connects vertices from different sets"
            },
            {
                question: "What does the max-flow min-cut theorem state?",
                options: [
                    "The maximum flow in a network equals the minimum capacity of any cut", 
                    "The maximum flow equals the minimum number of edges", 
                    "The maximum flow equals the minimum number of nodes", 
                    "The maximum flow equals the sum of all edge capacities"
                ],
                correctAnswer: "The maximum flow in a network equals the minimum capacity of any cut"
            },
            {
                question: "Which of these is NOT a graph traversal algorithm?",
                options: ["Depth-First Search", "Breadth-First Search", "Quick Sort", "Topological Sort"],
                correctAnswer: "Quick Sort"
            },
            {
                question: "What is a strongly connected component in a directed graph?",
                options: [
                    "A component with the maximum number of edges", 
                    "A subgraph where every vertex is reachable from every other vertex", 
                    "A component with exactly one cycle", 
                    "A component with no cycles"
                ],
                correctAnswer: "A subgraph where every vertex is reachable from every other vertex"
            },
            {
                question: "Which algorithm is used to find all pairs shortest paths in a graph?",
                options: ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Floyd-Warshall Algorithm", "Prim's Algorithm"],
                correctAnswer: "Floyd-Warshall Algorithm"
            },
            {
                question: "What is the chromatic number of a graph?",
                options: [
                    "The number of edges in the graph", 
                    "The minimum number of colors needed to color the vertices such that no adjacent vertices have the same color", 
                    "The number of connected components", 
                    "The maximum degree of any vertex"
                ],
                correctAnswer: "The minimum number of colors needed to color the vertices such that no adjacent vertices have the same color"
            },
            {
                question: "What is the time complexity of Kruskal's algorithm for finding a minimum spanning tree?",
                options: ["O(V)", "O(E)", "O(V log V)", "O(E log E)"],
                correctAnswer: "O(E log E)"
            }
        ],
        "daily-quiz": [
            {
                question: "What is the time complexity of accessing an element in an array by index?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(1)"
            },
            {
                question: "Which data structure uses LIFO (Last In First Out) principle?",
                options: ["Queue", "Stack", "Linked List", "Tree"],
                correctAnswer: "Stack"
            },
            {
                question: "What is a base case in recursion?",
                options: [
                    "The case where the function calls itself", 
                    "The case where the function returns without calling itself", 
                    "The first call to the function", 
                    "The last call to the function"
                ],
                correctAnswer: "The case where the function returns without calling itself"
            },
            {
                question: "Which sorting algorithm has the best average-case time complexity?",
                options: ["Bubble Sort", "Quick Sort", "Insertion Sort", "Selection Sort"],
                correctAnswer: "Quick Sort"
            },
            {
                question: "What is the time complexity of binary search?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(log n)"
            },
            {
                question: "In a min-heap, which element is at the root?",
                options: [
                    "The largest element", 
                    "The smallest element", 
                    "The middle element", 
                    "A random element"
                ],
                correctAnswer: "The smallest element"
            },
            {
                question: "What are the two key attributes of a dynamic programming problem?",
                options: [
                    "Sorting and searching", 
                    "Overlapping subproblems and optimal substructure", 
                    "Recursion and iteration", 
                    "Greedy choice and memoization"
                ],
                correctAnswer: "Overlapping subproblems and optimal substructure"
            },
            {
                question: "Which of these is NOT a linear data structure?",
                options: ["Array", "Linked List", "Stack", "Tree"],
                correctAnswer: "Tree"
            },
            {
                question: "What is the worst-case time complexity of quicksort?",
                options: ["O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
                correctAnswer: "O(n²)"
            },
            {
                question: "Which algorithm is used to find the shortest path in a weighted graph?",
                options: ["Depth-First Search", "Breadth-First Search", "Dijkstra's Algorithm", "Bubble Sort"],
                correctAnswer: "Dijkstra's Algorithm"
            }
        ]
    };
    
    // Return questions for the specified topic or an empty array if topic not found
    return allQuestions[topic] || [];
};

const AssessmentFlow = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const [user, setUser] = useState(null);
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("python");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testCases, setTestCases] = useState([]);
    const [testResults, setTestResults] = useState([]);
    const [isAssessmentStarted, setIsAssessmentStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [mood, setMood] = useState("neutral");
    
    // Quiz state
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [quizTimeLeft, setQuizTimeLeft] = useState(600); // 10 minutes in seconds
    const [isQuizTimeUp, setIsQuizTimeUp] = useState(false);
    const [showQuizSection, setShowQuizSection] = useState(true);
    const [showCodingSection, setShowCodingSection] = useState(false);
    const [showResultSection, setShowResultSection] = useState(false);
    const [totalScore, setTotalScore] = useState(0);
    
    // Assessment security implementation
    const { tabSwitchWarnings } = useAssessmentSecurity({
        onWarning: (warningCount, maxWarnings) => {
            setOutput(`⚠️ WARNING: Tab switching detected (${warningCount}/${maxWarnings}). Your assessment will be auto-submitted if you continue.`);
        },
        onAutoSubmit: () => {
            setIsTimeUp(true);
            autoSubmitCode();
        },
        isActive: showCodingSection && isAssessmentStarted && !isTimeUp && !loading
    });

    // --- User Authentication ---
    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                setUser(data.user);
            } else {
                navigate("/login");
            }
        };
        getUser();
    }, [navigate]);

    // --- Load Quiz Questions ---
    useEffect(() => {
        if (!problemId) return;
        
        // Load 10 quiz questions for the topic
        const allQuestions = getQuizQuestionsByTopic(problemId);
        
        // If we have more than 10 questions, randomly select 10
        if (allQuestions.length > 10) {
            const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
            setQuizQuestions(shuffled.slice(0, 10));
        } else {
            setQuizQuestions(allQuestions);
        }
    }, [problemId]);

    // --- Problem Loading ---
    useEffect(() => {
        const fetchProblem = async () => {
            if (!problemId) return;

            try {
                // First check if there's a specific problem for this topic
                let { data, error } = await supabase
                    .from("problems")
                    .select("*")
                    .eq("topic", problemId)
                    .order('difficulty', { ascending: true });

                if (error) throw error;
                
                // If no specific problem found, get a random problem
                if (!data || data.length === 0) {
                    const { data: randomProblem, error: randomError } = await supabase
                        .from("problems")
                        .select("*")
                        .limit(1)
                        .single();
                        
                    if (randomError) throw randomError;
                    setProblem(randomProblem);
                } else {
                    // Pick the first problem for this topic
                    setProblem(data[0]);
                }
            } catch (error) {
                console.error("Error fetching problem:", error);
                setOutput("Error loading problem. Please try again.");
            }
        };

        // Only fetch problem after quiz is submitted
        if (quizSubmitted && !problem) {
            fetchProblem();
        }
    }, [problemId, quizSubmitted, problem]);

    // --- Set Timer Based on Problem Difficulty ---
    useEffect(() => {
        if (!problem || !quizSubmitted) return;
        
        let timeInMinutes = 10; // Default to Easy
        if (problem.difficulty) {
            switch (problem.difficulty.toLowerCase()) {
                case 'easy':
                    timeInMinutes = 10;
                    break;
                case 'medium':
                    timeInMinutes = 20;
                    break;
                case 'hard':
                    timeInMinutes = 30;
                    break;
                default:
                    timeInMinutes = 10;
            }
        }
        
        setTimeLeft(timeInMinutes * 60); // Convert minutes to seconds
        
        // Set default code template based on language
        if (problem.templates && problem.templates[language]) {
            setCode(problem.templates[language]);
        }
        
        // Load test cases
        if (problem.test_cases) {
            setTestCases(problem.test_cases);
        }
    }, [problem, language, quizSubmitted]);

    // --- Quiz Timer Countdown Logic ---
    useEffect(() => {
        if (!showQuizSection || quizSubmitted || isQuizTimeUp) return;

        const timer = setInterval(() => {
            setQuizTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    setIsQuizTimeUp(true);
                    // Auto-submit quiz when time is up
                    handleQuizSubmit();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [showQuizSection, quizSubmitted, isQuizTimeUp]);

    // --- Coding Timer Countdown Logic ---
    useEffect(() => {
        if (!isAssessmentStarted || isTimeUp || !showCodingSection) return;

        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    setIsTimeUp(true);
                    // Auto-submit when time is up
                    autoSubmitCode();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isAssessmentStarted, isTimeUp, showCodingSection]);

    // Tab visibility detection is now handled by useAssessmentSecurity hook

    // --- Monaco Editor Setup ---
    useEffect(() => {
        if (editorRef.current) {
            // Register custom completions provider
            const disposable = monaco.languages.registerCompletionItemProvider(language, {
                provideCompletionItems: (model, position) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn
                    };

                    // Get language-specific suggestions
                    const suggestions = keywordSuggestions[language] || [];

                    return {
                        suggestions: suggestions.map(suggestion => ({
                            label: suggestion.label,
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: suggestion.insertText,
                            range: range,
                            detail: suggestion.detail || "",
                            documentation: suggestion.documentation || ""
                        }))
                    };
                }
            });

            return () => disposable.dispose();
        }
    }, [language, editorRef.current]);

    // --- Helper Functions ---
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    const handleAnswerSelect = (questionIndex, answer) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

    const handleQuizSubmit = () => {
        let score = 0;
        
        quizQuestions.forEach((question, index) => {
            if (selectedAnswers[index] === question.correctAnswer) {
                score++;
            }
        });
        
        const percentScore = Math.round((score / quizQuestions.length) * 100);
        setQuizScore(percentScore);
        setQuizSubmitted(true);
        
        // Move to coding section after quiz
        setTimeout(() => {
            setShowQuizSection(false);
            setShowCodingSection(true);
        }, 3000);
    };

    const startAssessment = async () => {
        if (!user || !problem) return;

        try {
            // Record assessment start in database
            const { error } = await supabase
                .from("user_assessments")
                .upsert({
                    user_id: user.id,
                    problem_id: problem.id,
                    topic: problemId,
                    started_at: new Date().toISOString(),
                    status: "in_progress"
                });

            if (error) throw error;

            setIsAssessmentStarted(true);
        } catch (error) {
            console.error("Error starting assessment:", error);
            setOutput("Error starting assessment. Please try again.");
        }
    };

    const saveCurrentCode = async () => {
        if (!user || !problem || !isAssessmentStarted) return;

        try {
            const { error } = await supabase
                .from("user_assessments")
                .update({
                    current_code: code,
                    last_saved_at: new Date().toISOString()
                })
                .eq("user_id", user.id)
                .eq("problem_id", problem.id);

            if (error) throw error;
        } catch (error) {
            console.error("Error saving code:", error);
        }
    };

    const runCode = async () => {
        if (!code.trim()) {
            setOutput("Please write some code first.");
            return;
        }

        setIsRunning(true);
        setMood("running");
        setOutput("Running code...");

        try {
            // Save current code first
            await saveCurrentCode();

            // Send code to backend for execution
            const response = await fetch("/api/run-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code,
                    language,
                    input: testCases.length > 0 ? testCases[0].input : ""
                }),
            });

            const result = await response.json();

            if (result.error) {
                setOutput(`Error: ${result.error}`);
                setMood("fail");
            } else {
                setOutput(result.output);
                setMood("success");
            }
        } catch (error) {
            console.error("Error running code:", error);
            setOutput(`Error: ${error.message}`);
            setMood("fail");
        } finally {
            setIsRunning(false);
        }
    };

    const submitCode = async () => {
        if (!code.trim()) {
            setOutput("Please write some code first.");
            return;
        }

        setIsSubmitting(true);
        setMood("running");
        setOutput("Submitting code...");

        try {
            // Save current code first
            await saveCurrentCode();

            // Run against all test cases
            const results = [];
            let allPassed = true;
            let passedCount = 0;

            for (const testCase of testCases) {
                const response = await fetch("/api/run-code", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        code,
                        language,
                        input: testCase.input
                    }),
                });

                const result = await response.json();
                const passed = !result.error && result.output.trim() === testCase.expected_output.trim();
                
                if (passed) passedCount++;
                else allPassed = false;
                
                results.push({
                    input: testCase.input,
                    expected: testCase.expected_output,
                    actual: result.error || result.output,
                    passed
                });
            }

            setTestResults(results);
            setMood(allPassed ? "success" : "fail");
            
            // Calculate coding score (each test case is worth 10 points)
            const codingScore = Math.round((passedCount / testCases.length) * 100);
            
            // Calculate total score (quiz is 40%, coding is 60%)
            const total = Math.round((quizScore * 0.4) + (codingScore * 0.6));
            setTotalScore(total);

            // Update assessment status in database
            const { error } = await supabase
                .from("user_assessments")
                .update({
                    status: "completed",
                    completed_at: new Date().toISOString(),
                    final_code: code,
                    passed_all_tests: allPassed,
                    quiz_score: quizScore,
                    coding_score: codingScore,
                    total_score: total,
                    score: total // For backward compatibility
                })
                .eq("user_id", user.id)
                .eq("problem_id", problem.id);

            if (error) throw error;
            
            // Update user's total score
            const { error: userError } = await supabase
                .rpc('increment_user_score', { 
                    user_id: user.id, 
                    score_increment: total 
                });
                
            if (userError) throw userError;

            // Show results section
            setShowCodingSection(false);
            setShowResultSection(true);
            
        } catch (error) {
            console.error("Error submitting code:", error);
            setOutput(`Error: ${error.message}`);
            setMood("fail");
        } finally {
            setIsSubmitting(false);
        }
    };

    const autoSubmitCode = async () => {
        if (!code.trim() || !user || !problem) return;

        try {
            // Calculate scores
            const codingScore = 0; // Auto-submission gets 0 for coding
            const total = Math.round(quizScore * 0.4); // Only quiz score counts
            
            // Update assessment status in database
            const { error } = await supabase
                .from("user_assessments")
                .update({
                    status: "timed_out",
                    completed_at: new Date().toISOString(),
                    final_code: code,
                    quiz_score: quizScore,
                    coding_score: codingScore,
                    total_score: total,
                    score: total // For backward compatibility
                })
                .eq("user_id", user.id)
                .eq("problem_id", problem.id);

            if (error) throw error;
            
            // Update user's total score (only quiz portion)
            const { error: userError } = await supabase
                .rpc('increment_user_score', { 
                    user_id: user.id, 
                    score_increment: total 
                });
                
            if (userError) throw userError;
            
            // Show results section with timeout message
            setOutput("Assessment time expired. Your work has been auto-submitted.");
            setShowCodingSection(false);
            setShowResultSection(true);
            setTotalScore(total);
            
        } catch (error) {
            console.error("Error auto-submitting code:", error);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    
    const exitAssessment = () => {
        navigate('/assessments');
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            {/* Header */}
            <div className="bg-white shadow-md p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold">
                        {showQuizSection ? `${problemId} Quiz` : 
                         showCodingSection ? (problem ? problem.title : "Loading...") : 
                         "Assessment Results"}
                    </h1>
                </div>
                
                <div className="flex items-center space-x-4">
                    {showCodingSection && (
                        <div className="flex items-center">
                            <span className="mr-2">Language:</span>
                            <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value)}
                                className="border rounded p-1"
                                disabled={!isAssessmentStarted || isTimeUp}
                            >
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                            </select>
                        </div>
                    )}
                    
                    {showQuizSection && (
                        <div className="text-red-500 font-bold">
                            Time Left: {formatTime(quizTimeLeft)}
                        </div>
                    )}
                    
                    {showCodingSection && (
                        <div className="text-red-500 font-bold">
                            Time Left: {formatTime(timeLeft)}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto p-4">
                {/* Quiz Section */}
                {showQuizSection && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-lg shadow-md p-6 mb-6"
                    >
                        <h2 className="text-2xl font-bold mb-4">Knowledge Assessment</h2>
                        <p className="mb-4">Answer the following 10 questions about {problemId}. You have 10 minutes to complete this section.</p>
                        
                        {quizSubmitted ? (
                            <div className="text-center p-4">
                                <h3 className="text-xl font-bold mb-2">Quiz Completed!</h3>
                                <p className="text-lg">Your Score: {quizScore}%</p>
                                <p className="mt-2">Proceeding to coding challenge...</p>
                            </div>
                        ) : (
                            <div>
                                {quizQuestions.map((question, index) => (
                                    <div key={index} className="mb-6 p-4 border rounded-lg">
                                        <p className="font-bold mb-2">{index + 1}. {question.question}</p>
                                        <div className="space-y-2">
                                            {question.options.map((option, optIndex) => (
                                                <div key={optIndex} className="flex items-center">
                                                    <input 
                                                        type="radio" 
                                                        id={`q${index}-opt${optIndex}`}
                                                        name={`question-${index}`}
                                                        value={option}
                                                        checked={selectedAnswers[index] === option}
                                                        onChange={() => handleAnswerSelect(index, option)}
                                                        disabled={isQuizTimeUp}
                                                        className="mr-2"
                                                    />
                                                    <label htmlFor={`q${index}-opt${optIndex}`}>{option}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                
                                <button 
                                    onClick={handleQuizSubmit}
                                    disabled={Object.keys(selectedAnswers).length < quizQuestions.length || isQuizTimeUp}
                                    className={`mt-4 px-6 py-2 rounded-lg ${Object.keys(selectedAnswers).length < quizQuestions.length ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold`}
                                >
                                    Submit Quiz
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Coding Section */}
                {showCodingSection && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Problem Description */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-lg shadow-md p-6"
                        >
                            <h2 className="text-2xl font-bold mb-4">{problem ? problem.title : "Loading..."}</h2>
                            
                            {!isAssessmentStarted ? (
                                <div>
                                    <p className="mb-4">You are about to start the coding assessment. Once you click "Start Assessment", the timer will begin.</p>
                                    <p className="mb-4">You will have {problem ? (problem.difficulty === 'easy' ? '10 minutes' : problem.difficulty === 'medium' ? '20 minutes' : '30 minutes') : '...'} to complete this challenge.</p>
                                    <p className="mb-4 font-bold">Rules:</p>
                                    <ul className="list-disc pl-5 mb-4">
                                        <li>Do not switch tabs or leave this page</li>
                                        <li>Pasting code is not allowed</li>
                                        <li>Your code will be auto-submitted when time expires</li>
                                    </ul>
                                    
                                    <button 
                                        onClick={startAssessment}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                                    >
                                        Start Assessment
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: problem ? problem.description : "Loading..." }} />
                                    
                                    <div className="flex space-x-4">
                                        <button 
                                            onClick={runCode}
                                            disabled={isRunning || isTimeUp}
                                            className={`px-4 py-2 rounded-lg ${isRunning || isTimeUp ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold flex items-center`}
                                        >
                                            {isRunning ? "Running..." : "Run Code"}
                                        </button>
                                        
                                        <button 
                                            onClick={submitCode}
                                            disabled={isSubmitting || isTimeUp}
                                            className={`px-4 py-2 rounded-lg ${isSubmitting || isTimeUp ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white font-bold flex items-center`}
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit Code"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                        
                        {/* Code Editor and Output */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col space-y-4"
                        >
                            {/* Code Editor */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden h-96">
                                <MonacoEditor
                                    height="100%"
                                    language={language}
                                    value={code}
                                    onChange={setCode}
                                    onMount={handleEditorDidMount}
                                    options={{
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        fontSize: 14,
                                        readOnly: !isAssessmentStarted || isTimeUp,
                                        wordWrap: "on",
                                        // Disable paste
                                        onPaste: (e) => e.preventDefault()
                                    }}
                                />
                            </div>
                            
                            {/* Output */}
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <h3 className="text-lg font-bold mb-2 flex items-center">
                                    Output
                                    {mood !== "neutral" && (
                                        <img src={moods[mood]} alt="mood" className="w-6 h-6 ml-2" />
                                    )}
                                </h3>
                                <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-40 whitespace-pre-wrap">
                                    {output || "Run your code to see output here."}
                                </pre>
                            </div>
                            
                            {/* Test Results */}
                            {testResults.length > 0 && (
                                <div className="bg-white rounded-lg shadow-md p-4">
                                    <h3 className="text-lg font-bold mb-2">Test Results</h3>
                                    <div className="space-y-2">
                                        {testResults.map((result, index) => (
                                            <div key={index} className={`p-2 rounded ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                                                <div className="font-bold">
                                                    Test Case {index + 1}: {result.passed ? "Passed" : "Failed"}
                                                </div>
                                                <div className="text-sm">
                                                    <div><span className="font-bold">Input:</span> {result.input}</div>
                                                    <div><span className="font-bold">Expected:</span> {result.expected}</div>
                                                    <div><span className="font-bold">Actual:</span> {result.actual}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
                
                {/* Results Section */}
                {showResultSection && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto"
                    >
                        <h2 className="text-2xl font-bold mb-6 text-center">Assessment Results</h2>
                        
                        <div className="flex justify-center mb-6">
                            <img 
                                src={totalScore >= 70 ? moods.success : moods.fail} 
                                alt="result mood" 
                                className="w-24 h-24" 
                            />
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center p-3 bg-blue-100 rounded">
                                <span className="font-bold">Quiz Score:</span>
                                <span>{quizScore}%</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-green-100 rounded">
                                <span className="font-bold">Coding Score:</span>
                                <span>{totalScore > quizScore * 0.4 ? Math.round((totalScore - (quizScore * 0.4)) / 0.6) : 0}%</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-purple-100 rounded text-lg font-bold">
                                <span>Total Score:</span>
                                <span>{totalScore}%</span>
                            </div>
                        </div>
                        
                        <div className="mb-6 p-4 border rounded">
                            <h3 className="font-bold mb-2">Feedback:</h3>
                            <p>
                                {totalScore >= 90 ? "Excellent work! You've demonstrated mastery of both theory and practical implementation." :
                                 totalScore >= 70 ? "Good job! You have a solid understanding of the concepts and decent coding skills." :
                                 totalScore >= 50 ? "You're on the right track, but there's room for improvement in both theory and practice." :
                                 "Keep practicing! Focus on strengthening your understanding of the core concepts and coding skills."}
                            </p>
                        </div>
                        
                        <div className="flex justify-center">
                            <button 
                                onClick={exitAssessment}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                            >
                                Exit Assessment
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AssessmentFlow;