using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Second_hand_EV_Battery_Trading_Platform.Migrations
{
    /// <inheritdoc />
    public partial class ChangeLisingIdInRview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__UserReput__ItemI__6FE99F9F",
                table: "UserReputationReview");

            migrationBuilder.AddColumn<Guid>(
                name: "ListingId",
                table: "UserReputationReview",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserReputationReview_ListingId",
                table: "UserReputationReview",
                column: "ListingId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserReputationReview_Item_ItemId",
                table: "UserReputationReview",
                column: "ItemId",
                principalTable: "Item",
                principalColumn: "ItemId");

            migrationBuilder.AddForeignKey(
                name: "FK__UserReput__Listi__797309D9",
                table: "UserReputationReview",
                column: "ListingId",
                principalTable: "Listing",
                principalColumn: "ListingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserReputationReview_Item_ItemId",
                table: "UserReputationReview");

            migrationBuilder.DropForeignKey(
                name: "FK__UserReput__Listi__797309D9",
                table: "UserReputationReview");

            migrationBuilder.DropIndex(
                name: "IX_UserReputationReview_ListingId",
                table: "UserReputationReview");

            migrationBuilder.DropColumn(
                name: "ListingId",
                table: "UserReputationReview");

            migrationBuilder.AddForeignKey(
                name: "FK__UserReput__ItemI__6FE99F9F",
                table: "UserReputationReview",
                column: "ItemId",
                principalTable: "Item",
                principalColumn: "ItemId");
        }
    }
}
