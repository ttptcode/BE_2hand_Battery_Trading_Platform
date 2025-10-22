using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Second_hand_EV_Battery_Trading_Platform.Migrations
{
    /// <inheritdoc />
    public partial class AddFieldInItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BatteryIncluded",
                table: "Item",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "Item",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Fuel",
                table: "Item",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Gearbox",
                table: "Item",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LicensePlate",
                table: "Item",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Origin",
                table: "Item",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Seat",
                table: "Item",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Style",
                table: "Item",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                table: "Item",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BatteryIncluded",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "Fuel",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "Gearbox",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "LicensePlate",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "Origin",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "Seat",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "Style",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "Item");
        }
    }
}
