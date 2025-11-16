using AgroLab.DTOs.Protocols;
using AgroLab.Entities;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLab.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProtocolsController : ControllerBase
{
    private readonly AgroLabDbContext _context;

    public ProtocolsController(AgroLabDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<int>>> GetProtocols()
    {
        var protocols = await _context.Protocols
            .Select(p => p.Id)
            .ToListAsync();

        return Ok(protocols);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> DownloadProtocol(int id)
    {
        var protocol = await _context.Protocols.FindAsync(id);
        if (protocol == null)
            return NotFound(new { message = "Протокол не найден." });

        return File(protocol.Protocol1, "application/octet-stream", $"protocol_{id}.pdf");
    }

    [HttpPost]
    public async Task<IActionResult> UploadProtocol([FromForm] ProtocolCreateDto dto)
    {
        if (dto.File == null || dto.File.Length == 0)
            return BadRequest(new { message = "Файл не загружен." });

        using var memoryStream = new MemoryStream();
        await dto.File.CopyToAsync(memoryStream);

        var protocol = new Protocol
        {
            Protocol1 = memoryStream.ToArray()
        };

        _context.Protocols.Add(protocol);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Протокол успешно загружен.", id = protocol.Id });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProtocol(int id)
    {
        var protocol = await _context.Protocols.FindAsync(id);
        if (protocol == null)
            return NotFound(new { message = "Протокол не найден." });

        _context.Protocols.Remove(protocol);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Протокол успешно удалён." });
    }

    [HttpPost("seeds/{id}/generate")]
    public async Task<IActionResult> GenerateSeedProtocol(int id, [FromBody] SeedProtocolDto input)
    {
        var seed = await _context.Seeds
            .Include(s => s.Culture)
            .Include(s => s.Reproduction)
            .Include(s => s.Customer)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (seed == null)
            return NotFound(new { message = "Образец семян не найден." });

        var templatePath = Path.Combine("Templates", "protocol_seeds_template_filled.docx");
        if (!System.IO.File.Exists(templatePath))
            return NotFound(new { message = "Шаблон не найден." });

        var tempFilePath = Path.Combine(Path.GetTempPath(), $"protocol_seeds_{id}_{Guid.NewGuid()}.docx");
        System.IO.File.Copy(templatePath, tempFilePath, true);

        using (var doc = WordprocessingDocument.Open(tempFilePath, true))
        {
            var texts = doc.MainDocumentPart!.Document.Body!.Descendants<Text>();

            void Replace(string placeholder, string? value)
            {
                foreach (var t in texts)
                {
                    if (t.Text.Contains(placeholder))
                        t.Text = t.Text.Replace(placeholder, value ?? "–");
                }
            }

            Replace("{ProtocolNumber}", $"S-{id:00000}");
            Replace("{ProtocolDate}", DateTime.Today.ToString("dd.MM.yyyy"));
            Replace("{Customer}", seed.Customer?.Name);
            Replace("{CustomerInnKpp}", $"{seed.Customer?.Inn}/{seed.Customer?.Kpp}");
            Replace("{ContractNumber}", seed.Contract1c); // Или другое поле, если есть
            Replace("{ContractDate}", seed.SampleReceiptDate?.ToString("dd.MM.yyyy"));
            Replace("{TestBasis}", seed.TestBasis);
            Replace("{Specification}", input.Specification);
            Replace("{Culture}", seed.Culture?.Name);
            Replace("{Variety}", input.Variety);
            Replace("{Reproduction}", seed.Reproduction?.Name);
            Replace("{HarvestYear}", seed.HarvestYear?.ToString());
            Replace("{SeedCategory}", seed.SeedCategory);
            Replace("{SampleReceiptDate}", seed.SampleReceiptDate?.ToString("dd.MM.yyyy"));
            Replace("{SampleCode}", seed.SampleCode);
            Replace("{TestDuration}", seed.TestDuration);
            Replace("{SamplingAct}", seed.SamplingAct);
            Replace("{SamplingNd}", seed.SamplingNd);
            Replace("{ResearchDirection}", seed.ResearchDirection);
            Replace("{BatchNumber}", seed.BatchNumber);
            Replace("{BatchWeight}", seed.BatchWeight);
            Replace("{SampleWeight}", "–");
            Replace("{StorageLocation}", seed.StorageLocation);
            Replace("{SampleStoragePeriod}", seed.SampleStoragePeriod);
            Replace("{GerminationLabel}", input.GerminationLabel);
            Replace("{SproutingEnergy}", input.SproutingEnergy);
            Replace("{Germination}", input.Germination);
            Replace("{Executor}", input.Executor);

            doc.MainDocumentPart.Document.Save();
        }

        var bytes = await System.IO.File.ReadAllBytesAsync(tempFilePath);
        System.IO.File.Delete(tempFilePath);

        return File(bytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            $"protocol_seeds_{id}.docx");
    }

    [HttpPost("plants/{id}/generate")]
    public async Task<IActionResult> GeneratePlantProtocol(int id, [FromBody] PlantProtocolDto input)
    {
        var plant = await _context.Plants
            .Include(p => p.Culture)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (plant == null)
            return NotFound(new { message = "Образец растения не найден." });

        var templatePath = Path.Combine("Templates", "protocol_plants_template_filled.docx");
        if (!System.IO.File.Exists(templatePath))
            return NotFound(new { message = "Шаблон протокола не найден." });

        var tempFile = Path.Combine(Path.GetTempPath(), $"protocol_plants_{id}_{Guid.NewGuid()}.docx");
        System.IO.File.Copy(templatePath, tempFile, true);

        using (var doc = WordprocessingDocument.Open(tempFile, true))
        {
            var texts = doc.MainDocumentPart!.Document.Body!.Descendants<Text>();

            void Replace(string placeholder, string? value)
            {
                foreach (var t in texts)
                    if (t.Text.Contains(placeholder))
                        t.Text = t.Text.Replace(placeholder, value ?? "–");
            }

            Replace("{Customer}", plant.Customer?.Name);
            Replace("{Inn}", plant.Customer?.Inn.ToString());
            Replace("{Kpp}", plant.Customer?.Kpp?.ToString());
            Replace("{TestBasis}", plant.TestBasis);
            Replace("{TestDuration}", plant.TestDuration);
            Replace("{TestObjectName}", plant.TestObjectName);
            Replace("{SampleCode}", plant.SampleCode);
            Replace("{SamplingAct}", plant.SamplingAct);
            Replace("{ResearchDirection}", plant.ResearchDirection);
            Replace("{AdditionalInfo}", plant.AdditionalInfo);
            Replace("{Executor}", input.Executor);
            Replace("{Culture}", plant.Culture?.Name);

            doc.MainDocumentPart.Document.Save();
        }

        var bytes = await System.IO.File.ReadAllBytesAsync(tempFile);
        System.IO.File.Delete(tempFile);

        return File(bytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            $"protocol_plants_{id}.docx");
    }
}
