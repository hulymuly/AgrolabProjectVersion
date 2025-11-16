using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AgroLab.Entities;
using ClosedXML.Excel;

namespace AgroLab.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExportController : ControllerBase
    {
        private readonly AgroLabDbContext _context;

        public ExportController(AgroLabDbContext context)
        {
            _context = context;
        }

        [HttpGet("seeds")]
        public async Task<IActionResult> ExportSeeds()
        {
            var seeds = await _context.Seeds
                .Include(s => s.Culture)
                .Include(s => s.Reproduction)
                .ToListAsync();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Seeds");

            worksheet.Cell(1, 1).Value = "ID";
            worksheet.Cell(1, 2).Value = "Культура";
            worksheet.Cell(1, 3).Value = "Репродукция";
            worksheet.Cell(1, 4).Value = "Дата загрузки";
            worksheet.Cell(1, 5).Value = "Файл приёмки";

            for (int i = 0; i < seeds.Count; i++)
            {
                var row = i + 2;
                worksheet.Cell(row, 1).Value = seeds[i].Id;
                worksheet.Cell(row, 2).Value = seeds[i].Culture?.Name ?? "–";
                worksheet.Cell(row, 3).Value = seeds[i].Reproduction?.Name ?? "–";
                worksheet.Cell(row, 4).Value = seeds[i].UploadDate?.ToString("dd.MM.yyyy") ?? "–";
                worksheet.Cell(row, 5).Value = seeds[i].AcceptanceFile;
            }

            return CreateExcelResponse(workbook, "seeds.xlsx");
        }

        [HttpGet("plants")]
        public async Task<IActionResult> ExportPlants()
        {
            var plants = await _context.Plants
                .Include(p => p.Culture)
                .Include(p => p.Customer)
                .ToListAsync();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Plants");

            worksheet.Cell(1, 1).Value = "ID";
            worksheet.Cell(1, 2).Value = "Культура";
            worksheet.Cell(1, 3).Value = "Дата загрузки";
            worksheet.Cell(1, 4).Value = "Клиент";
            worksheet.Cell(1, 5).Value = "ИНН";
            worksheet.Cell(1, 6).Value = "Объект испытаний";
            worksheet.Cell(1, 7).Value = "Код образца";

            for (int i = 0; i < plants.Count; i++)
            {
                var row = i + 2;
                worksheet.Cell(row, 1).Value = plants[i].Id;
                worksheet.Cell(row, 2).Value = plants[i].Culture?.Name ?? "–";
                worksheet.Cell(row, 3).Value = plants[i].UploadDate?.ToString("dd.MM.yyyy") ?? "–";
                worksheet.Cell(row, 4).Value = plants[i].Customer?.Name ?? "–";
                worksheet.Cell(row, 5).Value = plants[i].Inn.ToString();
                worksheet.Cell(row, 6).Value = plants[i].TestObjectName ?? "–";
                worksheet.Cell(row, 7).Value = plants[i].SampleCode ?? "–";
            }

            return CreateExcelResponse(workbook, "plants.xlsx");
        }

        [HttpGet("potatoes")]
        public async Task<IActionResult> ExportPotatoes()
        {
            var potatoes = await _context.Potatoes
                .Include(p => p.Culture)
                .Include(p => p.Reproduction)
                .Include(p => p.Customer)
                .ToListAsync();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Potatoes");

            worksheet.Cell(1, 1).Value = "ID";
            worksheet.Cell(1, 2).Value = "Культура";
            worksheet.Cell(1, 3).Value = "Репродукция";
            worksheet.Cell(1, 4).Value = "Клиент";
            worksheet.Cell(1, 5).Value = "ИНН/КПП";
            worksheet.Cell(1, 6).Value = "Код образца";
            worksheet.Cell(1, 7).Value = "Год урожая";
            worksheet.Cell(1, 8).Value = "Дата загрузки";
            worksheet.Cell(1, 9).Value = "Объект испытаний";
            worksheet.Cell(1, 10).Value = "Файл приёмки";

            for (int i = 0; i < potatoes.Count; i++)
            {
                var row = i + 2;
                worksheet.Cell(row, 1).Value = potatoes[i].Id;
                worksheet.Cell(row, 2).Value = potatoes[i].Culture?.Name ?? "–";
                worksheet.Cell(row, 3).Value = potatoes[i].Reproduction?.Name ?? "–";
                worksheet.Cell(row, 4).Value = potatoes[i].Customer?.Name ?? "–";
                worksheet.Cell(row, 5).Value = $"{potatoes[i].Inn}{(!string.IsNullOrWhiteSpace(potatoes[i].Kpp) ? "/" + potatoes[i].Kpp : "")}";
                worksheet.Cell(row, 6).Value = potatoes[i].SampleCode ?? "–";
                worksheet.Cell(row, 7).Value = potatoes[i].HarvestYear?.ToString() ?? "–";
                worksheet.Cell(row, 8).Value = potatoes[i].UploadDate?.ToString("dd.MM.yyyy") ?? "–";
                worksheet.Cell(row, 9).Value = potatoes[i].TestObjectName ?? "–";
                worksheet.Cell(row, 10).Value = potatoes[i].AcceptanceFile ?? "–";
            }

            return CreateExcelResponse(workbook, "potatoes.xlsx");
        }

        [HttpGet("soil")]
        public async Task<IActionResult> ExportSoil()
        {
            var soils = await _context.Soils
                .Include(s => s.Customer)
                .ToListAsync();

            var cultureDict = await _context.Cultures
                .ToDictionaryAsync(c => c.Id, c => c.Name);

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Soil");

            worksheet.Cell(1, 1).Value = "ID";
            worksheet.Cell(1, 2).Value = "Культура";
            worksheet.Cell(1, 3).Value = "Дата загрузки";
            worksheet.Cell(1, 4).Value = "Клиент";
            worksheet.Cell(1, 5).Value = "ИНН/КПП";
            worksheet.Cell(1, 6).Value = "Акт отбора";
            worksheet.Cell(1, 7).Value = "Объект испытаний";
            worksheet.Cell(1, 8).Value = "Условия отбора";
            worksheet.Cell(1, 9).Value = "Файл приёмки";

            for (int i = 0; i < soils.Count; i++)
            {
                var row = i + 2;

                var cultureName = soils[i].CultureId.HasValue && cultureDict.TryGetValue(soils[i].CultureId.Value, out var name)
                    ? name
                    : "–";

                worksheet.Cell(row, 1).Value = soils[i].Id;
                worksheet.Cell(row, 2).Value = cultureName;
                worksheet.Cell(row, 3).Value = soils[i].UploadDate?.ToString("dd.MM.yyyy") ?? "–";
                worksheet.Cell(row, 4).Value = soils[i].Customer?.Name ?? "–";
                worksheet.Cell(row, 5).Value = $"{soils[i].Inn}{(!string.IsNullOrWhiteSpace(soils[i].Kpp) ? "/" + soils[i].Kpp : "")}";
                worksheet.Cell(row, 6).Value = soils[i].SamplingAct ?? "–";
                worksheet.Cell(row, 7).Value = soils[i].TestObjectName ?? "–";
                worksheet.Cell(row, 8).Value = soils[i].SampleSelection ?? "–";
                worksheet.Cell(row, 9).Value = soils[i].AcceptanceFile ?? "–";
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Seek(0, SeekOrigin.Begin);

            return File(stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "soil.xlsx");
        }

        private FileContentResult CreateExcelResponse(XLWorkbook workbook, string filename)
        {
            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Seek(0, SeekOrigin.Begin);
            return File(stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                filename);
        }
    }
}