import React, { useState } from 'react';
import QuillEditor from './components/RichTextEditor/QuillEditor';
import { callOpenAI } from './components/OpenAIApi/OpenAIApi';
import FileSaver from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';

function App() {
    const [editorContent, setEditorContent] = useState('');
    const [openAIResponse, setOpenAIResponse] = useState(null);
    const [docContent, setDocContent] = useState(null);
    const [docBlob, setDocBlob] = useState(null); // New state variable to store the DOCX blob

    const handleSubmission = async () => {
        try {
            const response = await callOpenAI(editorContent);
            setOpenAIResponse(response);
            setDocContent(response);
        } catch (error) {
            console.error('Error in submission', error);
        }
    };

    const saveDocxFile = () => {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun(docContent),
                            ],
                        }),
                    ],
                },
            ],
        });

        // Used to export the file into a .docx file
        Packer.toBlob(doc).then(blob => {
            FileSaver.saveAs(blob, "generated_document.docx");
            setDocBlob(blob); // Store the blob in state
        });
    };

    const uploadToGoogleDrive = async () => {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun(docContent),
                            ],
                        }),
                    ],
                },
            ],
        });

        // Used to export the file into a .docx file
        if (docBlob) {
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const closeDelimiter = "\r\n--" + boundary + "--";

            const contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            const metadata = {
                'name': 'generated_document.docx',
                'mimeType': contentType,
            };

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                '\r\n' +
                btoa(new Uint8Array(docBlob).reduce((data, byte) => data + String.fromCharCode(byte), '')) +
                closeDelimiter;

            try {
                let accessToken = process.env.REACT_APP_GOOGLE_ACCESS_TOKEN;

                const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': `multipart/related; boundary=${boundary}`,
                    },
                    body: multipartRequestBody,
                });

                const result = await response.json();
                console.log('File uploaded to Google Drive:', result);
            } catch (error) {
                console.error('Error uploading file to Google Drive:', error);
            }
        } else {
            console.error('No DOCX blob available for upload');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <QuillEditor value={editorContent} handleChange={setEditorContent} />
            <button
                onClick={handleSubmission}
                className="mt-4 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
                Submit
            </button>
            {openAIResponse && (
                <div className="mt-4 p-4 bg-gray-100 w-4/5 border rounded-lg" dangerouslySetInnerHTML={{ __html: openAIResponse }} />
            )}
            {docContent && (
                <button
                    onClick={saveDocxFile}
                    className="mt-4 py-2 px-4 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                >
                    Save as DOCX
                </button>
            )}
            {docContent && (
                <button
                    onClick={uploadToGoogleDrive}
                    className="mt-4 py-2 px-4 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
                >
                    Upload to Google Drive
                </button>
            )}
        </div>
    );
}

export default App;
