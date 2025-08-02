const keywordSuggestions = {
javascript:[
  // Core Syntax & Control Flow
  "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "extends",
  "finally", "for", "function", "if", "import", "in", "instanceof", "let", "new", "return", "super", "switch", "this", "throw",
  "try", "typeof", "var", "void", "while", "with", "yield", "async", "await",

  // Variable and Scope
  "globalThis", "undefined", "NaN", "Infinity", "null", "true", "false",

  // Objects and Collections
  "Object", "Array", "Map", "WeakMap", "Set", "WeakSet", "Date", "RegExp", "Function", "Symbol", "Proxy", "Reflect",
  "TypedArray", "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array",
  "Float32Array", "Float64Array", "BigInt64Array", "BigUint64Array",

  // Math & Number
  "Math", "Math.abs", "Math.max", "Math.min", "Math.floor", "Math.ceil", "Math.round", "Math.random", "Math.pow", "Math.sqrt",
  "Math.PI", "Math.E", "Math.log", "Math.exp", "Math.sin", "Math.cos", "Math.tan",
  "Number", "parseInt", "parseFloat", "isNaN", "isFinite", "Number.isInteger", "Number.isSafeInteger", "Number.EPSILON", "Number.MAX_VALUE", "Number.MIN_VALUE",

  // String & Regex
  "String", "String.prototype.includes", "String.prototype.indexOf", "String.prototype.slice", "String.prototype.replace",
  "String.prototype.match", "String.prototype.split", "String.prototype.substring", "String.prototype.substr",
  "String.prototype.toLowerCase", "String.prototype.toUpperCase", "String.prototype.trim", "String.prototype.startsWith",
  "String.prototype.endsWith", "String.prototype.concat", "String.prototype.charCodeAt", "String.fromCharCode",
  "RegExp", "RegExp.prototype.test", "RegExp.prototype.exec",

  // Array Methods
  "Array.prototype.push", "Array.prototype.pop", "Array.prototype.shift", "Array.prototype.unshift", "Array.prototype.splice",
  "Array.prototype.slice", "Array.prototype.map", "Array.prototype.filter", "Array.prototype.reduce", "Array.prototype.forEach",
  "Array.prototype.find", "Array.prototype.findIndex", "Array.prototype.sort", "Array.prototype.includes", "Array.prototype.join",
  "Array.prototype.concat", "Array.prototype.flat", "Array.prototype.flatMap", "Array.isArray", "Array.from", "Array.of",

  // Object Methods
  "Object.keys", "Object.values", "Object.entries", "Object.assign", "Object.create", "Object.defineProperty",
  "Object.defineProperties", "Object.freeze", "Object.seal", "Object.is", "Object.getPrototypeOf", "Object.setPrototypeOf",

  // Browser Globals (Web APIs)
  "window", "document", "location", "navigator", "alert", "prompt", "confirm", "setTimeout", "setInterval", "clearTimeout",
  "clearInterval", "history", "screen", "XMLHttpRequest", "fetch", "Response", "Request", "Headers", "URL", "URLSearchParams",
  "FormData", "Blob", "File", "FileReader", "Worker", "ServiceWorker", "WebSocket", "EventSource", "indexedDB", "Notification",
  "localStorage", "sessionStorage", "performance", "console", "crypto", "CustomEvent",

  // Async / Promises
  "async", "await", "Promise", "Promise.all", "Promise.race", "Promise.any", "Promise.allSettled", "then", "catch", "finally",

  // Console & Debug
  "console", "console.log", "console.warn", "console.error", "console.info", "console.dir", "console.table", "console.time", "console.timeEnd",
  "debugger",

  // JSON & Storage
  "JSON", "JSON.stringify", "JSON.parse", "localStorage", "sessionStorage",

  // Advanced Utilities
  "Proxy", "Reflect", "Intl", "DataView", "ArrayBuffer", "SharedArrayBuffer", "Atomics", "BigInt", "eval", "WeakRef", "FinalizationRegistry",

  // DOM & Events (Expanded)
  "addEventListener", "removeEventListener", "querySelector", "querySelectorAll", "getElementById", "getElementsByClassName", "getElementsByTagName",
  "createElement", "createTextNode", "appendChild", "removeChild", "replaceChild", "insertBefore", "cloneNode",
  "innerHTML", "textContent", "innerText", "outerHTML", "value", "checked", "selected", "disabled", "className", "id", "name",
  "getAttribute", "setAttribute", "hasAttribute", "removeAttribute", "dataset", "style", "classList", "Event", "CustomEvent",
  "MouseEvent", "KeyboardEvent", "FocusEvent", "UIEvent", "TouchEvent", "PointerEvent", "DragEvent", "submit", "click", "input", "change", "load", "DOMContentLoaded", "error",

  // Miscellaneous
  "constructor", "prototype", "bind", "call", "apply", "arguments", "callee", "caller", "length", "name",
  "isPrototypeOf", "hasOwnProperty", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf",
  "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "escape", "unescape", "isFinite", "isNaN",
  "global", // Common in Node.js environments
  "process", // Common in Node.js environments
  "module", "exports", // Common in Node.js for CommonJS modules
  "_dirname", "_filename" // Common in Node.js
],

  typescript: [
  // Core JavaScript Keywords (also apply to TypeScript)
  "function", "const", "let", "var", "return", "if", "else", "for", "while", "switch", "case", "break", "continue",
  "do", "try", "catch", "finally", "throw", "debugger", "this", "super", "new", "delete", "in", "instanceof", "typeof",
  "void", "null", "undefined", "true", "false", "debugger", "with", "export", "import", "await", "async", "yield",

  // Classes & OOP (TypeScript specific and JavaScript with decorators)
  "class", "interface", "implements", "extends", "public", "private", "protected", "readonly", "static", "abstract",
  "constructor", "super", "this", "get", "set", "@override", "@", "implements",

  // Type System (TypeScript specific)
  "type", "typeof", "keyof", "instanceof", "as", "infer", "is", "enum", "any", "unknown", "never", "void", "undefined", "null", "boolean", "number", "string", "symbol", "bigint", "object",
  "union", "intersection", "literal", "tuple", "void", "any", "unknown", "never", "declare", "namespace", "module", "type",
  "satisfies", "asserts", "is",

  // Modules & Namespaces
  "import", "export", "namespace", "module", "from", "require", "declare", "default", "as",

  // Async & Promises
  "async", "await", "Promise", "then", "catch", "finally",

  // Utility Types (Built-in and commonly used)
  "Partial", "Required", "Readonly", "Record", "Pick", "Omit", "Exclude", "Extract", "NonNullable", "ReturnType", "InstanceType", "Awaited", "Parameters", "ConstructorParameters",
  "Uppercase", "Lowercase", "Capitalize", "Uncapitalize",

  // Decorators (common usage)
  "@Decorator", "@Injectable", "@Component", "@Module", "@Input", "@Output", "@HostListener",

  // DOM / JS Interop (Common global objects and methods)
  "console", "console.log", "console.warn", "console.error", "setTimeout", "setInterval", "clearTimeout", "clearInterval",
  "Error", "Map", "Set", "WeakMap", "WeakSet", "Array", "Object", "Date", "RegExp", "Math", "JSON", "String", "Number", "Boolean",
  "Promise", "Symbol", "BigInt", "ArrayBuffer", "DataView", "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array",
  "Int32Array", "Uint32Array", "Float32Array", "Float64Array", "URL", "URLSearchParams", "FormData", "Headers", "Request", "Response",
  "fetch", "localStorage", "sessionStorage", "document", "window", "navigator",

  // Special TypeScript Syntax/Keywords
  "interface", "type", "enum", "declare", "namespace", "module", "readonly", "public", "private", "protected", "abstract",
  "static", "implements", "extends", "keyof", "typeof", "infer", "as", "is", "satisfies", "asserts",
  "undefined", "null", "void", "never", "unknown", "any",
  "_" // For unused parameters in tuples or destructuring
],
  python: [
  // Core Syntax
  "def", "return", "yield", "lambda", "pass", "break", "continue", "assert", "raise", "del", "global", "nonlocal",

  // Control Flow
  "if", "elif", "else", "for", "while", "try", "except", "finally", "with", "as",

  // Class & OOP
  "class", "self", "init", "_init", "str", "name_", "super", "@classmethod", "@staticmethod", "@property", "abc", "abstractmethod",

  // Constants & Booleans
  "True", "False", "None",

  // Built-in Functions
  "print", "input", "len", "range", "type", "isinstance", "id", "dir", "enumerate", "zip", "map", "filter", "sum", "min", "max",
  "sorted", "reversed", "abs", "all", "any", "bin", "chr", "ord", "hex", "oct", "round", "pow", "divmod", "callable",
  "eval", "exec", "open", "help", "input", "format", "globals", "locals", "hash", "setattr", "getattr", "hasattr", "delattr",

  // Built-in Data Types
  "int", "float", "str", "bool", "list", "tuple", "dict", "set", "frozenset", "bytes", "bytearray", "memoryview", "complex",

  // Common Standard Modules (and some common module keywords/functions)
  "os", "sys", "math", "random", "datetime", "time", "json", "re", "collections", "itertools", "functools", "heapq", "bisect",
  "logging", "argparse", "unittest", "pytest", "threading", "multiprocessing", "asyncio", "requests", "numpy", "pandas", "matplotlib",
  "csv", "sqlite3", "decimal", "fractions", "dataclasses", "enum", "typing",

  // File & System (keywords/methods commonly used with files/OS)
  "open", "read", "write", "close", "seek", "flush", "tell",
  "os.path", "sys.argv", "os.getenv", "os.environ", "os.getcwd", "os.listdir", "os.mkdir", "os.remove", "os.rename",

  // Dunder (Special) Methods - expanded list
  "_init", "str", "repr", "len", "getitem", "setitem", "delitem", "iter", "next_",
  "_call", "add", "sub", "mul", "truediv", "floordiv", "mod", "pow_",
  "_eq", "ne", "lt", "le", "gt", "ge_",
  "_enter", "exit", "contains", "hash", "bool", "getattr", "setattr", "delattr_",
  "_getattribute", "dir", "slots_"
],
  java: [
  // Core Java Keywords
  "public", "private", "protected", "class", "static", "void", "int", "double", "float", "char", "String", "boolean",
  "long", "short", "byte", "new", "return", "if", "else", "switch", "case", "break", "continue", "try", "catch", "finally",
  "throw", "throws", "extends", "implements", "abstract", "interface", "enum", "package", "import", "this", "super",
  "synchronized", "volatile", "transient", "final", "instanceof", "default", "strictfp", "native", "goto", "const", "assert",

  // Control Flow Keywords (explicitly listing common uses)
  "for", "while", "do",

  // Access Modifiers (already covered but good to be explicit about context)
  // "public", "private", "protected", (already above)

  // Class & OOP (more specific keywords/concepts)
  "class", "interface", "enum", "extends", "implements", "abstract", "final", "static", "this", "super",
  "new", "instanceof", "@Override", "@Deprecated", "@FunctionalInterface",

  // Exception Handling
  "try", "catch", "finally", "throw", "throws", "Exception", "RuntimeException", "Error", "Throwable",

  // Constants & Literals
  "true", "false", "null",

  // Utility Classes and Functions (expanded common ones)
  "System", "System.out", "System.in", "System.err", "Math", "Math.max", "Math.min", "Math.abs", "Math.round", "Math.sqrt", "Math.pow",
  "Arrays", "Arrays.sort", "Arrays.fill", "Arrays.asList", "Arrays.equals", "Objects", "Collections", "Collections.sort", "StringJoiner",

  // Java Collections Framework (expanded)
  "ArrayList", "List", "LinkedList", "Vector", "Stack",
  "HashMap", "Map", "Set", "HashSet", "LinkedHashSet", "TreeSet", "TreeMap", "Hashtable",
  "Queue", "PriorityQueue", "Deque", "ArrayDeque",
  "Iterator", "Iterable", "Comparator", "Comparable",

  // I/O and Input Utilities (expanded)
  "Scanner", "BufferedReader", "InputStreamReader", "OutputStreamWriter", "FileReader", "FileWriter", "PrintWriter",
  "File", "FileInputStream", "FileOutputStream", "BufferedInputStream", "BufferedOutputStream",
  "DataInputStream", "DataOutputStream", "ObjectInputStream", "ObjectOutputStream",
  "StringTokenizer",

  // Concurrency & Threading
  "Thread", "Runnable", "Callable", "Future", "ExecutorService", "Executors", "Semaphore", "CountDownLatch", "CyclicBarrier",
  "ReentrantLock", "Lock", "synchronized", "volatile",

  // Reflection
  "Class", "Method", "Field", "Constructor", "AccessibleObject",

  // Annotations
  "@Override", "@Deprecated", "@SuppressWarnings", "@FunctionalInterface", "@SafeVarargs", "@Retention", "@Target",

  // Generics
  "<T>", "?", "extends", "super",

  // Lambda Expressions and Streams
  "->", "::", "stream", "lambda", "Optional",

  // Networking (common classes)
  "Socket", "ServerSocket", "URL", "URLConnection", "HttpURLConnection",

  // Common Standard Libraries/Packages (beyond specific classes)
  "java.lang", "java.util", "java.io", "java.net", "java.time", "java.sql", "java.text", "java.nio", "java.security",

  // Keywords from newer Java versions
  "var", "record", "sealed", "permits", "yield" // Contextual keywords for pattern matching (JEP 406)
],
  cpp: [
  // Core Data Types
  "int", "float", "double", "char", "string", "bool", "void", "auto", "long", "short", "signed", "unsigned",
  "wchar_t", "char16_t", "char32_t", "size_t", "ssize_t", "ptrdiff_t", "nullptr_t", "byte",

  // Control Flow
  "if", "else", "switch", "case", "for", "while", "do", "break", "continue", "return", "goto",
  "default",

  // Functions & Parameters
  "inline", "const", "static", "virtual", "override", "explicit", "mutable", "this", "friend",
  "constexpr", "consteval", "constinit", "noexcept", "thread_local", "register", "extern",

  // Object-Oriented
  "class", "struct", "public", "private", "protected", "friend", "virtual", "override", "final",
  "union", "enum", "enum class", "typedef", "using", "typename",

  // Memory Management
  "new", "delete", "sizeof", "alignof", "decltype", "alignas", "noexcept",

  // Exception Handling
  "try", "catch", "throw", "noexcept", "throw_if_failed",

  // Templates & Generics
  "template", "typename", "concept", "requires", "auto", "decltype(auto)",

  // Preprocessor
  "#include", "#define", "#ifndef", "#endif", "#pragma", "#ifdef", "#undef", "#else", "#elif", "#error", "#warning", "#line",

  // Namespaces & Standard Library
  "namespace", "using", "std", "::",

  // Modern C++ Features
  "nullptr", "constexpr", "static_assert", "thread_local", "lambda", "->", "decltype", "typeid", "operator", "enum", "enum class",
  "variant", "optional", "tuple", "pair", "any", "string_view", "span", "filesystem", "chrono", "future", "promise", "packaged_task",
  "atomic", "smart_ptr", "unique_ptr", "shared_ptr", "weak_ptr", "make_unique", "make_shared",

  // Streams and STL Containers (Common Usage)
  "cin", "cout", "cerr", "clog", "endl", "wcin", "wcout", "wcerr", "wclog",
  "vector", "map", "unordered_map", "set", "unordered_set", "stack", "queue", "priority_queue", "deque", "list", "array",
  "string", "wstring",
  "algorithm", "numeric", "iterator", "sort", "find", "count", "accumulate", "transform", "for_each",
  "min_element", "max_element", "next_permutation", "prev_permutation",
  "iostream", "fstream", "sstream", "iomanip",

  // Concurrency
  "thread", "mutex", "lock_guard", "unique_lock", "condition_variable", "async", "future", "promise",

  // Rvalue References and Move Semantics
  "&&", "std::move", "std::forward",

  // Casting Operators
  "static_cast", "dynamic_cast", "reinterpret_cast", "const_cast",

  // Operators
  "operator", "new", "delete", "sizeof", "alignof", "typeid", "throw", "noexcept"
],
  html: [
  // Document Structure
  "<!DOCTYPE html>", "<html>", "<head>", "<meta>", "<title>", "<base>", "<link>", "<style>", "<script>", "<noscript>", "<body>",

  // Layout / Semantic Structure
  "<header>", "<footer>", "<nav>", "<section>", "<article>", "<aside>", "<div>", "<span>",
  "<main>", "<address>", "<figure>", "<figcaption>", "<details>", "<summary>", "<data>", "<time>", "<mark>",
  "<template>", "<slot>", "<slot>",

  // Text Content
  "<p>", "<a>", "<h1>", "<h2>", "<h3>", "<h4>", "<h5>", "<h6>",
  "<em>", "<strong>", "<small>", "<sub>", "<sup>", "<cite>", "<code>", "<samp>", "<kbd>", "<var>",
  "<abbr>", "<dfn>", "<q>", "<blockquote>", "<pre>", "<del>", "<ins>", "<s>", "<u>", "<bdo>", "<bdi>",
  "<br>", "<wbr>", "<hr>",

  // Lists
  "<ul>", "<ol>", "<li>", "<dl>", "<dt>", "<dd>",

  // Tables
  "<table>", "<caption>", "<colgroup>", "<col>", "<thead>", "<tbody>", "<tfoot>", "<tr>", "<td>", "<th>",

  // Forms and Inputs
  "<form>", "<input>", "<textarea>", "<button>", "<label>", "<select>", "<option>", "<optgroup>",
  "<fieldset>", "<legend>", "<datalist>", "<output>", "<progress>", "<meter>",

  // Media & Embeds
  "<img>", "<picture>", "<source>", "<video>", "<audio>", "<track>", "<embed>", "<iframe>", "<object>", "<param>",
  "<map>", "<area>",

  // Scripts & Styles (explicitly listing attributes commonly used)
  "<script>", "<style>", "<link>",
  "src", "href", "rel", "type", "charset", "async", "defer", "integrity", "crossorigin", "media", "nonce",

  // Interactive Elements
  "<details>", "<summary>", "<dialog>",

  // Web Components (related attributes/concepts)
  "shadow-root", "custom elements", "template", "slot",

  // Attributes (Common and important global attributes)
  "id", "class", "style", "title", "lang", "dir", "draggable", "hidden", "tabindex", "contenteditable", "spellcheck",
  "data-", "role", "aria-",

  // HTML5 specific attributes/elements
  "min", "max", "step", "pattern", "placeholder", "required", "autofocus", "autocomplete", "formnovalidate", "list",
  "download", "ping", "target", "rel", "referrerpolicy", "sizes", "srcset", "controls", "autoplay", "loop", "muted", "poster",
  "preload", "datetime", "formmethod", "formaction", "formenctype", "formtarget", "novalidate", "multiple",

  // Deprecated/Less common but might be seen
  "<font>", "<center>", "<b>", "<i>", "<tt>"
],
  css: [  
    // Text & Font 
     "color",  "font-size",  "font-weight",  "font-family",  "text-align",  "text-decoration",  "text-transform",  "line-height",  "letter-spacing",  "word-spacing",  "text-shadow",  "white-space",  "font-style",  "font-variant",  "text-indent",  "vertical-align",  "direction",  "writing-mode",  "text-overflow",  "word-break",  "overflow-wrap",  "font-feature-settings",  "font-kerning",  "font-stretch",  "font-variant-caps",  "font-variant-numeric",  "font-variant-ligatures",
    // Backgrounds 
     "background",  "background-color",  "background-image",  "background-repeat",  "background-position",  "background-size",  "background-attachment",  "background-clip",  "background-origin",  
    // Box Model 
     "margin",  "margin-top",  "margin-right",  "margin-bottom",  "margin-left",  "padding",  "padding-top",  "padding-right",  "padding-bottom",  "padding-left",  "border",  "border-width",  "border-style",  "border-color",  "border-top",  "border-right",  "border-bottom",  "border-left",  "border-radius",  "border-top-left-radius",  "border-top-right-radius",  "border-bottom-left-radius",  "border-bottom-right-radius",  "box-shadow",  "outline",  "outline-width",  "outline-style",  "outline-color",  "outline-offset",  
    //Sizing
      "width",  "height",  "min-width",  "max-width",  "min-height",  "max-height",  "box-sizing",  "aspect-ratio",  "calc",  // Positioning  "position",  "top",  "right",  "bottom",  "left",  "absolute",  "relative",  "fixed",  "sticky",  "static",  "z-index",  
    //Display & Layout
      "display",  "flex",  "grid",  "inline",  "block",  "inline-block",  "none",  "flex-direction",  "flex-wrap",  "justify-content",  "align-items",  "align-content",  "gap",  "row-gap",  "column-gap",  "order",  "flex-grow",  "flex-shrink",  "flex-basis",  "align-self",  "grid-template-columns",  "grid-template-rows",  "grid-template-areas",  "grid-column-start",  "grid-column-end",  "grid-row-start",  "grid-row-end",  "grid-column",  "grid-row",  "grid-area",  "grid-auto-columns",  "grid-auto-rows",  "grid-auto-flow",  "place-items",  "place-content",  "place-self",  "float",  "clear",  "overflow",  "overflow-x",  "overflow-y",  "clip",  "resize",  "writing-mode",  
    // Visibility & Effects
      "opacity",  "visibility",  "transform",  "transform-origin",  "transition",  "transition-property",  "transition-duration",  "transition-timing-function",  "transition-delay",  "animation",  "animation-name",  "animation-duration",  "animation-timing-function",  "animation-delay",  "animation-iteration-count",  "animation-direction",  "animation-fill-mode",  "animation-play-state",  "filter",  "backdrop-filter",  "cursor",  "pointer-events",  "user-select",  "caret-color",  "outline",  "outline-offset",  "border-image",  "box-decoration-break",  "mix-blend-mode",  // Pseudo-classes and Pseudo-elements (often used in CSS)  ":hover",  ":active",  ":focus",  ":visited",  ":link",  ":nth-child",  ":first-child",  ":last-child",  ":before",  ":after",  "::selection",  "::placeholder",  ":not",  ":empty",  ":checked",  ":enabled",  ":disabled",  ":root", 
    // Units
      "px",  "em",  "rem",  "vh",  "vw",  "%",  "fr",  "auto",  
    // Custom Properties (Variables) 
     "--*",  "var",  
    // Media Queries (concept/keyword) 
     "@media",  "screen",  "print",  "min-width",  "max-width",
    // Selectors (common types)
      "element",  ".class",  "#id",  "[attribute]",  "[attribute=value]",  ":",  "::",  ">",  "+",  "~",  "*",
    // Functions 
     "url()",  "linear-gradient()",  "radial-gradient()",  "conic-gradient()",  "rgb()",  "rgba()",  "hsl()",  "hsla()",  "min()",  "max()",  "clamp()",  "var()",  "calc()",
    // Others
      "content",  "counter-reset",  "counter-increment",  "columns",  "column-count",  "column-gap",  "column-rule",  "list-style",  "list-style-type",  "list-style-position",  "list-style-image",  "table-layout",  "border-collapse",  "border-spacing",  "caption-side",  "empty-cells",  "src",  "format",  "font-display",  "@font-face",  "@keyframes",
    // Grid specific
      "grid-auto-flow",  "grid-column-gap",  "grid-row-gap",  "justify-items",  "justify-self",  "grid-template",  "grid-area",  "gap",
    // Scroll Behavior
      "scroll-behavior",  "scroll-snap-type",  "scroll-snap-align",  "scroll-snap-stop",
    // Accessibility
      "cursor",  "outline",  "tab-size", 
    // Transform related
      "perspective",  "perspective-origin",  "transform-style",  "backface-visibility",
    //Filter related
      "brightness",  "contrast",  "grayscale",  "hue-rotate",  "invert",  "saturate",  "sepia",  "drop-shadow"
],
};

export default keywordSuggestions;