using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Second_hand_EV_Battery_Trading_Platform.Migrations
{
    /// <inheritdoc />
    public partial class FixListingId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__Conversat__ItemI__619B8048",
                table: "Conversation");

            migrationBuilder.RenameColumn(
                name: "ItemId",
                table: "Conversation",
                newName: "ListingId");


            migrationBuilder.AddForeignKey(
                name: "FK__Conversat__Listi__72C60C4A",
                table: "Conversation",
                column: "ListingId",
                principalTable: "Listing",
                principalColumn: "ListingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__Conversat__Listi__72C60C4A",
                table: "Conversation");

            migrationBuilder.RenameColumn(
                name: "ListingId",
                table: "Conversation",
                newName: "ItemId");

            migrationBuilder.RenameIndex(
                name: "IX_Conversation_ListingId",
                table: "Conversation",
                newName: "IX_Conversation_ItemId");

            migrationBuilder.AddForeignKey(
                name: "FK__Conversat__ItemI__619B8048",
                table: "Conversation",
                column: "ItemId",
                principalTable: "Item",
                principalColumn: "ItemId");
        }
    }
}
