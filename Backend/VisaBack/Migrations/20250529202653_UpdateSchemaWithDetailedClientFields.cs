using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisaBack.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSchemaWithDetailedClientFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "passport_data",
                table: "clients",
                newName: "residential_address");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "workers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "report_templates",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AlterColumn<string>(
                name: "changed_data",
                table: "logs",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "children_info",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "citizenship",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "education_level",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "employment_info",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "gender",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "identity_doc_authority_code",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "identity_doc_issue_date",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "identity_doc_issued_by_authority",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "identity_doc_number",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "identity_doc_series",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "identity_doc_type",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "income_details",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "marital_status",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "place_of_birth",
                table: "clients",
                type: "TEXT",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "clients",
                keyColumn: "client_id",
                keyValue: 1,
                columns: new[] { "children_info", "citizenship", "education_level", "employment_info", "gender", "identity_doc_authority_code", "identity_doc_issue_date", "identity_doc_issued_by_authority", "identity_doc_number", "identity_doc_series", "identity_doc_type", "income_details", "marital_status", "place_of_birth", "residential_address" },
                values: new object[] { null, null, null, null, null, null, null, null, null, null, "4500", null, null, null, null });

            migrationBuilder.UpdateData(
                table: "clients",
                keyColumn: "client_id",
                keyValue: 2,
                columns: new[] { "children_info", "citizenship", "education_level", "employment_info", "gender", "identity_doc_authority_code", "identity_doc_issue_date", "identity_doc_issued_by_authority", "identity_doc_number", "identity_doc_series", "identity_doc_type", "income_details", "marital_status", "place_of_birth", "residential_address" },
                values: new object[] { null, null, null, null, null, null, null, null, null, null, "4511", null, null, null, null });

            migrationBuilder.UpdateData(
                table: "clients",
                keyColumn: "client_id",
                keyValue: 3,
                columns: new[] { "children_info", "citizenship", "education_level", "employment_info", "gender", "identity_doc_authority_code", "identity_doc_issue_date", "identity_doc_issued_by_authority", "identity_doc_number", "identity_doc_series", "identity_doc_type", "income_details", "marital_status", "place_of_birth", "residential_address" },
                values: new object[] { null, null, null, null, null, null, null, null, null, null, "4522", null, null, null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "children_info",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "citizenship",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "education_level",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "employment_info",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "gender",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "identity_doc_authority_code",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "identity_doc_issue_date",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "identity_doc_issued_by_authority",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "identity_doc_number",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "identity_doc_series",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "identity_doc_type",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "income_details",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "marital_status",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "place_of_birth",
                table: "clients");

            migrationBuilder.RenameColumn(
                name: "residential_address",
                table: "clients",
                newName: "passport_data");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "workers",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "report_templates",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "changed_data",
                table: "logs",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "clients",
                keyColumn: "client_id",
                keyValue: 1,
                column: "passport_data",
                value: "4500 123456");

            migrationBuilder.UpdateData(
                table: "clients",
                keyColumn: "client_id",
                keyValue: 2,
                column: "passport_data",
                value: "4511 654321");

            migrationBuilder.UpdateData(
                table: "clients",
                keyColumn: "client_id",
                keyValue: 3,
                column: "passport_data",
                value: "4522 112233");
        }
    }
}
