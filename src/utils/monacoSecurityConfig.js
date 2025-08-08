import * as monaco from 'monaco-editor';

/**
 * Configure Monaco Editor with security restrictions for hackathon mode
 * @param {monaco.editor.IStandaloneCodeEditor} editor - The Monaco editor instance
 * @param {Function} onSecurityViolation - Callback for security violations
 */
export const configureMonacoSecurity = (editor, onSecurityViolation = null) => {
  if (!editor) return;

  // Disable copy/paste commands
  const disableCommands = [
    'editor.action.clipboardCopyAction',
    'editor.action.clipboardPasteAction',
    'editor.action.clipboardCutAction',
    'editor.action.clipboardPasteAsPlainTextAction'
  ];

  disableCommands.forEach(commandId => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
      if (onSecurityViolation) onSecurityViolation('copy');
      return false;
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      if (onSecurityViolation) onSecurityViolation('paste');
      return false;
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {
      if (onSecurityViolation) onSecurityViolation('cut');
      return false;
    });
  });

  // Disable right-click context menu
  editor.onContextMenu(() => {
    if (onSecurityViolation) onSecurityViolation('right-click');
    return false;
  });

  // Disable find/replace
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
    if (onSecurityViolation) onSecurityViolation('find');
    return false;
  });

  // Disable undo/redo
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
    if (onSecurityViolation) onSecurityViolation('undo');
    return false;
  });
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ, () => {
    if (onSecurityViolation) onSecurityViolation('redo');
    return false;
  });

  // Disable select all
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA, () => {
    if (onSecurityViolation) onSecurityViolation('select-all');
    return false;
  });

  // Disable save
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    if (onSecurityViolation) onSecurityViolation('save');
    return false;
  });

  // Disable print
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
    if (onSecurityViolation) onSecurityViolation('print');
    return false;
  });

  // Disable quick suggestions and auto-completion
  editor.updateOptions({
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    acceptSuggestionOnEnter: 'off',
    tabCompletion: 'off',
    wordBasedSuggestions: false,
    parameterHints: {
      enabled: false
    },
    suggest: {
      enabled: false
    },
    hover: {
      enabled: false
    },
    links: false,
    colorDecorators: false,
    lightbulb: {
      enabled: false
    },
    codeActionsOnSave: {
      mode: 'never'
    }
  });

  // Disable drag and drop
  editor.onMouseDown((e) => {
    if (e.event.button === 2) { // Right mouse button
      if (onSecurityViolation) onSecurityViolation('right-click');
      e.event.preventDefault();
      return false;
    }
  });

  // Prevent text selection via keyboard shortcuts
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL, () => {
    if (onSecurityViolation) onSecurityViolation('line-select');
    return false;
  });

  // Disable multi-cursor
  editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyC, () => {
    if (onSecurityViolation) onSecurityViolation('multi-cursor');
    return false;
  });

  // Disable column selection
  editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyC, () => {
    if (onSecurityViolation) onSecurityViolation('column-select');
    return false;
  });
};

/**
 * Get Monaco Editor options for hackathon security mode
 * @returns {Object} Monaco editor options
 */
export const getHackathonMonacoOptions = () => ({
  minimap: { enabled: false },
  fontSize: 14,
  wordWrap: 'on',
  readOnly: false,
  contextmenu: false,
  quickSuggestions: false,
  suggestOnTriggerCharacters: false,
  acceptSuggestionOnEnter: 'off',
  tabCompletion: 'off',
  wordBasedSuggestions: false,
  parameterHints: { enabled: false },
  suggest: { enabled: false },
  hover: { enabled: false },
  links: false,
  colorDecorators: false,
  lightbulb: { enabled: false },
  codeActionsOnSave: { mode: 'never' },
  folding: false,
  lineNumbers: 'on',
  glyphMargin: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 3,
  renderLineHighlight: 'none',
  selectOnLineNumbers: false,
  roundedSelection: false,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  fixedOverflowWidgets: true,
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  scrollbar: {
    vertical: 'visible',
    horizontal: 'visible',
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
    useShadows: false
  }
});
