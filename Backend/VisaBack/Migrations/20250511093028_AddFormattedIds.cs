using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisaBack.Migrations
{
    /// <inheritdoc />
    public partial class AddFormattedIds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "formatted_id",
                table: "users",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "formatted_id",
                table: "services",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "formatted_id",
                table: "orders",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "formatted_id",
                table: "documents",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "formatted_id",
                table: "clients",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "clients",
                keyColumn: "client_id",
                keyValue: 1,
                column: "formatted_id",
                value: "");

            migrationBuilder.UpdateData(
                table: "clients",
                keyColumn: "client_id",
                keyValue: 2,
                column: "formatted_id",
                value: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "formatted_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "formatted_id",
                table: "services");

            migrationBuilder.DropColumn(
                name: "formatted_id",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "formatted_id",
                table: "documents");

            migrationBuilder.DropColumn(
                name: "formatted_id",
                table: "clients");
        }
    }
}
