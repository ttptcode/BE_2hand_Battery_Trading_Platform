using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PdfSharpCore.Drawing;
using PdfSharpCore.Pdf;
using OxyPlot;
using OxyPlot.Axes;
using OxyPlot.Series;
using OxyPlot.SkiaSharp;
using Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence;
using OxyPlot.Annotations;

namespace Second_hand_EV_Battery_Trading_Platform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentReportController : Microsoft.AspNetCore.Mvc.ControllerBase
    {
        private readonly OemEvWarrantyContext _context;
        public PaymentReportController(OemEvWarrantyContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Xuất báo cáo doanh thu hàng tháng trong năm ra PDF (có biểu đồ và bảng 3 cột)
        /// </summary>
        [HttpGet("monthly-revenue-pdf")]
        public async Task<IActionResult> ExportMonthlyRevenueReport([FromQuery] int? year)
        {
            int targetYear = year ?? DateTime.Now.Year;

            // 🧮 Lấy giao dịch thành công trong năm
            var payments = await _context.PaymentTransactions
                .Where(p => p.PaymentStatus == "Success"
                            && p.CreatedAt.HasValue
                            && p.CreatedAt.Value.Year == targetYear)
                .ToListAsync();

            if (!payments.Any())
                return BadRequest($"Không có giao dịch thành công trong năm {targetYear}.");

            // 🔢 Gom nhóm theo tháng + đếm số giao dịch
            var grouped = payments
                .GroupBy(p => p.CreatedAt.Value.Month)
                .Select(g => new
                {
                    Month = g.Key,
                    Total = g.Sum(x => x.Amount ?? 0m),
                    Count = g.Count()
                })
                .OrderBy(g => g.Month)
                .ToList();
            double maxRevenue = (double)grouped.Max(g => g.Total);
            // 🎨 Biểu đồ cột doanh thu
            var plotModel = new PlotModel { Title = $"Doanh thu hàng tháng năm {targetYear} (VNĐ)" };
            plotModel.Background = OxyColors.White;

            var categoryAxis = new CategoryAxis
            {
                Position = AxisPosition.Bottom,
                Title = "Tháng"
            };
            categoryAxis.Labels.AddRange(grouped.Select(g => g.Month.ToString()));
            plotModel.Axes.Add(categoryAxis);

            var valueAxis = new LinearAxis
            {
                Position = AxisPosition.Left,
                Title = "VNĐ",
                MinimumPadding = 0,
                AbsoluteMinimum = 0,
                StringFormat = "N0",
                MajorGridlineStyle = LineStyle.Solid,
                MinorGridlineStyle = LineStyle.Dot,
                IsZoomEnabled = false,
                IsPanEnabled = false,
                Maximum = maxRevenue * 1.1 // ✅ Tăng thêm 10% để cột không đụng trần
            };
            plotModel.Axes.Add(valueAxis);

            var series = new RectangleBarSeries
            {
                FillColor = OxyColors.SkyBlue,
                StrokeColor = OxyColors.Black,
                StrokeThickness = 1,
            };

            for (int i = 0; i < grouped.Count; i++)
            {
                double barHalfWidth = 0.05; // 🔹 giảm độ rộng cột
                double x0 = i - barHalfWidth;
                double x1 = i + barHalfWidth;
                double y0 = 0;
                double y1 = (double)grouped[i].Total;

                series.Items.Add(new RectangleBarItem(x0, y0, x1, y1));

                // 🧾 Thêm nhãn doanh thu ngay trên cột
                plotModel.Annotations.Add(new TextAnnotation
                {
                    Text = $"{grouped[i].Total:N0}",
                    TextPosition = new DataPoint(i, y1 * 1.02),
                    FontSize = 10,
                    Stroke = OxyColors.Transparent,
                    TextColor = OxyColors.Black,
                    TextHorizontalAlignment = OxyPlot.HorizontalAlignment.Center
                });
            }

            plotModel.Series.Add(series);


            // 📊 Xuất biểu đồ ra file PNG tạm
            var chartFilePath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.png");
            using (var stream = System.IO.File.Create(chartFilePath))
            {
                var exporter = new PngExporter { Width = 900, Height = 500 };
                exporter.Export(plotModel, stream);
            }

            // 🧾 Tạo PDF
            var pdf = new PdfDocument();
            var page = pdf.AddPage();
            var gfx = XGraphics.FromPdfPage(page);
            var fontTitle = new XFont("Arial", 16, XFontStyle.Bold);
            var fontNormal = new XFont("Arial", 12, XFontStyle.Regular);

            gfx.DrawString($"BÁO CÁO DOANH THU NĂM {targetYear}", fontTitle, XBrushes.Black,
                new XRect(0, 20, page.Width, 40), XStringFormats.TopCenter);

            // 🖼️ Vẽ biểu đồ
            using (var img = XImage.FromFile(chartFilePath))
            {
                gfx.DrawImage(img, 40, 60, page.Width - 80, 250);
            }

            // 📋 Vẽ bảng dữ liệu 3 cột
            double startY = 330;
            gfx.DrawString("Thống kê chi tiết:", fontNormal, XBrushes.Black, new XPoint(40, startY));

            startY += 20;

            // Cấu hình cột (đều & sát nhau)
            double col1X = 60;
            double col1Width = 80;
            double col2X = col1X + col1Width;      // 140
            double col2Width = 160;
            double col3X = col2X + col2Width;      // 300
            double col3Width = 120;
            double rowHeight = 20;

            // Header
            gfx.DrawRectangle(XPens.Black, col1X, startY, col1Width, rowHeight);
            gfx.DrawRectangle(XPens.Black, col2X, startY, col2Width, rowHeight);
            gfx.DrawRectangle(XPens.Black, col3X, startY, col3Width, rowHeight);

            gfx.DrawString("Tháng", fontNormal, XBrushes.Black, new XRect(col1X, startY, col1Width, rowHeight), XStringFormats.Center);
            gfx.DrawString("Tổng doanh thu (VNĐ)", fontNormal, XBrushes.Black, new XRect(col2X, startY, col2Width, rowHeight), XStringFormats.Center);
            gfx.DrawString("Số giao dịch", fontNormal, XBrushes.Black, new XRect(col3X, startY, col3Width, rowHeight), XStringFormats.Center);

            startY += rowHeight;

            // Dòng dữ liệu
            foreach (var item in grouped)
            {
                gfx.DrawRectangle(XPens.Black, col1X, startY, col1Width, rowHeight);
                gfx.DrawRectangle(XPens.Black, col2X, startY, col2Width, rowHeight);
                gfx.DrawRectangle(XPens.Black, col3X, startY, col3Width, rowHeight);

                gfx.DrawString(item.Month.ToString("00"), fontNormal, XBrushes.Black, new XRect(col1X, startY, col1Width, rowHeight), XStringFormats.Center);
                gfx.DrawString($"{item.Total:N0}", fontNormal, XBrushes.Black, new XRect(col2X, startY, col2Width, rowHeight), XStringFormats.Center);
                gfx.DrawString(item.Count.ToString(), fontNormal, XBrushes.Black, new XRect(col3X, startY, col3Width, rowHeight), XStringFormats.Center);

                startY += rowHeight;
            }

            // ✅ Trả PDF về client
            using var streamOut = new MemoryStream();
            pdf.Save(streamOut, false);
            streamOut.Position = 0;

            try { System.IO.File.Delete(chartFilePath); } catch { }

            return File(streamOut.ToArray(), "application/pdf", $"MonthlyRevenueReport_{targetYear}.pdf");
        }
    }
}
