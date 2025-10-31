using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Second_hand_EV_Battery_Trading_Platform.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureCascadeFavorite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Favorite_Listing",
                table: "Favorite");

            migrationBuilder.AddForeignKey(
                name: "FK_Favorite_Listing",
                table: "Favorite",
                column: "ListingId",
                principalTable: "Listing",
                principalColumn: "ListingId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Favorite_Listing",
                table: "Favorite");

            migrationBuilder.AddForeignKey(
                name: "FK_Favorite_Listing",
                table: "Favorite",
                column: "ListingId",
                principalTable: "Listing",
                principalColumn: "ListingId");
        }
    }
}
