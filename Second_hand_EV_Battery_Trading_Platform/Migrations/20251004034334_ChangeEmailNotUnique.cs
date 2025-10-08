using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Second_hand_EV_Battery_Trading_Platform.Migrations
{
    /// <inheritdoc />
    public partial class ChangeEmailNotUnique : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Xóa UNIQUE CONSTRAINT
            migrationBuilder.Sql(
                "ALTER TABLE [User] DROP CONSTRAINT [UQ__User__A9D10534014DD8DD];");

            // Tạo lại index thường (non-unique)
            migrationBuilder.CreateIndex(
                name: "IX_User_Email",
                table: "User",
                column: "Email");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Xóa index non-unique
            migrationBuilder.DropIndex(
                name: "IX_User_Email",
                table: "User");

            // Tạo lại UNIQUE CONSTRAINT
            migrationBuilder.Sql(
                "ALTER TABLE [User] ADD CONSTRAINT [UQ__User__A9D10534014DD8DD] UNIQUE ([Email]);");
        }
    }

}
