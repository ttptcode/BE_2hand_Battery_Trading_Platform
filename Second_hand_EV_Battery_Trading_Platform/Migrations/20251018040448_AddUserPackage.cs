using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Second_hand_EV_Battery_Trading_Platform.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPackage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserPackage",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RemainingListings = table.Column<int>(type: "int", nullable: false),
                    ActivatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    ExpiredAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPackage", x => new { x.UserId, x.FeeId });
                    table.ForeignKey(
                        name: "FK_UserPackage_FeeCommission",
                        column: x => x.FeeId,
                        principalTable: "FeeCommission",
                        principalColumn: "FeeId");
                    table.ForeignKey(
                        name: "FK_UserPackage_User",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserPackage_FeeId",
                table: "UserPackage",
                column: "FeeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserPackage");
        }
    }
}
