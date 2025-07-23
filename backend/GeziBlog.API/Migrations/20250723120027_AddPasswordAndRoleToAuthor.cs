using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GeziBlog.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordAndRoleToAuthor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Authors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "Authors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Authors",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "Authors");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "Authors");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Authors");
        }
    }
}
