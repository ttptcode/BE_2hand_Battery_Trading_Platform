import React, { useState, useEffect } from "react";
import {
    Table,
    Card,
    Statistic,
    Row,
    Col,
    Tag,
    Typography,
    Space,
    Tooltip,
    Button,
    DatePicker,
    Select,
    Descriptions,
    Modal,
    ConfigProvider,
    Badge,
} from "antd";
import {
    EyeOutlined,
    ReloadOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import { useOutletContext } from "react-router-dom";

import { paymentService } from "../../../services/payment/paymentService";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const PaymentsManagement = () => {
    const { theme } = useOutletContext();
    const isDark = theme === "dark";

    const [payments, setPayments] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [viewingPayment, setViewingPayment] = useState(null);
    const [filters, setFilters] = useState({
        status: null,
        paymentMethod: null,
        feeType: null,
    });

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await paymentService.getAllPayments();
            setPayments(response.data || []);

            // Fetch statistics
            const stats = await paymentService.getPaymentStatistics();
            setStatistics(stats.data);
        } catch (error) {
            console.error("❌ Lỗi khi tải danh sách thanh toán:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleViewDetails = (record) => {
        setViewingPayment(record);
        setIsDetailModalVisible(true);
    };

    const handleDetailCancel = () => {
        setIsDetailModalVisible(false);
        setViewingPayment(null);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleResetFilters = () => {
        setFilters({
            status: null,
            paymentMethod: null,
            feeType: null,
        });
    };

    // Lọc dữ liệu dựa trên filters
    const filteredPayments = payments.filter(payment => {
        if (filters.status && payment.paymentStatus !== filters.status) return false;
        if (filters.paymentMethod && payment.paymentMethod !== filters.paymentMethod) return false;
        if (filters.feeType && payment.fee?.feeType !== filters.feeType) return false;
        return true;
    });

    const getStatusTag = (status) => {
        const statusConfig = {
            Success: { color: "green", icon: <CheckCircleOutlined />, text: "Thành công" },
            Fail: { color: "red", icon: <CloseCircleOutlined />, text: "Thất bại" },
            Pending: { color: "orange", icon: <SyncOutlined spin />, text: "Đang xử lý" },
        };

        const config = statusConfig[status] || { color: "default", text: status };
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    const getPaymentMethodTag = (method) => {
        const methodConfig = {
            VNpay: { color: "blue", text: "VNPay" },
            Momo: { color: "pink", text: "Momo" },
            ZaloPay: { color: "cyan", text: "ZaloPay" },
        };

        const config = methodConfig[method] || { color: "default", text: method };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: "Mã GD",
            dataIndex: "transactionRef",
            key: "transactionRef",
            width: 200,
            ellipsis: true,
            render: (text) => (
                <Text copyable style={{ fontSize: '12px' }}>
                    {text}
                </Text>
            ),
        },
        {
            title: "Người dùng",
            dataIndex: "user",
            key: "user",
            render: (user) => (
                <div>
                    <div className="font-medium">{user?.fullName || "N/A"}</div>
                    <div className="text-xs text-gray-500">{user?.phone}</div>
                </div>
            ),
        },
        {
            title: "Gói dịch vụ",
            dataIndex: "fee",
            key: "fee",
            render: (fee) => (
                <div>
                    <div className="font-medium">{fee?.feeName}</div>
                    <div className="text-xs text-gray-500">{fee?.feeType}</div>
                </div>
            ),
        },
        {
            title: "Số tiền",
            dataIndex: "amount",
            key: "amount",
            render: (amount) => (
                <Text strong className="text-green-600">
                    {amount?.toLocaleString('vi-VN')} ₫
                </Text>
            ),
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: "Phương thức",
            dataIndex: "paymentMethod",
            key: "paymentMethod",
            render: (method) => getPaymentMethodTag(method),
        },
        {
            title: "Trạng thái",
            dataIndex: "paymentStatus",
            key: "paymentStatus",
            render: (status) => getStatusTag(status),
            filters: [
                { text: "Thành công", value: "Success" },
                { text: "Thất bại", value: "Fail" },
                { text: "Đang xử lý", value: "Pending" },
            ],
            onFilter: (value, record) => record.paymentStatus === value,
        },
        {
            title: "Thời gian",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => new Date(text).toLocaleString("vi-VN"),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: "Hành động",
            key: "action",
            width: 80,
            render: (_, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                    />
                </Tooltip>
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
            colorTextPlaceholder: isDark ? '#9ca3af' : '#6b7280',
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
                headerBg: isDark ? '#374151' : '#fafafa',
                headerColor: isDark ? '#ffffff' : '#000000',
                rowHoverBg: isDark ? '#4b5563' : '#fafafa',
            },
            Card: {
                colorBgContainer: isDark ? '#374151' : '#ffffff',
            },
            Select: {
                optionSelectedBg: isDark ? '#374151' : '#f5f5f5',
                optionActiveBg: isDark ? '#4b5563' : '#e6f7ff',
                colorTextPlaceholder: isDark ? '#9ca3af' : '#6b7280',
            },
            DatePicker: {
                colorBgContainer: isDark ? '#374151' : '#ffffff',
                colorText: isDark ? '#e5e7eb' : '#000000',
            },
        },
    };


    return (
        <ConfigProvider theme={themeConfig}>
            <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <Title level={2} className={`!mb-0 ${isDark ? '!text-white' : '!text-gray-800'}`}>
                        Quản lý doanh thu
                    </Title>
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={fetchPayments}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </div>

                {/* Statistics Cards */}
                {statistics && (
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Tổng giao dịch"
                                    value={statistics.totalTransactions}
                                    prefix={<DollarOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Tổng tiền"
                                    value={statistics.totalAmount}
                                    precision={0}
                                    suffix="₫"
                                    valueStyle={{ color: '#52c41a' }}
                                    formatter={value => value.toLocaleString('vi-VN')}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Giao dịch thành công"
                                    value={statistics.successCount}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Tỷ lệ thành công"
                                    value={statistics.successRate}
                                    suffix="%"
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Filters */}
                <Card className="mb-6"
                    title={
                        <>
                            <FilterOutlined /> Bộ lọc
                        </>
                    }>
                    <Space wrap size="middle">
                        <Select
                            placeholder="Lọc theo trạng thái"
                            value={filters.status}
                            onChange={(value) => handleFilterChange('status', value)}
                            style={{ width: 150 }}
                            allowClear
                        >
                            <Option value="Success">Thành công</Option>
                            <Option value="Fail">Thất bại</Option>
                            <Option value="Pending">Đang xử lý</Option>
                        </Select>
                        <Select
                            placeholder="Lọc theo loại phí"
                            value={filters.feeType}
                            onChange={(value) => handleFilterChange('feeType', value)}
                            style={{ width: 150 }}
                            allowClear
                        >
                            <Option value="Pay1v1">Pay1v1</Option>
                            <Option value="Free">Free</Option>
                            <Option value="Discount">Discount</Option>
                        </Select>

                        <Button onClick={handleResetFilters}>
                            Xóa bộ lọc
                        </Button>
                    </Space>
                </Card>

                {/* Payments Table */}
                <Card
                    title={`Danh sách giao dịch (${filteredPayments.length})`}
                    extra={
                        <Text>
                            Hiển thị <strong>{filteredPayments.length}</strong> giao dịch
                        </Text>
                    }
                >
                    <Table
                        columns={columns}
                        dataSource={filteredPayments}
                        loading={loading}
                        rowKey="paymentId"
                        scroll={{ x: 1000 }}
                        pagination={{
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} giao dịch`,
                        }}
                    />
                </Card>

                {/* Payment Detail Modal */}
                <Modal
                    title="Chi tiết giao dịch"
                    open={isDetailModalVisible}
                    onCancel={handleDetailCancel}
                    footer={[
                        <Button key="close" onClick={handleDetailCancel}>
                            Đóng
                        </Button>,
                    ]}
                    width={700}
                    styles={{
                        header: {
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            color: isDark ? '#ffffff' : '#000000',
                        },
                        content: {
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        },
                    }}
                >
                    {viewingPayment && (
                        <Descriptions
                            bordered
                            column={1}
                            size="middle"
                            styles={{
                                label: {
                                    backgroundColor: isDark ? '#374151' : '#f9fafb',
                                    color: isDark ? '#e5e7eb' : '#000000',
                                    width: '200px',
                                },
                                content: {
                                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                    color: isDark ? '#e5e7eb' : '#000000',
                                }
                            }}
                        >
                            <Descriptions.Item label="Mã giao dịch">
                                <Text copyable>{viewingPayment.transactionRef}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Mã thanh toán">
                                {viewingPayment.paymentId}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người dùng">
                                <div>
                                    <div><strong>Họ tên:</strong> {viewingPayment.user?.fullName}</div>
                                    <div><strong>SĐT:</strong> {viewingPayment.user?.phone}</div>
                                    <div><strong>Email:</strong> {viewingPayment.user?.email || "N/A"}</div>
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Gói dịch vụ">
                                <div>
                                    <div><strong>Tên gói:</strong> {viewingPayment.fee?.feeName}</div>
                                    <div><strong>Loại:</strong> {viewingPayment.fee?.feeType}</div>
                                    <div><strong>Mô tả:</strong> {viewingPayment.fee?.description}</div>
                                    <div><strong>Thời hạn:</strong> {viewingPayment.fee?.packageDurationDays} ngày</div>
                                    <div><strong>Số tin tối đa:</strong> {viewingPayment.fee?.maxListings}</div>
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số tiền">
                                <Text strong className="text-lg text-green-600">
                                    {viewingPayment.amount?.toLocaleString('vi-VN')} ₫
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương thức">
                                {getPaymentMethodTag(viewingPayment.paymentMethod)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                {getStatusTag(viewingPayment.paymentStatus)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian tạo">
                                {new Date(viewingPayment.createdAt).toLocaleString("vi-VN")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian cập nhật">
                                {new Date(viewingPayment.updatedAt).toLocaleString("vi-VN")}
                            </Descriptions.Item>
                        </Descriptions>
                    )}
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default PaymentsManagement;