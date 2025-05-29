using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace VisaBack.Migrations
{
    /// <inheritdoc />
    public partial class reloadDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "clients",
                columns: table => new
                {
                    client_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    formatted_id = table.Column<string>(type: "TEXT", nullable: false),
                    full_name = table.Column<string>(type: "TEXT", nullable: false),
                    phone = table.Column<string>(type: "TEXT", nullable: true),
                    email = table.Column<string>(type: "TEXT", nullable: true),
                    passport_data = table.Column<string>(type: "TEXT", nullable: true),
                    birth_date = table.Column<DateTime>(type: "TEXT", nullable: true),
                    description = table.Column<string>(type: "TEXT", nullable: true),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clients", x => x.client_id);
                });

            migrationBuilder.CreateTable(
                name: "report_templates",
                columns: table => new
                {
                    template_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    name = table.Column<string>(type: "TEXT", nullable: false),
                    description = table.Column<string>(type: "TEXT", nullable: false),
                    file_path = table.Column<string>(type: "TEXT", nullable: false),
                    thumbnail_path = table.Column<string>(type: "TEXT", nullable: true),
                    template_type = table.Column<string>(type: "TEXT", nullable: false),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_report_templates", x => x.template_id);
                });

            migrationBuilder.CreateTable(
                name: "services",
                columns: table => new
                {
                    service_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    formatted_id = table.Column<string>(type: "TEXT", nullable: false),
                    country = table.Column<string>(type: "TEXT", nullable: false),
                    visa_type = table.Column<string>(type: "TEXT", nullable: false),
                    standard_duration = table.Column<int>(type: "INTEGER", nullable: true),
                    price = table.Column<decimal>(type: "decimal(10, 2)", nullable: true),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: true)
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
                    formatted_id = table.Column<string>(type: "TEXT", nullable: false),
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
                name: "workers",
                columns: table => new
                {
                    worker_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    formatted_id = table.Column<string>(type: "TEXT", nullable: false),
                    full_name = table.Column<string>(type: "TEXT", nullable: false),
                    position = table.Column<string>(type: "TEXT", nullable: false),
                    phone = table.Column<string>(type: "TEXT", nullable: false),
                    email = table.Column<string>(type: "TEXT", nullable: false),
                    status = table.Column<string>(type: "TEXT", nullable: false),
                    description = table.Column<string>(type: "TEXT", nullable: false),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_workers", x => x.worker_id);
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
                name: "orders",
                columns: table => new
                {
                    order_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    formatted_id = table.Column<string>(type: "TEXT", nullable: false),
                    client_id = table.Column<int>(type: "INTEGER", nullable: false),
                    worker_id = table.Column<int>(type: "INTEGER", nullable: false),
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
                    table.ForeignKey(
                        name: "FK_orders_workers_worker_id",
                        column: x => x.worker_id,
                        principalTable: "workers",
                        principalColumn: "worker_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "documents",
                columns: table => new
                {
                    document_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    formatted_id = table.Column<string>(type: "TEXT", nullable: false),
                    client_id = table.Column<int>(type: "INTEGER", nullable: true),
                    order_id = table.Column<int>(type: "INTEGER", nullable: true),
                    doc_type = table.Column<string>(type: "TEXT", nullable: true),
                    doc_file = table.Column<byte[]>(type: "BLOB", nullable: true),
                    file_name = table.Column<string>(type: "TEXT", nullable: true),
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

            migrationBuilder.InsertData(
                table: "clients",
                columns: new[] { "client_id", "birth_date", "created_at", "description", "email", "formatted_id", "full_name", "passport_data", "phone", "updated_at" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Постоянный клиент", "ivanov@mail.ru", "CL001", "Иванов Иван Иванович", "4500 123456", "+7 (916) 123-45-67", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 2, null, new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Новый клиент", "petrova@gmail.com", "CL002", "Петрова Анна Сергеевна", "4511 654321", "+7 (926) 987-65-43", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 3, null, new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "sidorov@yandex.ru", "CL003", "Сидоров Алексей Петрович", "4522 112233", "+7 (903) 555-55-55", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) }
                });

            migrationBuilder.InsertData(
                table: "report_templates",
                columns: new[] { "template_id", "created_at", "description", "file_path", "name", "template_type", "thumbnail_path", "updated_at" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Стандартная анкета для оформления визы", "sample_template.docx", "Визовая анкета", "visa_application", null, new DateTime(2025, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 2, new DateTime(2025, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Документ для оформления разрешения на работу", "sample_template.docx", "Разрешение на работу", "work_permit", null, new DateTime(2025, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 3, new DateTime(2025, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Отчет об истории поездок клиента", "sample_template.docx", "История поездок", "travel_history", null, new DateTime(2025, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) }
                });

            migrationBuilder.InsertData(
                table: "services",
                columns: new[] { "service_id", "country", "created_at", "formatted_id", "price", "standard_duration", "status", "updated_at", "visa_type" },
                values: new object[,]
                {
                    { 1, "Франция", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "SV001", 12000m, 14, "Активна", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Туристическая" },
                    { 2, "США", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "SV002", 35000m, 30, "Активна", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Бизнес" },
                    { 3, "Италия", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "SV003", 15000m, 90, "Активна", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Шенген" },
                    { 4, "Япония", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "SV004", 25000m, 180, "Активна", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Рабочая" }
                });

            migrationBuilder.InsertData(
                table: "workers",
                columns: new[] { "worker_id", "created_at", "description", "email", "formatted_id", "full_name", "phone", "position", "status", "updated_at" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "smirnov@visa.ru", "WK001", "Смирнов Дмитрий Александрович", "+7 (916) 111-22-33", "Старший менеджер", "Активен", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) },
                    { 2, new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "kuznetsova@visa.ru", "WK002", "Кузнецова Елена Викторовна", "+7 (926) 444-55-66", "Менеджер", "Активен", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) }
                });

            migrationBuilder.InsertData(
                table: "orders",
                columns: new[] { "order_id", "client_id", "cost", "created_at", "deadline", "description", "formatted_id", "order_date", "service_id", "status", "updated_at", "worker_id" },
                values: new object[,]
                {
                    { 1, 1, 12000m, new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 5, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), "Оформление туристической визы во Францию", "OR001", new DateTime(2025, 5, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, "В обработке", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 1 },
                    { 2, 2, 15000m, new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 5, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), "Оформление шенгенской визы в Италию", "OR002", new DateTime(2025, 5, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, "Выполнен", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 2 },
                    { 3, 3, 35000m, new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 6, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "Оформление бизнес визы в США", "OR003", new DateTime(2025, 5, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, "Новый", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 1 }
                });

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
                name: "IX_orders_worker_id",
                table: "orders",
                column: "worker_id");

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
                name: "report_templates");

            migrationBuilder.DropTable(
                name: "service_price_history");

            migrationBuilder.DropTable(
                name: "orders");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "clients");

            migrationBuilder.DropTable(
                name: "services");

            migrationBuilder.DropTable(
                name: "workers");
        }
    }
}
