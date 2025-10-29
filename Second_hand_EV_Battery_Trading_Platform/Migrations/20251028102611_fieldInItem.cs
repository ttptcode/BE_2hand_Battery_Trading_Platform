using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Second_hand_EV_Battery_Trading_Platform.Migrations
{
    /// <inheritdoc />
    public partial class fieldInItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Accessories",
                table: "Item",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BatteryType",
                table: "Item",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Engine",
                table: "Item",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FrameMaterial",
                table: "Item",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FrameSize",
                table: "Item",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InspectionValidUntil",
                table: "Item",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OwnerCount",
                table: "Item",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PartType",
                table: "Item",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Version",
                table: "Item",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Voltage",
                table: "Item",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Accessories",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "BatteryType",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "Engine",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "FrameMaterial",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "FrameSize",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "InspectionValidUntil",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "OwnerCount",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "PartType",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "Voltage",
                table: "Item");
        }
    }
}
