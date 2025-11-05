import React, { useState, useEffect } from "react";
import {
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Select,
    DatePicker,
    Button,
    Space,
    ConfigProvider,
    Tag,
} from "antd";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts";
import {
    DollarOutlined,
    ShoppingOutlined,
    UserOutlined,
    BarChartOutlined,
    ReloadOutlined,
    FilterOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import { useOutletContext } from "react-router-dom";

import { paymentService } from "../../../services/payment/paymentService";
import RevenueReportModal from "./RevenueReportModal";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Dashboard = () => {
    const { theme } = useOutletContext();
    const isDark = theme === "dark";

    const [payments, setPayments] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timeRange, setTimeRange] = useState("year"); // day, week, month, quarter, year
    const [filterType, setFilterType] = useState("yearRange"); // range, month, year, yearRange
    const [dateRange, setDateRange] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedYears, setSelectedYears] = useState([new Date().getFullYear()]);

    // Dữ liệu cho biểu đồ
    const [revenueData, setRevenueData] = useState([]);
    const [packageDistribution, setPackageDistribution] = useState([]);
    const [filteredStatistics, setFilteredStatistics] = useState(null);
    const [yearComparisonData, setYearComparisonData] = useState([]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await paymentService.getAllPayments();
            setPayments(response.data || []);

            const stats = await paymentService.getPaymentStatistics();
            setStatistics(stats.data);

            // Generate chart data với filter hiện tại
            generateChartData(response.data || []);
        } catch (error) {
            console.error("❌ Lỗi khi tải dữ liệu thanh toán:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterPaymentsByDate = (paymentData) => {
        if (!paymentData.length) return paymentData;

        let filtered = paymentData;

        // Lọc theo loại filter
        switch (filterType) {
            case "range":
                if (dateRange && dateRange.length === 2) {
                    const startDate = new Date(dateRange[0]);
                    const endDate = new Date(dateRange[1]);
                    endDate.setHours(23, 59, 59, 999);

                    filtered = paymentData.filter(payment => {
                        const paymentDate = new Date(payment.createdAt);
                        return paymentDate >= startDate && paymentDate <= endDate;
                    });
                }
                break;

            case "month":
                if (selectedMonth !== null) {
                    filtered = paymentData.filter(payment => {
                        const paymentDate = new Date(payment.createdAt);
                        return paymentDate.getMonth() === selectedMonth &&
                            paymentDate.getFullYear() === selectedYear;
                    });
                }
                break;

            case "year":
                filtered = paymentData.filter(payment => {
                    const paymentDate = new Date(payment.createdAt);
                    return paymentDate.getFullYear() === selectedYear;
                });
                break;

            case "yearRange":
                if (selectedYears.length > 0) {
                    filtered = paymentData.filter(payment => {
                        const paymentDate = new Date(payment.createdAt);
                        return selectedYears.includes(paymentDate.getFullYear());
                    });
                }
                break;

            default:
                break;
        }

        return filtered;
    };

    const generateChartData = (paymentData) => {
        // Lọc payments theo điều kiện
        const filteredPayments = filterPaymentsByDate(paymentData);

        // Lọc chỉ các giao dịch thành công
        const successfulPayments = filteredPayments.filter(p => p.paymentStatus === "Success");

        // Tính toán thống kê filtered
        calculateFilteredStatistics(successfulPayments);

        // Biểu đồ doanh thu theo thời gian
        const revenueByTime = generateRevenueByTime(successfulPayments, timeRange);
        setRevenueData(revenueByTime);

        // Biểu đồ phân phối gói dịch vụ
        const packageData = generatePackageDistribution(successfulPayments);
        setPackageDistribution(packageData);

        // Biểu đồ so sánh nhiều năm (nếu có nhiều năm được chọn)
        if (filterType === "yearRange" && selectedYears.length > 1) {
            const comparisonData = generateYearComparisonData(paymentData, selectedYears);
            setYearComparisonData(comparisonData);
        } else {
            setYearComparisonData([]);
        }
    };

    const generateYearComparisonData = (paymentData, years) => {
        const monthlyData = [];

        // Tạo dữ liệu cho 12 tháng
        for (let month = 0; month < 12; month++) {
            const monthData = { name: `T${month + 1}` };

            years.forEach(year => {
                const yearPayments = paymentData.filter(payment => {
                    const paymentDate = new Date(payment.createdAt);
                    return paymentDate.getFullYear() === year &&
                        paymentDate.getMonth() === month &&
                        payment.paymentStatus === "Success";
                });

                const revenue = yearPayments.reduce((sum, payment) => sum + payment.amount, 0);
                monthData[`year${year}`] = revenue;
                monthData[`transactions${year}`] = yearPayments.length;
            });

            monthlyData.push(monthData);
        }

        return monthlyData;
    };

    const calculateFilteredStatistics = (payments) => {
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalTransactions = payments.length;
        const successCount = payments.filter(p => p.paymentStatus === "Success").length;
        const successRate = totalTransactions > 0 ? (successCount / totalTransactions * 100) : 0;

        setFilteredStatistics({
            totalAmount,
            totalTransactions,
            successCount,
            successRate,
            averageTransaction: totalTransactions > 0 ? totalAmount / totalTransactions : 0
        });
    };

    const generateRevenueByTime = (payments, range) => {
        if (payments.length === 0) return [];

        let data = [];

        switch (range) {
            case "day":
                data = Array.from({ length: 24 }, (_, i) => ({
                    name: `${i}h`,
                    revenue: 0,
                    transactions: 0,
                }));
                payments.forEach(payment => {
                    const hour = new Date(payment.createdAt).getHours();
                    data[hour].revenue += payment.amount;
                    data[hour].transactions += 1;
                });
                break;

            case "week":
                const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                data = days.map(day => ({
                    name: day,
                    revenue: 0,
                    transactions: 0,
                }));
                payments.forEach(payment => {
                    const day = new Date(payment.createdAt).getDay();
                    data[day].revenue += payment.amount;
                    data[day].transactions += 1;
                });
                break;

            case "month":
                if (filterType === "year" || filterType === "yearRange") {
                    // 12 tháng trong năm
                    data = Array.from({ length: 12 }, (_, i) => ({
                        name: `T${i + 1}`,
                        revenue: 0,
                        transactions: 0,
                    }));
                    payments.forEach(payment => {
                        const month = new Date(payment.createdAt).getMonth();
                        data[month].revenue += payment.amount;
                        data[month].transactions += 1;
                    });
                } else {
                    const daysInMonth = filterType === "month" && selectedMonth !== null ?
                        new Date(selectedYear, selectedMonth + 1, 0).getDate() : 30;

                    data = Array.from({ length: daysInMonth }, (_, i) => {
                        const date = new Date();
                        if (filterType === "month") {
                            date.setFullYear(selectedYear, selectedMonth, i + 1);
                        } else {
                            date.setDate(date.getDate() - (daysInMonth - 1 - i));
                        }
                        return {
                            name: `${i + 1}`,
                            revenue: 0,
                            transactions: 0,
                            fullDate: new Date(date),
                        };
                    });

                    payments.forEach(payment => {
                        const paymentDate = new Date(payment.createdAt);
                        const dayIndex = data.findIndex(d =>
                            d.fullDate && d.fullDate.toDateString() === paymentDate.toDateString()
                        );
                        if (dayIndex !== -1) {
                            data[dayIndex].revenue += payment.amount;
                            data[dayIndex].transactions += 1;
                        }
                    });
                }
                break;

            case "quarter":
                data = [
                    { name: 'Q1', revenue: 0, transactions: 0 },
                    { name: 'Q2', revenue: 0, transactions: 0 },
                    { name: 'Q3', revenue: 0, transactions: 0 },
                    { name: 'Q4', revenue: 0, transactions: 0 },
                ];
                payments.forEach(payment => {
                    const month = new Date(payment.createdAt).getMonth();
                    const quarter = Math.floor(month / 3);
                    data[quarter].revenue += payment.amount;
                    data[quarter].transactions += 1;
                });
                break;

            case "year":
                if (filterType === "yearRange" && selectedYears.length > 0) {
                    // Hiển thị theo các năm đã chọn
                    data = selectedYears.map(year => {
                        const yearPayments = payments.filter(payment => {
                            const paymentDate = new Date(payment.createdAt);
                            return paymentDate.getFullYear() === year;
                        });

                        const revenue = yearPayments.reduce((sum, payment) => sum + payment.amount, 0);
                        const transactions = yearPayments.length;

                        return {
                            name: year.toString(),
                            revenue,
                            transactions,
                        };
                    });
                } else {
                    // Hiển thị tất cả năm có dữ liệu
                    const yearSet = new Set();
                    payments.forEach(payment => {
                        const year = new Date(payment.createdAt).getFullYear();
                        yearSet.add(year);
                    });

                    const years = Array.from(yearSet).sort();
                    data = years.map(year => ({
                        name: year.toString(),
                        revenue: 0,
                        transactions: 0,
                    }));

                    payments.forEach(payment => {
                        const year = new Date(payment.createdAt).getFullYear();
                        const yearIndex = years.indexOf(year);
                        if (yearIndex !== -1) {
                            data[yearIndex].revenue += payment.amount;
                            data[yearIndex].transactions += 1;
                        }
                    });
                }
                break;

            default:
                break;
        }

        return data.filter(item => item.revenue > 0 || item.transactions > 0);
    };

    const generatePackageDistribution = (payments) => {
        const packageMap = {};

        payments.forEach(payment => {
            const packageName = payment.fee?.feeName || 'Unknown';
            if (!packageMap[packageName]) {
                packageMap[packageName] = {
                    name: packageName,
                    value: 0,
                    amount: 0,
                    count: 0,
                };
            }
            packageMap[packageName].value += 1;
            packageMap[packageName].amount += payment.amount;
            packageMap[packageName].count += 1;
        });

        return Object.values(packageMap).sort((a, b) => b.value - a.value);
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    useEffect(() => {
        if (payments.length > 0) {
            generateChartData(payments);
        }
    }, [timeRange, filterType, dateRange, selectedMonth, selectedYear, selectedYears, payments]);

    const handleTimeRangeChange = (value) => {
        setTimeRange(value);
    };

    const handleFilterTypeChange = (value) => {
        setFilterType(value);
        // Reset các filter khi thay đổi loại filter
        setDateRange(null);
        setSelectedMonth(null);
        if (value !== "year" && value !== "yearRange") {
            setSelectedYear(new Date().getFullYear());
        }
        if (value !== "yearRange") {
            setSelectedYears([new Date().getFullYear()]);
        }
    };

    const handleMonthChange = (value) => {
        setSelectedMonth(value);
    };

    const handleYearChange = (value) => {
        setSelectedYear(value);
    };

    const handleYearsChange = (values) => {
        setSelectedYears(values);
    };

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    const getFilterDescription = () => {
        switch (filterType) {
            case "range":
                return dateRange ?
                    `Từ ${dateRange[0].format('DD/MM/YYYY')} đến ${dateRange[1].format('DD/MM/YYYY')}` :
                    "Tất cả thời gian";
            case "month":
                return selectedMonth !== null ?
                    `Tháng ${selectedMonth + 1}/${selectedYear}` :
                    `Năm ${selectedYear}`;
            case "year":
                return `Năm ${selectedYear}`;
            case "yearRange":
                return selectedYears.length > 0 ?
                    `Các năm: ${selectedYears.sort().join(', ')}` :
                    "Tất cả năm";
            default:
                return "Tất cả thời gian";
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded-lg shadow-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                    <p className="font-semibold">{`${getTimeRangeLabel(timeRange)}: ${label}`}</p>
                    <p className="text-blue-500">{`Doanh thu: ${payload[0]?.value?.toLocaleString('vi-VN')} ₫`}</p>
                    <p className="text-green-500">{`Số giao dịch: ${payload[1]?.value}`}</p>
                </div>
            );
        }
        return null;
    };

    const ComparisonTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded-lg shadow-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                    <p className="font-semibold">{`Tháng: ${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value?.toLocaleString('vi-VN')} ₫`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded-lg shadow-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                    <p className="font-semibold">{`Gói: ${payload[0].name}`}</p>
                    <p className="text-blue-500">{`Số lượt mua: ${payload[0].value}`}</p>
                    <p className="text-green-500">{`Doanh thu: ${payload[0].payload.amount?.toLocaleString('vi-VN')} ₫`}</p>
                </div>
            );
        }
        return null;
    };

    const themeConfig = {
        token: {
            colorBgContainer: isDark ? '#1f2937' : '#ffffff', // nền chính
            colorBgElevated: isDark ? '#374151' : '#ffffff',  // nền nổi (card, modal...)
            colorText: isDark ? '#e5e7eb' : '#000000',        // chữ thường
            colorTextHeading: isDark ? '#f3f4f6' : '#000000', // chữ heading
            colorBorder: isDark ? '#4b5563' : '#d1d5db',      // viền
            colorPrimary: '#1890ff',                          // màu chủ đạo (nút, link...)
            colorTextDescription: isDark ? '#d1d5db' : '#6b7280',
            // ✨ Thêm hiệu ứng & icon
            colorIcon: isDark ? '#e5e7eb' : '#000000',
            colorIconHover: '#1890ff',
            colorBgTextHover: isDark ? '#374151' : '#f5f5f5',
            colorBgTextActive: isDark ? '#4b5563' : '#e6e6e6',
            boxShadow: 'none',
            boxShadowSecondary: 'none',
            colorTextPlaceholder: isDark ? '#9ca3af' : '#6b7280',
        },
        components: {
            // 💠 CARD
            Card: {
                colorBgContainer: isDark ? '#374151' : '#ffffff',
                boxShadow: 'none',
            },

            // 🔘 BUTTON
            Button: {
                colorBgContainer: isDark ? '#374151' : '#ffffff',
                colorText: isDark ? '#ffffff' : '#000000',
                colorPrimaryHover: '#40a9ff',
                primaryShadow: 'none',
                boxShadow: 'none',
            },

            // 📅 DATE PICKER
            DatePicker: {
                colorBgContainer: isDark ? '#374151' : '#ffffff',
                colorText: isDark ? '#e5e7eb' : '#000000',
                colorIcon: isDark ? '#e5e7eb' : '#000000',
                activeBorderColor: '#1890ff',
            },

            // 🔽 SELECT
            Select: {
                colorBgContainer: isDark ? '#374151' : '#ffffff',
                colorText: isDark ? '#e5e7eb' : '#000000',
                optionSelectedBg: isDark ? '#4b5563' : '#e6f7ff',
                optionActiveBg: isDark ? '#4b5563' : '#f5f5f5',
                colorTextPlaceholder: isDark ? '#9ca3af' : '#6b7280',
            },

            // 📊 TABLE
            Table: {
                headerBg: isDark ? '#374151' : '#fafafa',
                headerColor: isDark ? '#ffffff' : '#000000',
                rowHoverBg: isDark ? '#4b5563' : '#fafafa',
                colorBorderSecondary: isDark ? '#4b5563' : '#e0e0e0',
            },

            // 🔢 PAGINATION
            Pagination: {
                itemBg: isDark ? '#374151' : '#ffffff',
                colorText: isDark ? '#ffffff' : '#000000',
                colorPrimary: '#1890ff',
                colorPrimaryHover: '#40a9ff',
                colorIcon: isDark ? '#ffffff' : '#000000',
                colorIconHover: '#1890ff',
            },
            Statistic: {
                colorTextDescription: isDark ? '#d1d5db' : '#6b7280', // ✅ Hoặc thêm riêng cho Statistic
            },
        },
    };


    // Tạo danh sách năm (từ 2020 đến năm hiện tại)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i).reverse();

    // Danh sách tháng
    const months = [
        { value: 0, label: 'Tháng 1' },
        { value: 1, label: 'Tháng 2' },
        { value: 2, label: 'Tháng 3' },
        { value: 3, label: 'Tháng 4' },
        { value: 4, label: 'Tháng 5' },
        { value: 5, label: 'Tháng 6' },
        { value: 6, label: 'Tháng 7' },
        { value: 7, label: 'Tháng 8' },
        { value: 8, label: 'Tháng 9' },
        { value: 9, label: 'Tháng 10' },
        { value: 10, label: 'Tháng 11' },
        { value: 11, label: 'Tháng 12' },
    ];

    return (
        <ConfigProvider theme={themeConfig}>
            <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <Title level={2} className={`!mb-0 ${isDark ? '!text-white' : '!text-gray-800'}`}>
                        Phân tích Doanh thu
                    </Title>
                    <Space>
                        <RevenueReportModal />
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchPayments}
                            loading={loading}
                        >
                            Làm mới
                        </Button>
                    </Space>
                </div>

                {/* Bộ lọc */}
                <Card title={<span><FilterOutlined /> Bộ lọc thời gian</span>} className="mb-6">
                    <Space wrap size="middle">
                        <Select
                            value={filterType}
                            onChange={handleFilterTypeChange}
                            style={{ width: 140 }}
                        >
                            <Option value="range">Khoảng ngày</Option>
                            <Option value="month">Theo tháng</Option>
                            <Option value="year">Theo năm</Option>
                            <Option value="yearRange">Nhiều năm</Option>
                        </Select>

                        {filterType === "range" && (
                            <RangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                format="DD/MM/YYYY"
                                placeholder={['Từ ngày', 'Đến ngày']}
                            />
                        )}

                        {filterType === "month" && (
                            <>
                                <Select
                                    value={selectedYear}
                                    onChange={handleYearChange}
                                    style={{ width: 120 }}
                                >
                                    {years.map(year => (
                                        <Option key={year} value={year}>{year}</Option>
                                    ))}
                                </Select>
                                <Select
                                    value={selectedMonth}
                                    onChange={handleMonthChange}
                                    placeholder="Chọn tháng"
                                    style={{ width: 120 }}
                                    allowClear
                                >
                                    {months.map(month => (
                                        <Option key={month.value} value={month.value}>
                                            {month.label}
                                        </Option>
                                    ))}
                                </Select>
                            </>
                        )}

                        {filterType === "year" && (
                            <Select
                                value={selectedYear}
                                onChange={handleYearChange}
                                style={{ width: 120 }}
                            >
                                {years.map(year => (
                                    <Option key={year} value={year}>{year}</Option>
                                ))}
                            </Select>
                        )}

                        {filterType === "yearRange" && (
                            <Select
                                mode="multiple"
                                value={selectedYears}
                                onChange={handleYearsChange}
                                placeholder="Chọn các năm"
                                style={{ width: 200 }}
                                maxTagCount="responsive"
                            >
                                {years.map(year => (
                                    <Option key={year} value={year}>{year}</Option>
                                ))}
                            </Select>
                        )}

                        <Select
                            value={timeRange}
                            onChange={handleTimeRangeChange}
                            style={{ width: 150 }}
                        >
                            <Option value="day">Theo giờ</Option>
                            <Option value="week">Theo tuần</Option>
                            <Option value="month">Theo ngày/tháng</Option>
                            <Option value="quarter">Theo quý</Option>
                            <Option value="year">Theo năm</Option>
                        </Select>
                    </Space>

                    <div className="mt-3">
                        <Text type="secondary">
                            Đang hiển thị: <strong>{getFilterDescription()}</strong>
                            {filteredStatistics && (
                                <Tag color="blue" className="ml-2">
                                    {filteredStatistics.totalTransactions} giao dịch
                                </Tag>
                            )}
                        </Text>
                    </div>
                </Card>

                {/* Statistics Cards */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Doanh thu"
                                value={filteredStatistics?.totalAmount || 0}
                                precision={0}
                                suffix="₫"
                                valueStyle={{ color: '#52c41a' }}
                                formatter={value => value.toLocaleString('vi-VN')}
                                prefix={<DollarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tổng giao dịch"
                                value={filteredStatistics?.totalTransactions || 0}
                                valueStyle={{ color: '#1890ff' }}
                                prefix={<ShoppingOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tỷ lệ thành công"
                                value={filteredStatistics?.successRate || 0}
                                precision={1}
                                suffix="%"
                                valueStyle={{ color: '#faad14' }}
                                prefix={<BarChartOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Trung bình/giao dịch"
                                value={filteredStatistics?.averageTransaction || 0}
                                precision={0}
                                suffix="₫"
                                valueStyle={{ color: '#eb2f96' }}
                                formatter={value => value.toLocaleString('vi-VN')}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Biểu đồ so sánh nhiều năm */}
                {yearComparisonData.length > 0 && selectedYears.length > 1 && (
                    <Card title={`So sánh doanh thu các năm theo tháng`} className="mb-6">
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={yearComparisonData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4b5563' : '#d1d5db'} />
                                <XAxis
                                    dataKey="name"
                                    stroke={isDark ? '#e5e7eb' : '#000000'}
                                />
                                <YAxis
                                    stroke={isDark ? '#e5e7eb' : '#000000'}
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                />
                                <Tooltip content={<ComparisonTooltip />} />
                                <Legend />
                                {selectedYears.map((year, index) => (
                                    <Line
                                        key={year}
                                        type="monotone"
                                        dataKey={`year${year}`}
                                        name={`Năm ${year}`}
                                        stroke={COLORS[index % COLORS.length]}
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                )}

                {/* Biểu đồ doanh thu chính */}
                {revenueData.length > 0 ? (
                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            <Card
                                title={`Doanh thu theo ${getTimeRangeLabel(timeRange)} - ${getFilterDescription()}`}
                            >
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4b5563' : '#d1d5db'} />
                                        <XAxis
                                            dataKey="name"
                                            stroke={isDark ? '#e5e7eb' : '#000000'}
                                        />
                                        <YAxis
                                            stroke={isDark ? '#e5e7eb' : '#000000'}
                                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            dataKey="revenue"
                                            name="Doanh thu (₫)"
                                            fill="#8884d8"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="transactions"
                                            name="Số giao dịch"
                                            fill="#82ca9d"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                    </Row>
                ) : (
                    <Card>
                        <div className="text-center py-8">
                            <Text type="secondary">Không có dữ liệu cho khoảng thời gian đã chọn</Text>
                        </div>
                    </Card>
                )}

                {/* Biểu đồ phân phối gói dịch vụ */}
                {packageDistribution.length > 0 && (
                    <>
                        <Row gutter={[16, 16]} className="mt-4">
                            <Col xs={24}>
                                <Card title="Phân phối gói dịch vụ">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <PieChart>
                                            <Pie
                                                data={packageDistribution}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {packageDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<PieTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Col>
                        </Row>

                        {/* Thống kê chi tiết gói dịch vụ */}
                        <Card title="Thống kê chi tiết gói dịch vụ" className="mt-4">
                            <Row gutter={[16, 16]}>
                                {packageDistribution.map((pkg, index) => (
                                    <Col xs={24} sm={12} md={8} lg={6} key={pkg.name}>
                                        <Card
                                            size="small"
                                            style={{ borderLeft: `4px solid ${COLORS[index % COLORS.length]}` }}
                                        >
                                            <div className="text-center">
                                                <Text strong className="block mb-2">{pkg.name}</Text>
                                                <Statistic
                                                    value={pkg.count}
                                                    suffix="lượt mua"
                                                    valueStyle={{ fontSize: '18px', color: COLORS[index % COLORS.length] }}
                                                />
                                                <Text className="text-gray-500">
                                                    {pkg.amount.toLocaleString('vi-VN')} ₫
                                                </Text>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    </>
                )}
            </div>
        </ConfigProvider>
    );
};

// Helper function để hiển thị label cho time range
const getTimeRangeLabel = (range) => {
    const labels = {
        day: 'giờ',
        week: 'ngày trong tuần',
        month: 'thời gian',
        quarter: 'quý',
        year: 'năm'
    };
    return labels[range] || 'thời gian';
};

export default Dashboard;