import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    message,
    Typography,
    Space,
    Popconfirm,
    Tooltip,
    Descriptions,
    ConfigProvider,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import { useOutletContext } from "react-router-dom";

import { itemTypeService } from "../../../services/itemstype/itemsTypeService";

const { Title } = Typography;

const ItemTypesManagement = () => {
    const { theme } = useOutletContext();
    const isDark = theme === "dark";

    const [form] = Form.useForm();
    const [itemTypes, setItemTypes] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItemType, setEditingItemType] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [viewingItemType, setViewingItemType] = useState(null);

    const fetchItemTypes = async () => {
        setLoading(true);
        try {
            const response = await itemTypeService.getAllItemTypes();
            setItemTypes(response.data?.data || []);
        } catch (error) {
            console.error("Lỗi khi tải danh sách loại:", error);
            message.error("Không thể tải danh sách loại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItemTypes();
    }, []);

    const handleAddNew = () => {
        setEditingItemType(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingItemType(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (itemTypeId) => {
        try {
            await itemTypeService.deleteItemType(itemTypeId);
            message.success("Đã xóa loại thành công!");
            fetchItemTypes();
        } catch (error) {
            console.error("Lỗi khi xóa loại:", error);
            message.error("Xóa loại thất bại. Vui lòng thử lại.");
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleViewDetails = (record) => {
        setViewingItemType(record);
        setIsDetailModalVisible(true);
    };

    const handleDetailCancel = () => {
        setIsDetailModalVisible(false);
        setViewingItemType(null);
    };

    const onFinish = async (values) => {
        setConfirmLoading(true);
        try {
            if (editingItemType) {
                await itemTypeService.updateItemType(editingItemType.itemTypeId, values);
                message.success("Cập nhật loại thành công!");
            } else {
                await itemTypeService.createItemType(values);
                message.success("Tạo loại mới thành công!");
            }
            setIsModalVisible(false);
            fetchItemTypes();
        } catch (error) {
            console.error("Lỗi khi lưu loại:", error);
            message.error("Lưu loại thất bại. Vui lòng thử lại.");
        } finally {
            setConfirmLoading(false);
        }
    };

    const columns = [
        {
            title: "Tên Loại",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => (text ? new Date(text).toLocaleString("vi-VN") : "N/A"),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: "Hành động",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>

                    <Tooltip title="Sửa">
                        <Button
                            type="link"
                            icon={<EditOutlined style={{ color: isDark ? 'yellow' : 'orange' }} />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa loại này?"
                        onConfirm={() => handleDelete(record.itemTypeId)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Xóa">
                            <Button type="link" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Custom theme cho Ant Design components
    const themeConfig = {
        token: {
            colorBgContainer: isDark ? '#1f2937' : '#ffffff',
            colorBgElevated: isDark ? '#374151' : '#ffffff',
            colorText: isDark ? '#e5e7eb' : '#000000',
            colorTextHeading: isDark ? '#f3f4f6' : '#000000',
            colorBorder: isDark ? '#4b5563' : '#d1d5db',
            colorPrimary: '#1890ff',
            boxShadow: 'none',
            boxShadowSecondary: 'none',
            // THÊM CÁC TOKEN MÀU CHO PAGINATION VÀ FILTER
            colorIcon: isDark ? '#ffffff' : '#000000', // Màu icon
            colorIconHover: isDark ? '#1890ff' : '#1890ff', // Màu icon khi hover
            colorBgTextHover: isDark ? '#374151' : '#f5f5f5', // Background khi hover
            colorBgTextActive: isDark ? '#4b5563' : '#e6e6e6', // Background khi active
        },
        components: {
            Button: {
                boxShadow: 'none',
                boxShadowSecondary: 'none',
                primaryShadow: 'none',
                colorBgContainer: isDark ? '#374151' : '#ffffff', // Background nút
                colorText: isDark ? '#ffffff' : '#000000', // Màu chữ nút
            },
            Pagination: {
                itemBg: isDark ? '#374151' : '#ffffff', // Background pagination item
                colorText: isDark ? '#ffffff' : '#000000', // Màu chữ pagination
                colorPrimary: '#1890ff', // Màu active
                colorPrimaryHover: '#40a9ff', // Màu hover
                colorIcon: isDark ? '#ffffff' : '#000000', // Màu icon prev/next
                colorIconHover: isDark ? '#1890ff' : '#1890ff', // Màu icon khi hover
            },
            Table: {
                headerBg: isDark ? '#374151' : '#fafafa', // Background header table
                headerColor: isDark ? '#ffffff' : '#000000', // Màu chữ header
                rowHoverBg: isDark ? '#4b5563' : '#fafafa', // Background khi hover row
            },
            Select: {
                optionSelectedBg: isDark ? '#374151' : '#f5f5f5', // Background option selected
                optionActiveBg: isDark ? '#4b5563' : '#e6f7ff', // Background option active
            },
        },
    };

    return (
        <ConfigProvider theme={themeConfig}>
            <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
                {/* Tiêu đề và Nút Thêm Mới */}
                <div className="flex justify-between items-center mb-6">
                    <Title level={2} className={`!mb-0 ${isDark ? '!text-white' : '!text-gray-800'}`}>
                        Quản lý Loại Sản phẩm
                    </Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew} className="shadow-none">
                        Thêm Loại mới
                    </Button>
                </div>

                {/* Bảng hiển thị dữ liệu */}
                <Table
                    columns={columns}
                    dataSource={itemTypes}
                    loading={loading}
                    rowKey="itemTypeId"
                    bordered
                    className="shadow-sm"
                />

                {/* Modal cho Thêm mới / Chỉnh sửa */}
                <Modal
                    title={editingItemType ? "Chỉnh sửa Loại" : "Tạo Loại mới"}
                    open={isModalVisible}
                    onCancel={handleCancel}
                    onOk={() => form.submit()}
                    confirmLoading={confirmLoading}
                    destroyOnClose
                    styles={{
                        header: {
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            color: isDark ? '#ffffff' : '#000000',
                        },
                        content: {
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            color: isDark ? '#ffffff' : '#000000',
                        },
                        body: {
                            color: isDark ? '#e5e7eb' : '#000000',
                        }
                    }}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        name="itemTypeForm"
                        onFinish={onFinish}
                        initialValues={{ name: "", description: "" }}
                    >
                        <Form.Item
                            name="name"
                            label={<span style={{ color: isDark ? '#e5e7eb' : '#000000' }}>Tên Loại</span>}
                            rules={[{ required: true, message: "Vui lòng nhập tên loại!" }]}
                        >
                            <Input style={{
                                backgroundColor: isDark ? '#374151' : '#ffffff',
                                color: isDark ? '#e5e7eb' : '#000000',
                                borderColor: isDark ? '#4b5563' : '#d1d5db'
                            }} />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label={<span style={{ color: isDark ? '#e5e7eb' : '#000000' }}>Mô tả</span>}
                        >
                            <Input.TextArea
                                rows={4}
                                style={{
                                    backgroundColor: isDark ? '#374151' : '#ffffff',
                                    color: isDark ? '#e5e7eb' : '#000000',
                                    borderColor: isDark ? '#4b5563' : '#d1d5db'
                                }}
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Modal Chi tiết */}
                <Modal
                    title="Chi tiết Loại"
                    open={isDetailModalVisible}
                    onCancel={handleDetailCancel}
                    footer={[
                        <Button key="close" onClick={handleDetailCancel}>
                            Đóng
                        </Button>,
                    ]}
                    styles={{
                        header: {
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            color: isDark ? '#ffffff' : '#000000',
                        },
                        content: {
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            color: isDark ? '#ffffff' : '#000000',
                        },
                        body: {
                            color: isDark ? '#e5e7eb' : '#000000',
                        }
                    }}
                >
                    {viewingItemType && (
                        <Descriptions
                            bordered
                            column={1}
                            styles={{
                                label: {
                                    backgroundColor: isDark ? '#374151' : '#f9fafb',
                                    color: isDark ? '#e5e7eb' : '#000000',
                                },
                                content: {
                                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                    color: isDark ? '#e5e7eb' : '#000000',
                                }
                            }}
                        >
                            <Descriptions.Item label="ID Loại">
                                {viewingItemType.itemTypeId}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tên Loại">
                                {viewingItemType.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả">
                                {viewingItemType.description}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {viewingItemType.createdAt
                                    ? new Date(viewingItemType.createdAt).toLocaleString("vi-VN")
                                    : "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày cập nhật">
                                {viewingItemType.updatedAt
                                    ? new Date(viewingItemType.updatedAt).toLocaleString("vi-VN")
                                    : "N/A"}
                            </Descriptions.Item>
                        </Descriptions>
                    )}
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default ItemTypesManagement;