import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles

function QuillEditor({ value, handleChange }) {
    return (
        <div className="w-4/5 flex items-center justify-center" style={{ height: '400px' }}>
            <ReactQuill
                value={value}
                onChange={handleChange}
                className="w-full h-full"
                theme="snow"
            />
        </div>
    );
}

export default QuillEditor;
