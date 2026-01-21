using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniRent.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPropertyStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1️⃣ Convert existing string values to enum integers
            migrationBuilder.Sql(@"
        UPDATE Properties SET Status = '1' WHERE Status is null;
        UPDATE Properties SET Status = '2' WHERE Status is null;
        UPDATE Properties SET Status = '3' WHERE Status is null;
        UPDATE Properties SET Status = '4' WHERE Status is null;
    ");


        migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$ybYjzc1hJUyjvEupW0m2ve68NLAVMMp0VloUDS7xst9fbteA1A5su");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Properties",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int));

            migrationBuilder.Sql(@"
        UPDATE Properties SET Status = 'Available' WHERE Status = '1';
        UPDATE Properties SET Status = 'Rented' WHERE Status = '2';
        UPDATE Properties SET Status = 'Reserved' WHERE Status = '3';
        UPDATE Properties SET Status = 'Maintenance' WHERE Status = '4';
    ");
        

        migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$BRapPb5Ai3ip5ll0utNYduJksmn3w99BJnWKTacYUMLBitG3Jg242");
        }
    }
}
