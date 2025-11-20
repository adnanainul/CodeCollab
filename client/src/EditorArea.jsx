import React, { useRef, useState, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import debounce from "lodash.debounce";

export default function EditorArea({
  socket,
  roomId,
  username,
  initialContent,
  initialVersion,
  language,
  darkMode,
  userColors,
  onCodeChange,
}) {
  const [value, setValue] = useState(initialContent || "");
  const [version, setVersion] = useState(initialVersion || 0);

  const editorRef = useRef(null);
  const decorationsRef = useRef({}); // Track remote cursor highlights

  /* ---------------------- Load initial content ---------------------- */
  useEffect(() => {
    setValue(initialContent || "");
    setVersion(initialVersion || 0);

    if (onCodeChange) onCodeChange(initialContent || "");
  }, [initialContent, initialVersion]);


  /* ---------------------- Receive remote code updates ---------------------- */
  useEffect(() => {
    if (!socket) return;

    const onRemoteChange = ({ content, version: incoming }) => {
      if (incoming > version) {
        setVersion(incoming);
        setValue(content);
        if (onCodeChange) onCodeChange(content);
      }
    };

    socket.on("code_change", onRemoteChange);
    return () => socket.off("code_change", onRemoteChange);
  }, [socket, version]);


  /* ---------------------- Send updates (debounced) ---------------------- */
  const emitChange = useCallback(
    debounce((content, newVersion) => {
      socket.emit("code_change", { content, version: newVersion });
    }, 200),
    [socket]
  );

  const handleEditorChange = (val) => {
    const newVal = val || "";
    const newVer = version + 1;

    setValue(newVal);
    setVersion(newVer);

    if (onCodeChange) onCodeChange(newVal);

    emitChange(newVal, newVer);
  };


  /* ---------------------- Cursor Sync: Send cursor ---------------------- */
  const sendCursorPosition = useCallback(
    debounce((pos) => {
      socket.emit("cursor_change", {
        roomId,
        socketId: socket.id,
        cursor: pos,
      });
    }, 40),
    [socket, roomId]
  );

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;

    const listener = editor.onDidChangeCursorPosition((e) => {
      sendCursorPosition(e.position);
    });

    return () => listener.dispose();
  }, [sendCursorPosition]);


  /* ---------------------- Cursor Sync: Receive cursor ---------------------- */
  useEffect(() => {
    const onCursorUpdate = ({ socketId, cursor }) => {
      if (!editorRef.current || !cursor) return;

      const editor = editorRef.current;
      const color = userColors?.[socketId] || "yellow";

      if (decorationsRef.current[socketId]) {
        editor.deltaDecorations(decorationsRef.current[socketId], []);
      }

      const newDeco = editor.deltaDecorations([], [
        {
          range: {
            startLineNumber: cursor.lineNumber,
            endLineNumber: cursor.lineNumber,
            startColumn: cursor.column,
            endColumn: cursor.column,
          },
          options: {
            className: "remoteCursor",
            overviewRuler: { color, position: 4 },
          },
        },
      ]);

      decorationsRef.current[socketId] = newDeco;
    };

    socket.on("cursor_change", onCursorUpdate);

    return () => socket.off("cursor_change", onCursorUpdate);
  }, [socket, userColors]);


  /* ---------------------- Render Monaco Editor ---------------------- */
  return (
    <div className="editor-wrapper">
      <Editor
        theme={darkMode ? "vs-dark" : "light"}
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={(editor) => (editorRef.current = editor)}
        options={{
          fontSize: 15,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
