import React, { useState } from "react";
import {
    Modal,
    Button,
    Form,
    Select,
    DatePicker,
    Space,
    message,
    Card,
    Typography,
    ConfigProvider,
} from "antd";
import {
    FilePdfOutlined,
    DownloadOutlined,
    PrinterOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import { useOutletContext } from "react-router-dom";

import { paymentService } from "../../../services/payment/paymentService";

const { Option } = Select;
const { Title, Text } = Typography;

const RevenueReportModal = () => {
    const { theme } = useOutletContext();
    const isDark = theme === "dark";

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    // Tạo danh sách năm (từ 2020 đến năm hiện tại + 1)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i);

    const showModal = () => {
        setIsModalVisible(true);
        // Set giá trị mặc định là năm hiện tại
        form.setFieldsValue({
            year: currentYear
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleDownload = async (values) => {
        const { year } = values;

        setLoading(true);
        try {
            await paymentService.downloadMonthlyRevenueReport(year);
            message.success(`Đã tải báo cáo doanh thu năm ${year} thành công!`);
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error('❌ Lỗi khi tải báo cáo:', error);
            message.error('Tải báo cáo thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const themeConfig = {
        token: {
            colorBgContainer: isDark ? '#1f2937' : '#ffffff',
            colorBgElevated: isDark ? '#374151' : '#ffffff',
            colorText: isDark ? '#e5e7eb' : '#000000',
            colorTextHeading: isDark ? '#f3f4f6' : '#000000',
            colorBorder: isDark ? '#4b5563' : '#d1d5db',
            colorPrimary: '#1890ff',
        },
        components: {
            Modal: {
                contentBg: isDark ? '#1f2937' : '#ffffff',
                headerBg: isDark ? '#1f2937' : '#ffffff',
                titleColor: isDark ? '#ffffff' : '#000000',
            },
            Select: {
                colorBgContainer: isDark ? '#374151' : '#ffffff',
                colorText: isDark ? '#e5e7eb' : '#000000',
            },
            Form: {
                labelColor: isDark ? '#e5e7eb' : '#000000',
            },
        },
    };

    return (
        <ConfigProvider theme={themeConfig}>
            <div>
                {/* Nút mở modal */}
                <Button
                    type="primary"
                    icon={<FilePdfOutlined />}
                    onClick={showModal}
                    className="flex items-center gap-2"
                    style={{
                        backgroundColor: '#dc2626', // Màu đỏ đặc trưng của PDF
                        borderColor: '#dc2626',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#b91c1c';
                        e.target.style.borderColor = '#b91c1c';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#dc2626';
                        e.target.style.borderColor = '#dc2626';
                    }}
                >
                    In Báo Cáo Doanh Thu
                </Button>

                {/* Modal */}
                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <FilePdfOutlined className="text-red-500" />
                            <span>In Báo Cáo Doanh Thu</span>
                        </div>
                    }
                    open={isModalVisible}
                    onCancel={handleCancel}
                    footer={null}
                    width={500}
                    className="rounded-lg"
                    styles={{
                        header: {
                            borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                            padding: '16px 24px',
                        },
                        body: {
                            padding: '24px',
                        }
                    }}
                >
                    {/* Thông tin báo cáo */}
                    <Card
                        className={`mb-6 border-l-4 border-l-blue-500 ${isDark ? 'bg-gray-800' : 'bg-blue-50'
                            }`}
                        size="small"
                    >
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${isDark ? 'bg-blue-900' : 'bg-blue-100'
                                }`}>
                                <FilePdfOutlined className="text-blue-500 text-lg" />
                            </div>
                            <div>
                                <Text strong className="block text-sm">
                                    Báo cáo doanh thu hàng tháng
                                </Text>
                                <Text type="secondary" className="text-xs">
                                    Tải về file PDF chứa biểu đồ và bảng doanh thu chi tiết theo từng tháng
                                </Text>
                            </div>
                        </div>
                    </Card>

                    {/* Form chọn năm */}
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleDownload}
                        className="space-y-4"
                    >
                        <Form.Item
                            name="year"
                            label={
                                <span className="flex items-center gap-2">
                                    <CalendarOutlined />
                                    Chọn năm báo cáo
                                </span>
                            }
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn năm!'
                                }
                            ]}
                        >
                            <Select
                                placeholder="Chọn năm"
                                size="large"
                                className="w-full"
                                suffixIcon={<CalendarOutlined />}
                            >
                                {years.map(year => (
                                    <Option key={year} value={year}>
                                        <div className="flex justify-between items-center">
                                            <span>Năm {year}</span>
                                            {year === currentYear && (
                                                <span className="text-xs text-green-500 bg-green-100 px-2 py-1 rounded">
                                                    Hiện tại
                                                </span>
                                            )}
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* Thông tin file */}
                        <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <div className="flex items-center gap-2 text-sm">
                                <FilePdfOutlined className="text-red-500" />
                                <Text type="secondary">
                                    File sẽ được tải về với tên: <strong>MonthlyRevenueReport_[NĂM].pdf</strong>
                                </Text>
                            </div>
                        </div>

                        {/* Nút hành động */}
                        <Form.Item className="mb-0 mt-6">
                            <Space size="middle" className="w-full flex justify-end">
                                <Button
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="min-w-[80px]"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    icon={<DownloadOutlined />}
                                    className="min-w-[120px] flex items-center gap-2"
                                >
                                    {loading ? 'Đang tải...' : 'Tải báo cáo'}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>

                    {/* Footer thông tin */}
                    <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'
                        }`}>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <PrinterOutlined />
                            <span>Báo cáo bao gồm biểu đồ và bảng số liệu chi tiết</span>
                        </div>
                    </div>
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default RevenueReportModal;