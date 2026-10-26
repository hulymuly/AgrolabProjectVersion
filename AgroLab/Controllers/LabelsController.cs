using Microsoft.AspNetCore.Mvc;
using AgroLab.DTOs.Labels;
using AgroLab.Entities;
using Microsoft.EntityFrameworkCore;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace AgroLab.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LabelsController : ControllerBase
    {
        private readonly AgroLabDbContext _context;
        private readonly IWebHostEnvironment _env;

        public LabelsController(AgroLabDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet("{category}/{id}")]
        public async Task<IActionResult> GenerateLabelFromDatabase(string category, int id)
        {
            var sampleData = await GetSampleData(category, id);
            if (sampleData == null)
                return NotFound(new { message = "Образец не найден." });

            var fileBytes = GenerateWordDocument(sampleData);

            return File(fileBytes,
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        $"etiketka_{category}_{id}.docx");
        }

        [HttpPost("{category}/{id}")]
        public async Task<IActionResult> GenerateLabelFromCustomData(string category, int id, [FromBody] LabelDataDto customData)
        {
            try
            {
                Console.WriteLine($"[POST] Категория: {category}, ID: {id}");
                Console.WriteLine($"[POST] Пришло от клиента: Variety = {customData.Variety}, Culture = {customData.Culture}");

                var sampleData = await GetSampleData(category, id) ?? new LabelDataDto();

                sampleData.Culture = customData.Culture ?? sampleData.Culture;
                sampleData.Variety = customData.Variety ?? sampleData.Variety;
                sampleData.Reproduction = customData.Reproduction ?? sampleData.Reproduction;
                sampleData.HarvestYear = customData.HarvestYear ?? sampleData.HarvestYear;
                sampleData.BatchNumber = customData.BatchNumber ?? sampleData.BatchNumber;
                sampleData.BatchWeight = customData.BatchWeight ?? sampleData.BatchWeight;
                sampleData.ControlUnit = customData.ControlUnit ?? sampleData.ControlUnit;
                sampleData.AnalysisType = customData.AnalysisType ?? sampleData.AnalysisType;

                var fileBytes = GenerateWordDocument(sampleData);

                Console.WriteLine("[POST] Этикетка успешно сгенерирована");

                return File(fileBytes,
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    $"etiketka_{category}_{id}.docx");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[POST ERROR] {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, "Ошибка генерации этикетки: " + ex.Message);
            }
        }

        private async Task<LabelDataDto?> GetSampleData(string category, int id)
        {
            switch (category.ToLower())
            {
                case "plants":
                    var plant = await _context.Plants.Include(p => p.Culture).FirstOrDefaultAsync(p => p.Id == id);
                    if (plant == null) return null;
                    return new LabelDataDto
                    {
                        Culture = plant.Culture?.Name,
                        Variety = plant.TestObjectName,
                        Reproduction = null,
                        HarvestYear = plant.SampleReceiptDate?.Year,
                        BatchNumber = null,
                        BatchWeight = null,
                        ControlUnit = null,
                        AnalysisType = plant.ResearchDirection
                    };

                case "potatoes":
                    var potato = await _context.Potatoes.Include(p => p.Culture).FirstOrDefaultAsync(p => p.Id == id);
                    if (potato == null) return null;
                    return new LabelDataDto
                    {
                        Culture = potato.Culture?.Name,
                        Variety = potato.TestObjectName,
                        Reproduction = potato.SeedCategory,
                        HarvestYear = potato.HarvestYear,
                        BatchNumber = potato.BatchNumber,
                        BatchWeight = potato.BatchWeight,
                        ControlUnit = null,
                        AnalysisType = potato.ResearchDirection
                    };

                case "seeds":
                    var seed = await _context.Seeds.Include(p => p.Culture).FirstOrDefaultAsync(p => p.Id == id);
                    if (seed == null) return null;
                    return new LabelDataDto
                    {
                        Culture = seed.Culture?.Name,
                        Variety = null,
                        Reproduction = null,
                        HarvestYear = null,
                        BatchNumber = null,
                        BatchWeight = null,
                        ControlUnit = null,
                        AnalysisType = null
                    };

                case "soil":
                    var soil = await _context.Soils.FirstOrDefaultAsync(p => p.Id == id);
                    if (soil == null) return null;
                    return new LabelDataDto
                    {
                        Culture = null,
                        Variety = soil.TestObjectName,
                        Reproduction = null,
                        HarvestYear = null,
                        BatchNumber = null,
                        BatchWeight = null,
                        ControlUnit = null,
                        AnalysisType = soil.ResearchDirection
                    };

                default:
                    return null;
            }
        }

        private byte[] GenerateWordDocument(LabelDataDto data)
        {
            var templatePath = Path.Combine(_env.ContentRootPath, "Templates", "etiketka_template.docx");

            if (!System.IO.File.Exists(templatePath))
                throw new FileNotFoundException($"Шаблон не найден по пути: {templatePath}");

            using var memoryStream = new MemoryStream();
            using (var fileStream = new FileStream(templatePath, FileMode.Open, FileAccess.Read))
            {
                fileStream.CopyTo(memoryStream);
            }

            using (var wordDoc = WordprocessingDocument.Open(memoryStream, true))
            {
                var body = wordDoc.MainDocumentPart?.Document?.Body;
                if (body == null)
                    throw new InvalidOperationException("Шаблон поврежден или не содержит основного тела документа.");

                var replacements = new Dictionary<string, string>
                {
                    { "{Culture}", data.Culture ?? "Не указано" },
                    { "{Variety}", data.Variety ?? "Не указано" },
                    { "{Reproduction}", data.Reproduction ?? "Не указано" },
                    { "{HarvestYear}", data.HarvestYear?.ToString() ?? "Не указано" },
                    { "{BatchNumber}", data.BatchNumber ?? "Не указано" },
                    { "{BatchWeight}", data.BatchWeight ?? "Не указано" },
                    { "{ControlUnit}", data.ControlUnit ?? "Не указано" },
                    { "{AnalysisType}", data.AnalysisType ?? "Не указано" }
                };

                foreach (var paragraph in body.Descendants<Paragraph>())
                {
                    var runs = paragraph.Elements<Run>().ToList();
                    if (!runs.Any())
                        continue;

                    var paragraphText = string.Concat(runs.SelectMany(r => r.Elements<Text>()).Select(t => t.Text));

                    bool needReplace = false;
                    foreach (var kvp in replacements)
                    {
                        if (paragraphText.Contains(kvp.Key))
                        {
                            paragraphText = paragraphText.Replace(kvp.Key, kvp.Value);
                            needReplace = true;
                        }
                    }

                    if (needReplace)
                    {
                        paragraph.RemoveAllChildren<Run>();
                        var newRun = new Run(new Text(paragraphText));
                        paragraph.Append(newRun);
                    }
                }

                wordDoc.MainDocumentPart.Document.Save();
            }

            return memoryStream.ToArray();
        }
    }
}
