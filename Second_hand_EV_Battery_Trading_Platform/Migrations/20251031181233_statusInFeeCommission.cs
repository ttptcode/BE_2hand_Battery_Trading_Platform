using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Second_hand_EV_Battery_Trading_Platform.Migrations
{
    /// <inheritdoc />
    public partial class statusInFeeCommission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {


            migrationBuilder.AddColumn<bool>(
                name: "Status",
                table: "FeeCommission",
                type: "bit",
                nullable: true);


        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.DropColumn(
                name: "Status",
                table: "FeeCommission");


        }
    }
}
