using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniRent.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddInquiryToRentalRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "InquiryId",
                table: "Rentals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TenantEmail",
                table: "Rentals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Inquiries",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$ygvDBZLsSMKjLlrWuSYA0.CuadhomCJ0lInTRB9r1fDiV3Q7CbJ8C");

            migrationBuilder.CreateIndex(
                name: "IX_Rentals_InquiryId",
                table: "Rentals",
                column: "InquiryId");

            migrationBuilder.CreateIndex(
                name: "IX_Inquiries_UserId",
                table: "Inquiries",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Inquiries_Users_UserId",
                table: "Inquiries",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Rentals_Inquiries_InquiryId",
                table: "Rentals",
                column: "InquiryId",
                principalTable: "Inquiries",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inquiries_Users_UserId",
                table: "Inquiries");

            migrationBuilder.DropForeignKey(
                name: "FK_Rentals_Inquiries_InquiryId",
                table: "Rentals");

            migrationBuilder.DropIndex(
                name: "IX_Rentals_InquiryId",
                table: "Rentals");

            migrationBuilder.DropIndex(
                name: "IX_Inquiries_UserId",
                table: "Inquiries");

            migrationBuilder.DropColumn(
                name: "InquiryId",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "TenantEmail",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Inquiries");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$HWtHQiFOvPqc8cD3XeEJKO1clbNC70zw9J0ztO7CqMGbWCRVUl/uC");
        }
    }
}
