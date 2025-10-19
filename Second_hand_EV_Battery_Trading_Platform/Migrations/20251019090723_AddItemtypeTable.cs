using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Second_hand_EV_Battery_Trading_Platform.Migrations
{
    /// <inheritdoc />
    public partial class AddItemtypeTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ItemType",
                table: "Item");

            migrationBuilder.AddColumn<Guid>(
                name: "ItemTypeId",
                table: "Item",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ItemType",
                columns: table => new
                {
                    ItemTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ItemType__ItemTypeId", x => x.ItemTypeId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Item_ItemTypeId",
                table: "Item",
                column: "ItemTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK__Item__ItemTypeId",
                table: "Item",
                column: "ItemTypeId",
                principalTable: "ItemType",
                principalColumn: "ItemTypeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__Item__ItemTypeId",
                table: "Item");

            migrationBuilder.DropTable(
                name: "ItemType");

            migrationBuilder.DropIndex(
                name: "IX_Item_ItemTypeId",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "ItemTypeId",
                table: "Item");

            migrationBuilder.AddColumn<string>(
                name: "ItemType",
                table: "Item",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }
    }
}
