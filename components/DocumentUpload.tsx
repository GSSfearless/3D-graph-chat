import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { message, Progress, Card, Button, Space } from 'antd';
import { UploadOutlined, FileTextOutlined, DeleteOutlined } from '@ant-design/icons';
import { ProcessedDocument } from '../types/document';
import { processDocument } from '../utils/documentProcessor';

interface DocumentUploadProps {
  onDocumentParsed: (result: ProcessedDocument) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentParsed }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setUploading(true);
      setCurrentFile(file);
      setProgress(0);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // 处理文件
      const result = await processDocument(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      onDocumentParsed(result);
      message.success('文档解析成功！');
    } catch (error) {
      message.error('文档解析失败：' + error.message);
    } finally {
      setUploading(false);
    }
  }, [onDocumentParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    multiple: false
  });

  return (
    <Card className="upload-card">
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <Space direction="vertical" align="center">
          <UploadOutlined className="upload-icon" />
          <p>拖放文件到此处，或点击选择文件</p>
          <p className="upload-hint">
            支持 PDF、Word、TXT、Markdown 格式
          </p>
        </Space>
      </div>

      {currentFile && (
        <div className="file-info">
          <Space>
            <FileTextOutlined />
            <span>{currentFile.name}</span>
            <Button 
              icon={<DeleteOutlined />}
              onClick={() => setCurrentFile(null)}
              disabled={uploading}
            />
          </Space>
          {uploading && <Progress percent={progress} status="active" />}
        </div>
      )}
    </Card>
  );
};

export default DocumentUpload; 