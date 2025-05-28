using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisaBack.Migrations
{
    /// <inheritdoc />
    public partial class CompleteEntitySchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Phone",
                table: "clients",
                newName: "phone");

            migrationBuilder.RenameColumn(
                name: "FullName",
                table: "clients",
                newName: "full_name");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "clients",
                newName: "client_id");

            migrationBuilder.AlterColumn<string>(
                name: "phone",
                table: "clients",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AddColumn<DateTime>(
                name: "birth_date",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "clients",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "passport_data",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "clients",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "services",
                columns: table => new
                {
                    service_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    country = table.Column<string>(type: "TEXT", nullable: false),
                    visa_type = table.Column<string>(type: "TEXT", nullable: false),
                    standard_duration = table.Column<int>(type: "INTEGER", nullable: true),
                    price = table.Column<decimal>(type: "decimal(10, 2)", nullable: true),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_services", x => x.service_id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    username = table.Column<string>(type: "TEXT", nullable: false),
                    password_hash = table.Column<string>(type: "TEXT", nullable: false),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                columns: table => new
                {
                    order_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    client_id = table.Column<int>(type: "INTEGER", nullable: false),
                    service_id = table.Column<int>(type: "INTEGER", nullable: false),
                    order_date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: false),
                    cost = table.Column<decimal>(type: "decimal(10, 2)", nullable: false),
                    deadline = table.Column<DateTime>(type: "TEXT", nullable: true),
                    description = table.Column<string>(type: "TEXT", nullable: true),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_orders", x => x.order_id);
                    table.ForeignKey(
                        name: "FK_orders_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_orders_services_service_id",
                        column: x => x.service_id,
                        principalTable: "services",
                        principalColumn: "service_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "service_price_history",
                columns: table => new
                {
                    price_history_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    service_id = table.Column<int>(type: "INTEGER", nullable: false),
                    old_price = table.Column<decimal>(type: "decimal(10, 2)", nullable: true),
                    new_price = table.Column<decimal>(type: "decimal(10, 2)", nullable: false),
                    changed_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_service_price_history", x => x.price_history_id);
                    table.ForeignKey(
                        name: "FK_service_price_history_services_service_id",
                        column: x => x.service_id,
                        principalTable: "services",
                        principalColumn: "service_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "logs",
                columns: table => new
                {
                    log_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    user_id = table.Column<int>(type: "INTEGER", nullable: true),
                    event_type = table.Column<string>(type: "TEXT", nullable: false),
                    table_name = table.Column<string>(type: "TEXT", nullable: false),
                    record_id = table.Column<int>(type: "INTEGER", nullable: true),
                    changed_data = table.Column<string>(type: "TEXT", nullable: true),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_logs", x => x.log_id);
                    table.ForeignKey(
                        name: "FK_logs_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "user_id");
                });

            migrationBuilder.CreateTable(
                name: "documents",
                columns: table => new
                {
                    document_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    client_id = table.Column<int>(type: "INTEGER", nullable: true),
                    order_id = table.Column<int>(type: "INTEGER", nullable: true),
                    doc_type = table.Column<string>(type: "TEXT", nullable: true),
                    doc_file = table.Column<byte[]>(type: "BLOB", nullable: true),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_documents", x => x.document_id);
                    table.ForeignKey(
                        name: "FK_documents_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "client_id");
                    table.ForeignKey(
                        name: "FK_documents_orders_order_id",
                        column: x => x.order_id,
                        principalTable: "orders",
                        principalColumn: "order_id");
                });

            migrationBuilder.UpdateData(
                table: "clients",
                keyColumn: "client_id",
                keyValue: 1,
                columns: new[] { "birth_date", "created_at", "description", "email", "passport_data", "updated_at" },
                values: new object[] { null, new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, null, new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.UpdateData(
                table: "clients",
                keyColumn: "client_id",
                keyValue: 2,
                columns: new[] { "birth_date", "created_at", "description", "email", "passport_data", "updated_at" },
                values: new object[] { null, new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, null, new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.CreateIndex(
                name: "IX_documents_client_id",
                table: "documents",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_documents_order_id",
                table: "documents",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_logs_user_id",
                table: "logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_orders_client_id",
                table: "orders",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_orders_service_id",
                table: "orders",
                column: "service_id");

            migrationBuilder.CreateIndex(
                name: "IX_service_price_history_service_id",
                table: "service_price_history",
                column: "service_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "documents");

            migrationBuilder.DropTable(
                name: "logs");

            migrationBuilder.DropTable(
                name: "service_price_history");

            migrationBuilder.DropTable(
                name: "orders");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "services");

            migrationBuilder.DropColumn(
                name: "birth_date",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "description",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "email",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "passport_data",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "clients");

            migrationBuilder.RenameColumn(
                name: "phone",
                table: "clients",
                newName: "Phone");

            migrationBuilder.RenameColumn(
                name: "full_name",
                table: "clients",
                newName: "FullName");

            migrationBuilder.RenameColumn(
                name: "client_id",
                table: "clients",
                newName: "Id");

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "clients",
                type: "TEXT",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);
        }
    }
}
