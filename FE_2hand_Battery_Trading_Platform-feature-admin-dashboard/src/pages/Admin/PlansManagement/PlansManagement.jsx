import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    message,
    Typography,
    Space,
    Popconfirm,
    Tag,
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
import { useOutletContext } from "react-router-dom"; // THÊM IMPORT NÀY
import {
    getAllFees,
    createFee,
    updateFee,
    deleteFee,
} from "../../../services/FeeCommissions/feeCommissionService";

const { Title } = Typography;
const { Option } = Select;

const PlansManagement = () => {
    // THÊM 2 DÒNG NÀY ĐỂ NHẬN THEME
    const { theme } = useOutletContext();
    const isDark = theme === "dark";

    const [form] = Form.useForm();
    const [plans, setPlans] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [viewingPlan, setViewingPlan] = useState(null);

    // Hàm tải dữ liệu
    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await getAllFees();
            setPlans(response.data || []);
        } catch (error) {
            console.error("Lỗi khi tải danh sách gói:", error);
            message.error("Không thể tải danh sách gói. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi component được mount
    useEffect(() => {
        fetchPlans();
    }, []);

    // Mở modal để tạo gói mới
    const handleAddNew = () => {
        setEditingPlan(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    // Mở modal để chỉnh sửa gói
    const handleEdit = (record) => {
        setEditingPlan(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    // Xử lý xóa gói
    const handleDelete = async (feeId) => {
        try {
            await deleteFee(feeId);
            message.success("Đã xóa gói thành công!");
            fetchPlans();
        } catch (error) {
            console.error("Lỗi khi xóa gói:", error);
            message.error("Xóa gói thất bại. Vui lòng thử lại.");
        }
    };

    // Hủy modal (Edit/Create)
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleViewDetails = (record) => {
        setViewingPlan(record);
        setIsDetailModalVisible(true);
    };

    const handleDetailCancel = () => {
        setIsDetailModalVisible(false);
        setViewingPlan(null);
    };

    // Xử lý submit form (Tạo mới hoặc Cập nhật)
    const onFinish = async (values) => {
        setConfirmLoading(true);
        try {
            if (editingPlan) {
                await updateFee(editingPlan.feeId, values);
                message.success("Cập nhật gói thành công!");
            } else {
                await createFee(values);
                message.success("Tạo gói mới thành công!");
            }
            setIsModalVisible(false);
            fetchPlans();
        } catch (error) {
            console.error("Lỗi khi lưu gói:", error);
            message.error("Lưu gói thất bại. Vui lòng thử lại.");
        } finally {
            setConfirmLoading(false);
        }
    };

    // Định dạng tiền tệ
    const formatCurrency = (value) => {
        // Định dạng số với dấu chấm làm dấu phân cách nghìn
        const formattedPrice = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return formattedPrice + " VNĐ";
    };

    // Cấu hình các cột cho bảng
    const columns = [
        {
            title: "Tên Gói",
            dataIndex: "feeName",
            key: "feeName",
            sorter: (a, b) => a.feeName.localeCompare(b.feeName),
        },
        {
            title: "Loại Gói",
            dataIndex: "feeType",
            key: "feeType",
            render: (type) => (
                <Tag color={type === "Discount" ? "blue" : type === "Free" ? "default" : "green"}>
                    {type ? type.toUpperCase() : "N/A"}
                </Tag>
            ),
            filters: [
                { text: "Discount", value: "Discount" },
                { text: "Free", value: "Free" },
            ],
            onFilter: (value, record) => record.feeType.indexOf(value) === 0,
        },
        {
            title: "Giá",
            dataIndex: "amount",
            key: "amount",
            render: (amount) => formatCurrency(amount),
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: "Thời hạn (ngày)",
            dataIndex: "packageDurationDays",
            key: "packageDurationDays",
            sorter: (a, b) => a.packageDurationDays - b.packageDurationDays,
        },
        {
            title: "Số tin đăng",
            dataIndex: "maxListings",
            key: "maxListings",
            sorter: (a, b) => a.maxListings - b.maxListings,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
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
                            className={isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}
                        />
                    </Tooltip>

                    <Tooltip title="Sửa">
                        <Button
                            type="link"
                            icon={<EditOutlined style={{ color: isDark ? 'yellow' : 'orange' }} />}
                            onClick={() => handleEdit(record)}
                            className={isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa gói này?"
                        onConfirm={() => handleDelete(record.feeId)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                className={isDark ? 'text-red-400 hover:text-red-300' : ''}
                            />
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
                        Quản lý Gói Dịch vụ
                    </Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew} className="shadow-none">
                        Thêm Gói mới
                    </Button>
                </div>

                {/* Bảng hiển thị dữ liệu */}
                <Table
                    columns={columns}
                    dataSource={plans}
                    loading={loading}
                    rowKey="feeId"
                    bordered
                    className="shadow-sm"
                />

                {/* Modal cho Thêm mới / Chỉnh sửa */}
                <Modal
                    title={editingPlan ? "Chỉnh sửa Gói Dịch vụ" : "Tạo Gói Dịch vụ mới"}
                    open={isModalVisible}
                    onCancel={handleCancel}
                    onOk={() => form.submit()}
                    confirmLoading={confirmLoading}
                    destroyOnClose
                    width={800} // Tăng width để chứa 2 cột
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
                        name="planForm"
                        onFinish={onFinish}
                        initialValues={{ feeType: "Free", amount: 0, packageDurationDays: 7, maxListings: 1, savingAmount: 0 }}
                    >
                        {/* Row 1: 2 cột */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Cột trái */}
                            <div className="space-y-4">
                                <Form.Item
                                    name="feeName"
                                    label={<span style={{ color: isDark ? '#e5e7eb' : '#000000' }}>Tên Gói</span>}
                                    rules={[{ required: true, message: "Vui lòng nhập tên gói!" }]}
                                >
                                    <Input style={{
                                        backgroundColor: isDark ? '#374151' : '#ffffff',
                                        color: isDark ? '#e5e7eb' : '#000000',
                                        borderColor: isDark ? '#4b5563' : '#d1d5db'
                                    }} />
                                </Form.Item>

                                <Form.Item
                                    name="feeType"
                                    label={<span style={{ color: isDark ? '#e5e7eb' : '#000000' }}>Loại Gói</span>}
                                    rules={[{ required: true, message: "Vui lòng chọn loại gói!" }]}
                                >
                                    <Select
                                        placeholder="Chọn loại gói"
                                        style={{
                                            backgroundColor: isDark ? '#374151' : '#ffffff',
                                            color: isDark ? '#e5e7eb' : '#000000',
                                        }}
                                        popupClassName={isDark ? 'dark-select-dropdown' : ''}
                                    >
                                        <Option value="Discount">Discount (Giảm giá)</Option>
                                        <Option value="Free">Free (Miễn phí)</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="amount"
                                    label={<span style={{ color: isDark ? '#e5e7eb' : '#000000' }}>Giá (VND)</span>}
                                    rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
                                >
                                    <InputNumber
                                        className="w-full"
                                        min={0}
                                        step={1000}
                                        formatter={(value) =>
                                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                        }
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                        style={{
                                            backgroundColor: isDark ? '#374151' : '#ffffff',
                                            color: isDark ? '#e5e7eb' : '#000000',
                                            borderColor: isDark ? '#4b5563' : '#d1d5db'
                                        }}
                                    />
                                </Form.Item>
                            </div>

                            {/* Cột phải */}
                            <div className="space-y-4">
                                <Form.Item
                                    name="packageDurationDays"
                                    label={<span style={{ color: isDark ? '#e5e7eb' : '#000000' }}>Thời hạn (số ngày)</span>}
                                    rules={[{ required: true, message: "Vui lòng nhập thời hạn gói!" }]}
                                >
                                    <InputNumber
                                        className="w-full"
                                        min={1}
                                        style={{
                                            backgroundColor: isDark ? '#374151' : '#ffffff',
                                            color: isDark ? '#e5e7eb' : '#000000',
                                            borderColor: isDark ? '#4b5563' : '#d1d5db'
                                        }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="maxListings"
                                    label={<span style={{ color: isDark ? '#e5e7eb' : '#000000' }}>Số tin đăng tối đa</span>}
                                    rules={[{ required: true, message: "Vui lòng nhập số tin đăng!" }]}
                                >
                                    <InputNumber
                                        className="w-full"
                                        min={1}
                                        style={{
                                            backgroundColor: isDark ? '#374151' : '#ffffff',
                                            color: isDark ? '#e5e7eb' : '#000000',
                                            borderColor: isDark ? '#4b5563' : '#d1d5db'
                                        }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="savingAmount"
                                    label={<span style={{ color: isDark ? '#e5e7eb' : '#000000' }}>Số tiền tiết kiệm (VND)</span>}
                                    rules={[{ required: true, message: "Vui lòng nhập số tiền tiết kiệm!" }]}
                                >
                                    <InputNumber
                                        className="w-full"
                                        min={0}
                                        step={1000}
                                        formatter={(value) =>
                                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                        }
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                        style={{
                                            backgroundColor: isDark ? '#374151' : '#ffffff',
                                            color: isDark ? '#e5e7eb' : '#000000',
                                            borderColor: isDark ? '#4b5563' : '#d1d5db'
                                        }}
                                    />
                                </Form.Item>
                            </div>
                        </div>

                        {/* Row 2: Mô tả full width */}
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
                    title="Chi tiết Gói Dịch vụ"
                    open={isDetailModalVisible}
                    onCancel={handleDetailCancel}
                    footer={[
                        <Button
                            key="close"
                            onClick={handleDetailCancel}
                            className={isDark ? 'bg-gray-600 hover:bg-gray-500 border-gray-600 text-white' : ''}
                        >
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
                    {viewingPlan && (
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
                            <Descriptions.Item label="ID Gói">
                                {viewingPlan.feeId}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tên Gói">
                                {viewingPlan.feeName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại Gói">
                                <Tag color={viewingPlan.feeType === "Discount" ? "blue" : viewingPlan.feeType === "Free" ? "default" : "green"}>
                                    {viewingPlan.feeType ? viewingPlan.feeType.toUpperCase() : "N/A"}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá">
                                {formatCurrency(viewingPlan.amount)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời hạn">
                                {viewingPlan.packageDurationDays} ngày
                            </Descriptions.Item>
                            <Descriptions.Item label="Số tin đăng">
                                {viewingPlan.maxListings}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiết kiệm">
                                {formatCurrency(viewingPlan.savingAmount)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả">
                                {viewingPlan.description}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {new Date(viewingPlan.createdAt).toLocaleString("vi-VN")}
                            </Descriptions.Item>
                        </Descriptions>
                    )}
                </Modal>

                {/* CSS cho dropdown trong dark mode */}
                <style jsx>{`
          .dark-select-dropdown .ant-select-item {
            background-color: #374151;
            color: #e5e7eb;
          }
          .dark-select-dropdown .ant-select-item:hover {
            background-color: #4b5563;
          }
          .dark-select-dropdown .ant-select-item-option-selected {
            background-color: #1e40af;
          }
        `}</style>
            </div>
        </ConfigProvider>
    );
};

export default PlansManagement;