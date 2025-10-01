using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Second_hand_EV_Battery_Trading_Platform.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FeeCommission",
                columns: table => new
                {
                    FeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    FeeName = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    FeeType = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PackageDurationDays = table.Column<int>(type: "int", nullable: true),
                    MaxListings = table.Column<int>(type: "int", nullable: true),
                    SavingAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__FeeCommi__B387B229847024E8", x => x.FeeId);
                });

            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    RoleName = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Role__8AFACE1A765443A9", x => x.RoleId);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FullName = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    Phone = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    PasswordHash = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    Balance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__User__1788CC4C3933A59D", x => x.UserId);
                    table.ForeignKey(
                        name: "FK__User__RoleId__6A30C649",
                        column: x => x.RoleId,
                        principalTable: "Role",
                        principalColumn: "RoleId");
                });

            migrationBuilder.CreateTable(
                name: "Item",
                columns: table => new
                {
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SerialNumber = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    ItemType = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    Title = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    Brand = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    Model = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    Year = table.Column<int>(type: "int", nullable: true),
                    Mileage = table.Column<int>(type: "int", nullable: true),
                    BatteryCapacity = table.Column<int>(type: "int", nullable: true),
                    Capacity = table.Column<int>(type: "int", nullable: true),
                    Cycles = table.Column<int>(type: "int", nullable: true),
                    Condition = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Images = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Item__727E838B396B744E", x => x.ItemId);
                    table.ForeignKey(
                        name: "FK__Item__UserId__6B24EA82",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "Conversation",
                columns: table => new
                {
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SellerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    BuyerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Conversa__C050D877750979DB", x => x.ConversationId);
                    table.ForeignKey(
                        name: "FK__Conversat__Buyer__74AE54BC",
                        column: x => x.BuyerId,
                        principalTable: "User",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK__Conversat__ItemI__72C60C4A",
                        column: x => x.ItemId,
                        principalTable: "Item",
                        principalColumn: "ItemId");
                    table.ForeignKey(
                        name: "FK__Conversat__Selle__73BA3083",
                        column: x => x.SellerId,
                        principalTable: "User",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "Listing",
                columns: table => new
                {
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ListingType = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    StartPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BuyNowPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    BidIncrement = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Listing__BF3EBED069BB4A02", x => x.ListingId);
                    table.ForeignKey(
                        name: "FK__Listing__FeeId__6E01572D",
                        column: x => x.FeeId,
                        principalTable: "FeeCommission",
                        principalColumn: "FeeId");
                    table.ForeignKey(
                        name: "FK__Listing__ItemId__6C190EBB",
                        column: x => x.ItemId,
                        principalTable: "Item",
                        principalColumn: "ItemId");
                    table.ForeignKey(
                        name: "FK__Listing__UserId__6D0D32F4",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "UserReputationReview",
                columns: table => new
                {
                    ReputationReviewId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ReviewerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RevieweeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Rating = table.Column<int>(type: "int", nullable: true),
                    Comment = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__UserRepu__6B1FFF21E6FDBC5A", x => x.ReputationReviewId);
                    table.ForeignKey(
                        name: "FK__UserReput__ItemI__797309D9",
                        column: x => x.ItemId,
                        principalTable: "Item",
                        principalColumn: "ItemId");
                    table.ForeignKey(
                        name: "FK__UserReput__Revie__778AC167",
                        column: x => x.ReviewerId,
                        principalTable: "User",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK__UserReput__Revie__787EE5A0",
                        column: x => x.RevieweeId,
                        principalTable: "User",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "Message",
                columns: table => new
                {
                    MessageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SenderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Content = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Message__C87C0C9C01694673", x => x.MessageId);
                    table.ForeignKey(
                        name: "FK__Message__Convers__75A278F5",
                        column: x => x.ConversationId,
                        principalTable: "Conversation",
                        principalColumn: "ConversationId");
                    table.ForeignKey(
                        name: "FK__Message__SenderI__76969D2E",
                        column: x => x.SenderId,
                        principalTable: "User",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "AuctionResult",
                columns: table => new
                {
                    AuctionResultId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    WinnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    WinningBid = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    WinnerMaxBid = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__AuctionR__0809D9D86E5BF2C4", x => x.AuctionResultId);
                    table.ForeignKey(
                        name: "FK__AuctionRe__Listi__70DDC3D8",
                        column: x => x.ListingId,
                        principalTable: "Listing",
                        principalColumn: "ListingId");
                    table.ForeignKey(
                        name: "FK__AuctionRe__Winne__71D1E811",
                        column: x => x.WinnerId,
                        principalTable: "User",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "Bid",
                columns: table => new
                {
                    BidId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    BidderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MaxBidAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ProxyActive = table.Column<bool>(type: "bit", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Bid__4A733D92798D03D8", x => x.BidId);
                    table.ForeignKey(
                        name: "FK__Bid__BidderId__6FE99F9F",
                        column: x => x.BidderId,
                        principalTable: "User",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK__Bid__ListingId__6EF57B66",
                        column: x => x.ListingId,
                        principalTable: "Listing",
                        principalColumn: "ListingId");
                });

            migrationBuilder.CreateTable(
                name: "PaymentTransaction",
                columns: table => new
                {
                    PaymentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "(newid())"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PaymentMethod = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    PaymentStatus = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    TransactionRef = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PaymentT__9B556A38FE8F35D8", x => x.PaymentId);
                    table.ForeignKey(
                        name: "FK__PaymentTr__FeeId__7B5B524B",
                        column: x => x.FeeId,
                        principalTable: "FeeCommission",
                        principalColumn: "FeeId");
                    table.ForeignKey(
                        name: "FK__PaymentTr__Listi__7C4F7684",
                        column: x => x.ListingId,
                        principalTable: "Listing",
                        principalColumn: "ListingId");
                    table.ForeignKey(
                        name: "FK__PaymentTr__UserI__7A672E12",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuctionResult_ListingId",
                table: "AuctionResult",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_AuctionResult_WinnerId",
                table: "AuctionResult",
                column: "WinnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Bid_BidderId",
                table: "Bid",
                column: "BidderId");

            migrationBuilder.CreateIndex(
                name: "IX_Bid_ListingId",
                table: "Bid",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversation_BuyerId",
                table: "Conversation",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversation_ItemId",
                table: "Conversation",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversation_SellerId",
                table: "Conversation",
                column: "SellerId");

            migrationBuilder.CreateIndex(
                name: "IX_Item_UserId",
                table: "Item",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UQ__Item__048A000870549516",
                table: "Item",
                column: "SerialNumber",
                unique: true,
                filter: "[SerialNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Listing_FeeId",
                table: "Listing",
                column: "FeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Listing_ItemId",
                table: "Listing",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Listing_UserId",
                table: "Listing",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Message_ConversationId",
                table: "Message",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_Message_SenderId",
                table: "Message",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransaction_FeeId",
                table: "PaymentTransaction",
                column: "FeeId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransaction_ListingId",
                table: "PaymentTransaction",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransaction_UserId",
                table: "PaymentTransaction",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "UQ__Role__8A2B61601A857A21",
                table: "Role",
                column: "RoleName",
                unique: true,
                filter: "[RoleName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_User_RoleId",
                table: "User",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "UQ__User__A9D10534E5B949DF",
                table: "User",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserReputationReview_ItemId",
                table: "UserReputationReview",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_UserReputationReview_RevieweeId",
                table: "UserReputationReview",
                column: "RevieweeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserReputationReview_ReviewerId",
                table: "UserReputationReview",
                column: "ReviewerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuctionResult");

            migrationBuilder.DropTable(
                name: "Bid");

            migrationBuilder.DropTable(
                name: "Message");

            migrationBuilder.DropTable(
                name: "PaymentTransaction");

            migrationBuilder.DropTable(
                name: "UserReputationReview");

            migrationBuilder.DropTable(
                name: "Conversation");

            migrationBuilder.DropTable(
                name: "Listing");

            migrationBuilder.DropTable(
                name: "FeeCommission");

            migrationBuilder.DropTable(
                name: "Item");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "Role");
        }
    }
}
