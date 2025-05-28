using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisaBack.Migrations
{
    /// <inheritdoc />
    public partial class worker : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WorkerId",
                table: "orders",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Worker",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FormattedId = table.Column<string>(type: "TEXT", nullable: false),
                    Desctiption = table.Column<string>(type: "TEXT", nullable: false),
                    Phone = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Worker", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_orders_WorkerId",
                table: "orders",
                column: "WorkerId");

            migrationBuilder.AddForeignKey(
                name: "FK_orders_Worker_WorkerId",
                table: "orders",
                column: "WorkerId",
                principalTable: "Worker",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_orders_Worker_WorkerId",
                table: "orders");

            migrationBuilder.DropTable(
                name: "Worker");

            migrationBuilder.DropIndex(
                name: "IX_orders_WorkerId",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "WorkerId",
                table: "orders");
        }
    }
}
