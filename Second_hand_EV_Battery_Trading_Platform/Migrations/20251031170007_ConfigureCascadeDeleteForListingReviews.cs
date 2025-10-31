using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Second_hand_EV_Battery_Trading_Platform.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureCascadeDeleteForListingReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__UserReput__Listi__797309D9",
                table: "UserReputationReview");

            migrationBuilder.AddForeignKey(
                name: "FK__UserReput__Listi__797309D9",
                table: "UserReputationReview",
                column: "ListingId",
                principalTable: "Listing",
                principalColumn: "ListingId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__UserReput__Listi__797309D9",
                table: "UserReputationReview");

            migrationBuilder.AddForeignKey(
                name: "FK__UserReput__Listi__797309D9",
                table: "UserReputationReview",
                column: "ListingId",
                principalTable: "Listing",
                principalColumn: "ListingId");
        }
    }
}
