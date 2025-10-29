using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Second_hand_EV_Battery_Trading_Platform.src.Helpers
{
    public static class DateTimeHelper
    {
        /// <summary>
        /// Múi giờ Việt Nam (UTC+7)
        /// </summary>
        public static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");

        /// <summary>
        /// Lấy thời gian hiện tại theo múi giờ Việt Nam
        /// </summary>
        /// <returns>DateTime theo múi giờ Việt Nam</returns>
        public static DateTime NowVietnam()
        {
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VietnamTimeZone);
        }

        /// <summary>
        /// Chuyển đổi UTC time sang thời gian Việt Nam
        /// </summary>
        /// <param name="utcDateTime">Thời gian UTC</param>
        /// <returns>DateTime theo múi giờ Việt Nam</returns>
        public static DateTime ToVietnamTime(DateTime utcDateTime)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, VietnamTimeZone);
        }

        /// <summary>
        /// Chuyển đổi thời gian Việt Nam sang UTC
        /// </summary>
        /// <param name="vietnamDateTime">Thời gian Việt Nam</param>
        /// <returns>DateTime UTC</returns>
        public static DateTime ToUtc(DateTime vietnamDateTime)
        {
            return TimeZoneInfo.ConvertTimeToUtc(vietnamDateTime, VietnamTimeZone);
        }

        /// <summary>
        /// Lấy thời gian hiện tại theo múi giờ Việt Nam dưới dạng UTC để lưu vào database
        /// </summary>
        /// <returns>DateTime UTC tương ứng với thời gian Việt Nam hiện tại</returns>
        public static DateTime NowVietnamAsUtc()
        {
            var vietnamNow = NowVietnam();
            return ToUtc(vietnamNow);
        }

        /// <summary>
        /// Lấy thời gian UTC hiện tại để lưu vào database
        /// </summary>
        /// <returns>DateTime UTC</returns>
        public static DateTime NowUtc()
        {
            return DateTime.UtcNow;
        }
    }

    /// <summary>
    /// JSON Converter để tự động convert UTC sang thời gian Việt Nam khi serialize
    /// </summary>
    public class VietnamDateTimeConverter : JsonConverter<DateTime>
    {
        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return DateTime.Parse(reader.GetString()!);
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            // Convert UTC time to Vietnam time for display
            var vietnamTime = DateTimeHelper.ToVietnamTime(value);
            writer.WriteStringValue(vietnamTime.ToString("yyyy-MM-ddTHH:mm:ss.fff"));
        }
    }

    /// <summary>
    /// JSON Converter cho DateTime? để tự động convert UTC sang thời gian Việt Nam khi serialize
    /// </summary>
    public class VietnamNullableDateTimeConverter : JsonConverter<DateTime?>
    {
        public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var stringValue = reader.GetString();
            if (string.IsNullOrEmpty(stringValue))
                return null;
            return DateTime.Parse(stringValue);
        }

        public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
            {
                // Convert UTC time to Vietnam time for display
                var vietnamTime = DateTimeHelper.ToVietnamTime(value.Value);
                writer.WriteStringValue(vietnamTime.ToString("yyyy-MM-ddTHH:mm:ss.fff"));
            }
            else
            {
                writer.WriteNullValue();
            }
        }
    }
}
