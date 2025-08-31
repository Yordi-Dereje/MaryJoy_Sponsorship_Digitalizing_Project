import React from "react";
import { FileText, X } from "lucide-react";

const FilePreview = ({ fileName, fileId, onRemove }) => {
  return (
    <div className="file-preview flex items-center bg-gray-100 rounded-lg p-3 mt-2">
      <div className="file-preview-icon mr-3 text-gray-600">
        <FileText size={20} />
      </div>
      <div className="file-preview-name flex-1 text-sm text-gray-700">
        {fileName}
      </div>
      <button
        className="remove-file text-red-500"
        onClick={() => onRemove(fileId)}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default FilePreview;
