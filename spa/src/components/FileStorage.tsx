import React, { useState, useEffect } from 'react';
import { Table, Breadcrumb, Button, Modal, Input, Upload, message, Popconfirm, Tooltip } from 'antd';
import { 
    FolderOutlined, 
    FileOutlined, 
    UploadOutlined, 
    HomeOutlined, 
    DeleteOutlined, 
    DownloadOutlined 
} from '@ant-design/icons';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
// Use the shared API client that handles the Auth Token automatically
import api from '../lib/api';

interface FileItem {
    id: number;
    name: string;
    is_folder: boolean;
    size: number;
    mime_type: string | null;
    updated_at: string;
}

interface BreadcrumbItem {
    id: number;
    name: string;
}

const FileStorage: React.FC = () => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchFiles = async (parentId: number | null) => {
        setLoading(true);
        try {
            // Updated to standard REST endpoint '/files'
            const response = await api.get('/files', {
                params: { parent_id: parentId }
            });
            setFiles(response.data.files);
            setBreadcrumbs(response.data.breadcrumbs);
        } catch (error) {
            console.error(error);
            message.error('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(currentFolderId);
    }, [currentFolderId]);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            // Updated to standard REST endpoint '/folders'
            await api.post('/folders', {
                name: newFolderName,
                parent_id: currentFolderId
            });
            message.success('Folder created');
            setIsModalOpen(false);
            setNewFolderName('');
            fetchFiles(currentFolderId);
        } catch (error) {
            message.error('Failed to create folder');
        }
    };

    const handleUpload = async (options: UploadRequestOption) => {
        const { file, onSuccess, onError } = options;
        const formData = new FormData();
        formData.append('file', file as Blob);
        if (currentFolderId) {
            formData.append('parent_id', currentFolderId.toString());
        }

        try {
            await api.post('/files', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (onSuccess) onSuccess("ok");
            message.success('File uploaded');
            fetchFiles(currentFolderId);
        } catch (error) {
            if (onError) onError(error as Error);
            message.error('Upload failed');
        }
    };

    const handleDownload = async (record: FileItem) => {
        try {
            const response = await api.get(`/files/${record.id}/download`, {
                responseType: 'blob',
            });
            
            // Create a blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', record.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            message.error('Failed to download file');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/files/${id}`);
            message.success('Item deleted');
            fetchFiles(currentFolderId);
        } catch (error) {
            message.error('Failed to delete item');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: FileItem) => (
                <div 
                    style={{ 
                        cursor: record.is_folder ? 'pointer' : 'default', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: record.is_folder ? '#1890ff' : 'inherit',
                        fontWeight: record.is_folder ? 500 : 400
                    }}
                    onClick={() => record.is_folder && setCurrentFolderId(record.id)}
                >
                    {record.is_folder ? 
                        <FolderOutlined style={{ fontSize: '18px', color: '#faad14' }} /> : 
                        <FileOutlined style={{ fontSize: '18px', color: '#8c8c8c' }} />
                    }
                    {text}
                </div>
            ),
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
            render: (size: number, record: FileItem) => 
                record.is_folder ? '-' : `${(size / 1024).toFixed(2)} KB`,
            width: 120,
        },
        {
            title: 'Last Modified',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (date: string) => new Date(date).toLocaleString(),
            width: 200,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: any, record: FileItem) => (
                <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                    {!record.is_folder && (
                        <Tooltip title="Download">
                            <Button 
                                type="text" 
                                icon={<DownloadOutlined />} 
                                size="small" 
                                onClick={() => handleDownload(record)}
                            />
                        </Tooltip>
                    )}
                    <Popconfirm
                        title="Delete this item?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                            size="small" 
                        />
                    </Popconfirm>
                </div>
            ),
        }
    ];

    return (
        <div style={{ padding: '24px', background: '#fff', minHeight: '100vh' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Breadcrumb>
                    <Breadcrumb.Item onClick={() => setCurrentFolderId(null)} style={{ cursor: 'pointer' }}>
                        <HomeOutlined />
                    </Breadcrumb.Item>
                    {breadcrumbs.map((crumb) => (
                        <Breadcrumb.Item key={crumb.id} onClick={() => setCurrentFolderId(crumb.id)} style={{ cursor: 'pointer' }}>
                            {crumb.name}
                        </Breadcrumb.Item>
                    ))}
                </Breadcrumb>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button onClick={() => setIsModalOpen(true)}>New Folder</Button>
                    <Upload customRequest={handleUpload} showUploadList={false}>
                        <Button icon={<UploadOutlined />}>Upload File</Button>
                    </Upload>
                </div>
            </div>

            <Table 
                dataSource={files} 
                columns={columns} 
                rowKey="id" 
                loading={loading} 
                pagination={false}
                onRow={(record) => ({
                    onClick: () => {
                        if (record.is_folder) setCurrentFolderId(record.id);
                    },
                    style: { cursor: record.is_folder ? 'pointer' : 'default' }
                })}
            />

            <Modal 
                title="Create New Folder" 
                open={isModalOpen} 
                onOk={handleCreateFolder} 
                onCancel={() => setIsModalOpen(false)}
            >
                <Input 
                    placeholder="Folder Name" 
                    value={newFolderName} 
                    onChange={(e) => setNewFolderName(e.target.value)} 
                    onPressEnter={handleCreateFolder} 
                    autoFocus
                />
            </Modal>
        </div>
    );
};

export default FileStorage;