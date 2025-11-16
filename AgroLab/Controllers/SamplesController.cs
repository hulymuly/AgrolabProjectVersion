using AgroLab.DTOs.Samples;
using AgroLab.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroLab.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SamplesController : ControllerBase
{
    private readonly AgroLabDbContext _context;

    public SamplesController(AgroLabDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SampleDto>>> GetAll()
    {
        var result = new List<SampleDto>();

        // Seeds
        var seeds = await _context.Seeds
            .Include(s => s.Customer)
            .Include(s => s.Culture)
            .Include(s => s.Reproduction)
            .Include(s => s.SeedAnalyses)
                .ThenInclude(a => a.Norm)
            .ToListAsync();

        result.AddRange(seeds.Select(s => new SampleDto
        {
            Id = s.Id,
            Category = "seeds",
            SampleCode = s.SampleCode,
            CultureId = s.Culture?.Name,
            ReproductionId = s.Reproduction?.Name,
            CustomerId = s.CustomerId,
            Customer = s.Customer?.Name,
            Inn = s.Inn?.ToString(),
            Kpp = s.Kpp?.ToString(),
            AcceptanceFile = s.AcceptanceFile,
            ContractDate = s.DateContract?.ToString("yyyy-MM-dd"),
            ContractNumber = s.Contract1c,
            HarvestYear = s.HarvestYear?.ToString(),
            SeedCategory = s.SeedCategory,
            TuberCount = s.TuberCount?.ToString(),
            SampleReceiptDate = s.SampleReceiptDate?.ToString("yyyy-MM-dd"),
            TestBasis = s.TestBasis,
            ResearchDirection = s.ResearchDirection,
            UploadDate = s.UploadDate?.ToString("yyyy-MM-dd"),
            SamplingAct = s.SamplingAct,
            SamplingNd = s.SamplingNd,
            SampleSelection = s.SampleSelection,
            SamplingPlan = s.SamplingPlan,
            AdditionalInfo = s.AdditionalInfo,
            BatchNumber = s.BatchNumber,
            BatchWeight = s.BatchWeight,
            StorageLocation = s.StorageLocation,
            ResultsDistribution = s.ResultsDistribution,
            SampleStoragePeriod = s.SampleStoragePeriod,
            TestDuration = s.TestDuration,
            TestObjectName = s.TestObjectName,
            Analyses = s.SeedAnalyses.Select(a => new SampleAnalysisDto
            {
                NormId = a.NormId ?? 0,
                NormName = a.Norm?.Analysis ?? "",
                AcceptValue = a.Norm?.AcceptValue,
                Value = a.Value
            }).ToList()
        }));

        // Potatoes
        var potatoes = await _context.Potatoes
            .Include(p => p.Customer)
            .Include(p => p.Culture)
            .Include(p => p.Reproduction)
            .Include(p => p.PotatoAnalyses)
                .ThenInclude(a => a.Norm)
            .ToListAsync();

        result.AddRange(potatoes.Select(p => new SampleDto
        {
            Id = p.Id,
            Category = "potatoes",
            SampleCode = p.SampleCode,
            CultureId = p.Culture?.Name,
            ReproductionId = p.Reproduction?.Name,
            CustomerId = p.CustomerId,
            Customer = p.Customer?.Name,
            Inn = p.Inn?.ToString() ?? "",
            Kpp = p.Kpp?.ToString() ?? "",
            AcceptanceFile = p.AcceptanceFile,
            ContractDate = p.DateContract?.ToString("yyyy-MM-dd"),
            ContractNumber = p.Contract1c,
            HarvestYear = p.HarvestYear?.ToString(),
            TuberCount = p.TuberCount?.ToString(),
            SampleReceiptDate = p.SampleReceiptDate?.ToString("yyyy-MM-dd"),
            TestBasis = p.TestBasis,
            ResearchDirection = p.ResearchDirection,
            UploadDate = p.UploadDate?.ToString("yyyy-MM-dd"),
            SamplingAct = p.SamplingAct,
            SamplingNd = p.SamplingNd,
            SampleSelection = p.SampleSelection,
            SamplingPlan = p.SamplingPlan,
            AdditionalInfo = p.AdditionalInfo,
            BatchNumber = p.BatchNumber,
            BatchWeight = p.BatchWeight,
            StorageLocation = p.StorageLocation,
            ResultsDistribution = p.ResultsDistribution,
            SampleStoragePeriod = p.SampleStoragePeriod,
            TestDuration = p.TestDuration?.ToString("yyyy-MM-dd"),
            TestObjectName = p.TestObjectName,
            Analyses = p.PotatoAnalyses.Select(a => new SampleAnalysisDto
            {
                NormId = a.NormId ?? 0,
                NormName = a.Norm?.Analysis ?? "",
                AcceptValue = a.Norm?.AcceptValue,
                Value = a.Value
            }).ToList()
        }));

        // Soil
        var soils = await _context.Soils
            .Include(s => s.Customer)
            .Include(s => s.Culture)
            .Include(s => s.SoilAnalyses)
                .ThenInclude(a => a.Norm)
            .ToListAsync();

        result.AddRange(soils.Select(s => new SampleDto
        {
            Id = s.Id,
            Category = "soil",
            CultureId = s.Culture?.Name,
            CustomerId = s.CustomerId,
            Customer = s.Customer?.Name,
            Inn = s.Inn?.ToString() ?? "",
            Kpp = s.Kpp?.ToString() ?? "",
            AcceptanceFile = s.AcceptanceFile,
            ContractDate = s.DateContract?.ToString("yyyy-MM-dd"),
            ContractNumber = s.Contract1c,
            SampleReceiptDate = s.SampleReceiptDate?.ToString("yyyy-MM-dd"),
            TestBasis = s.TestBasis,
            ResearchDirection = s.ResearchDirection,
            UploadDate = s.UploadDate?.ToString("yyyy-MM-dd"),
            SamplingAct = s.SamplingAct,
            SampleSelection = s.SampleSelection,
            TestDuration = s.TestDuration,
            TestObjectName = s.TestObjectName,
            SampleStoragePeriod = null,
            Analyses = s.SoilAnalyses.Select(a => new SampleAnalysisDto
            {
                NormId = a.NormId ?? 0,
                NormName = a.Norm?.Analysis ?? "",
                AcceptValue = a.Norm?.AcceptValue,
                Value = a.Value
            }).ToList()
        }));

        // Plants — без анализа
        var plants = await _context.Plants
            .Include(p => p.Customer)
            .Include(p => p.Culture)
            .ToListAsync();

        result.AddRange(plants.Select(p => new SampleDto
        {
            Id = p.Id,
            Category = "plants",
            SampleCode = p.SampleCode,
            CultureId = p.Culture?.Name,
            CustomerId = p.CustomerId,
            Customer = p.Customer?.Name,
            Inn = p.Inn?.ToString() ?? "",
            Kpp = p.Kpp?.ToString() ?? "",
            AcceptanceFile = p.AcceptanceFile,
            ContractDate = p.DateContract?.ToString("yyyy-MM-dd"),
            ContractNumber = p.Contract1c,
            SampleReceiptDate = p.SampleReceiptDate?.ToString("yyyy-MM-dd"),
            TestBasis = p.TestBasis,
            ResearchDirection = p.ResearchDirection,
            UploadDate = p.UploadDate?.ToString("yyyy-MM-dd"),
            SamplingAct = p.SamplingAct,
            SamplingNd = p.SamplingNd,
            SampleSelection = p.SampleSelection,
            SamplingPlan = p.SamplingPlan,
            AdditionalInfo = p.AdditionalInfo,
            TestDuration = p.TestDuration,
            TestObjectName = p.TestObjectName,
        }));

        return Ok(result);
    }




    [HttpGet("{id}")]
    public async Task<ActionResult<SampleDto>> GetById(int id)
    {
        // Seeds
        var seed = await _context.Seeds
            .Include(s => s.Customer)
            .Include(s => s.Culture)
            .Include(s => s.Reproduction)
            .Include(s => s.SeedAnalyses)
                .ThenInclude(a => a.Norm)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (seed != null)
        {
            return Ok(new SampleDto
            {
                Id = seed.Id,
                Category = "seeds",
                SampleCode = seed.SampleCode,
                CultureId = seed.Culture?.Name,
                ReproductionId = seed.Reproduction?.Name,
                CustomerId = seed.CustomerId,
                Customer = seed.Customer?.Name,
                Inn = seed.Inn?.ToString(),
                Kpp = seed.Kpp?.ToString(),
                AcceptanceFile = seed.AcceptanceFile ?? "",
                ContractDate = seed.DateContract?.ToString("yyyy-MM-dd"),
                ContractNumber = seed.Contract1c,
                HarvestYear = seed.HarvestYear?.ToString(),
                SeedCategory = seed.SeedCategory,
                TuberCount = seed.TuberCount?.ToString(),
                SampleReceiptDate = seed.SampleReceiptDate?.ToString("yyyy-MM-dd"),
                TestBasis = seed.TestBasis,
                ResearchDirection = seed.ResearchDirection,
                UploadDate = seed.UploadDate?.ToString("yyyy-MM-dd"),
                SamplingAct = seed.SamplingAct,
                SamplingNd = seed.SamplingNd,
                SampleSelection = seed.SampleSelection,
                SamplingPlan = seed.SamplingPlan,
                AdditionalInfo = seed.AdditionalInfo,
                BatchNumber = seed.BatchNumber,
                BatchWeight = seed.BatchWeight,
                StorageLocation = seed.StorageLocation,
                ResultsDistribution = seed.ResultsDistribution,
                SampleStoragePeriod = seed.SampleStoragePeriod,
                TestDuration = seed.TestDuration,
                TestObjectName = seed.TestObjectName,
                Analyses = seed.SeedAnalyses.Select(a => new SampleAnalysisDto
                {
                    NormId = a.NormId ?? 0,
                    NormName = a.Norm?.Analysis ?? "",
                    AcceptValue = a.Norm?.AcceptValue,
                    Value = a.Value
                }).ToList()
            });
        }

        // Potatoes
        var potato = await _context.Potatoes
            .Include(p => p.Customer)
            .Include(p => p.Culture)
            .Include(p => p.Reproduction)
            .Include(p => p.PotatoAnalyses)
                .ThenInclude(a => a.Norm)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (potato != null)
        {
            return Ok(new SampleDto
            {
                Id = potato.Id,
                Category = "potatoes",
                SampleCode = potato.SampleCode,
                CultureId = potato.Culture?.Name,
                ReproductionId = potato.Reproduction?.Name,
                CustomerId = potato.CustomerId,
                Customer = potato.Customer?.Name,
                Inn = potato.Inn?.ToString() ?? "",
                Kpp = potato.Kpp?.ToString() ?? "",
                AcceptanceFile = potato.AcceptanceFile ?? "",
                ContractDate = potato.DateContract?.ToString("yyyy-MM-dd"),
                ContractNumber = potato.Contract1c,
                HarvestYear = potato.HarvestYear?.ToString(),
                TuberCount = potato.TuberCount?.ToString(),
                SampleReceiptDate = potato.SampleReceiptDate?.ToString("yyyy-MM-dd"),
                TestBasis = potato.TestBasis,
                ResearchDirection = potato.ResearchDirection,
                UploadDate = potato.UploadDate?.ToString("yyyy-MM-dd"),
                SamplingAct = potato.SamplingAct,
                SamplingNd = potato.SamplingNd,
                SampleSelection = potato.SampleSelection,
                SamplingPlan = potato.SamplingPlan,
                AdditionalInfo = potato.AdditionalInfo,
                BatchNumber = potato.BatchNumber,
                BatchWeight = potato.BatchWeight,
                StorageLocation = potato.StorageLocation,
                ResultsDistribution = potato.ResultsDistribution,
                SampleStoragePeriod = potato.SampleStoragePeriod,
                TestDuration = potato.TestDuration?.ToString("yyyy-MM-dd"),
                TestObjectName = potato.TestObjectName,
                Analyses = potato.PotatoAnalyses.Select(a => new SampleAnalysisDto
                {
                    NormId = a.NormId ?? 0,
                    NormName = a.Norm?.Analysis ?? "",
                    AcceptValue = a.Norm?.AcceptValue,
                    Value = a.Value
                }).ToList()
            });
        }

        // Soils
        var soil = await _context.Soils
            .Include(s => s.Customer)
            .Include(s => s.Culture)
            .Include(s => s.SoilAnalyses)
                .ThenInclude(a => a.Norm)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (soil != null)
        {
            return Ok(new SampleDto
            {
                Id = soil.Id,
                Category = "soil",
                CultureId = soil.Culture?.Name,
                CustomerId = soil.CustomerId,
                Customer = soil.Customer?.Name,
                Inn = soil.Inn?.ToString() ?? "",
                Kpp = soil.Kpp?.ToString() ?? "",
                AcceptanceFile = soil.AcceptanceFile ?? "",
                ContractDate = soil.DateContract?.ToString("yyyy-MM-dd"),
                ContractNumber = soil.Contract1c,
                SampleReceiptDate = soil.SampleReceiptDate?.ToString("yyyy-MM-dd"),
                TestBasis = soil.TestBasis,
                ResearchDirection = soil.ResearchDirection,
                UploadDate = soil.UploadDate?.ToString("yyyy-MM-dd"),
                SamplingAct = soil.SamplingAct,
                SampleSelection = soil.SampleSelection,
                TestDuration = soil.TestDuration,
                TestObjectName = soil.TestObjectName,
                SampleStoragePeriod = null,
                Analyses = soil.SoilAnalyses.Select(a => new SampleAnalysisDto
                {
                    NormId = a.NormId ?? 0,
                    NormName = a.Norm?.Analysis ?? "",
                    AcceptValue = a.Norm?.AcceptValue,
                    Value = a.Value
                }).ToList()
            });
        }

        // Plants
        var plant = await _context.Plants
            .Include(p => p.Customer)
            .Include(p => p.Culture)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (plant != null)
        {
            return Ok(new SampleDto
            {
                Id = plant.Id,
                Category = "plants",
                SampleCode = plant.SampleCode,
                CultureId = plant.Culture?.Name,
                CustomerId = plant.CustomerId,
                Customer = plant.Customer?.Name,
                Inn = plant.Inn?.ToString() ?? "",
                Kpp = plant.Kpp?.ToString() ?? "",
                AcceptanceFile = plant.AcceptanceFile ?? "",
                ContractDate = plant.DateContract?.ToString("yyyy-MM-dd"),
                ContractNumber = plant.Contract1c,
                SampleReceiptDate = plant.SampleReceiptDate?.ToString("yyyy-MM-dd"),
                TestBasis = plant.TestBasis,
                ResearchDirection = plant.ResearchDirection,
                UploadDate = plant.UploadDate?.ToString("yyyy-MM-dd"),
                SamplingAct = plant.SamplingAct,
                SamplingNd = plant.SamplingNd,
                SampleSelection = plant.SampleSelection,
                SamplingPlan = plant.SamplingPlan,
                AdditionalInfo = plant.AdditionalInfo,
                TestDuration = plant.TestDuration,
                TestObjectName = plant.TestObjectName
            });
        }

        return NotFound();
    }


    [HttpPost]
    public async Task<ActionResult<int>> Create([FromBody] SampleDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Category))
            return BadRequest("Категория образца не указана");

        // Поиск ID по имени
        async Task<int?> FindCultureId(string? name)
        {
            if (string.IsNullOrWhiteSpace(name)) return null;
            return await _context.Cultures
                .Where(c => c.Name == name)
                .Select(c => (int?)c.Id)
                .FirstOrDefaultAsync();
        }

        async Task<int?> FindReproductionId(string? name)
        {
            if (string.IsNullOrWhiteSpace(name)) return null;
            return await _context.Reproductions
                .Where(r => r.Name == name)
                .Select(r => (int?)r.Id)
                .FirstOrDefaultAsync();
        }

        async Task<int?> FindCustomerId(string? name)
        {
            if (string.IsNullOrWhiteSpace(name)) return null;
            return await _context.Customers
                .Where(c => c.Name == name)
                .Select(c => (int?)c.Id)
                .FirstOrDefaultAsync();
        }

        DateOnly? ToDate(string? s) => DateOnly.TryParse(s, out var d) ? d : null;
        int? ToInt(string? s) => int.TryParse(s, out var v) ? v : null;

        var cultureId = await FindCultureId(dto.CultureId);
        var reproductionId = await FindReproductionId(dto.ReproductionId);
        var customerId = await FindCustomerId(dto.Customer);

        switch (dto.Category.ToLower())
        {
            case "seeds":
                var seed = new Seed
                {
                    SampleCode = dto.SampleCode,
                    CultureId = cultureId,
                    ReproductionId = reproductionId,
                    CustomerId = customerId,
                    AcceptanceFile = dto.AcceptanceFile ?? "",
                    Contract1c = dto.ContractNumber,
                    DateContract = ToDate(dto.ContractDate),
                    HarvestYear = ToInt(dto.HarvestYear),
                    TuberCount = ToInt(dto.TuberCount),
                    SampleReceiptDate = ToDate(dto.SampleReceiptDate),
                    TestBasis = dto.TestBasis,
                    ResearchDirection = dto.ResearchDirection,
                    UploadDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                    TestDuration = dto.TestDuration,
                    TestObjectName = dto.TestObjectName,
                    SamplingAct = dto.SamplingAct,
                    SamplingNd = dto.SamplingNd,
                    SampleSelection = dto.SampleSelection,
                    SamplingPlan = dto.SamplingPlan,
                    AdditionalInfo = dto.AdditionalInfo,
                    BatchNumber = dto.BatchNumber,
                    BatchWeight = dto.BatchWeight,
                    StorageLocation = dto.StorageLocation,
                    ResultsDistribution = dto.ResultsDistribution,
                    SampleStoragePeriod = dto.SampleStoragePeriod,
                    SeedCategory = dto.SeedCategory,
                    Inn = int.TryParse(dto.Inn, out var sInn) ? sInn : null,
                    Kpp = int.TryParse(dto.Kpp, out var sKpp) ? sKpp : null,
                };
                _context.Seeds.Add(seed);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = seed.Id }, seed.Id);

            case "potatoes":
                var potato = new Potato
                {
                    SampleCode = dto.SampleCode,
                    CultureId = cultureId,
                    ReproductionId = reproductionId,
                    CustomerId = customerId,
                    AcceptanceFile = dto.AcceptanceFile ?? "",
                    Contract1c = dto.ContractNumber,
                    DateContract = ToDate(dto.ContractDate),
                    HarvestYear = ToInt(dto.HarvestYear),
                    TuberCount = ToInt(dto.TuberCount),
                    SampleReceiptDate = ToDate(dto.SampleReceiptDate),
                    TestBasis = dto.TestBasis,
                    ResearchDirection = dto.ResearchDirection,
                    UploadDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                    TestDuration = ToDate(dto.TestDuration),
                    TestObjectName = dto.TestObjectName,
                    SamplingAct = dto.SamplingAct,
                    SamplingNd = dto.SamplingNd,
                    SampleSelection = dto.SampleSelection,
                    SamplingPlan = dto.SamplingPlan,
                    AdditionalInfo = dto.AdditionalInfo,
                    BatchNumber = dto.BatchNumber,
                    BatchWeight = dto.BatchWeight,
                    StorageLocation = dto.StorageLocation,
                    ResultsDistribution = dto.ResultsDistribution,
                    SampleStoragePeriod = dto.SampleStoragePeriod,
                    Inn = dto.Inn,
                    Kpp = dto.Kpp,
                };
                _context.Potatoes.Add(potato);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = potato.Id }, potato.Id);

            case "soil":
                var soil = new Soil
                {
                    CultureId = cultureId,
                    CustomerId = customerId,
                    AcceptanceFile = dto.AcceptanceFile ?? "",
                    Contract1c = dto.ContractNumber,
                    DateContract = ToDate(dto.ContractDate),
                    SampleReceiptDate = ToDate(dto.SampleReceiptDate),
                    TestBasis = dto.TestBasis,
                    ResearchDirection = dto.ResearchDirection,
                    UploadDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                    SamplingAct = dto.SamplingAct,
                    SampleSelection = dto.SampleSelection,
                    TestDuration = dto.TestDuration,
                    TestObjectName = dto.TestObjectName,
                    Inn = dto.Inn,
                    Kpp = dto.Kpp,
                    TestConditions = dto.TestConditions,
                };
                _context.Soils.Add(soil);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = soil.Id }, soil.Id);

            case "plants":
                var plant = new Plant
                {
                    SampleCode = dto.SampleCode,
                    CultureId = cultureId,
                    CustomerId = customerId,
                    AcceptanceFile = dto.AcceptanceFile ?? "",
                    Contract1c = dto.ContractNumber,
                    DateContract = ToDate(dto.ContractDate),
                    SampleReceiptDate = ToDate(dto.SampleReceiptDate),
                    TestBasis = dto.TestBasis,
                    ResearchDirection = dto.ResearchDirection,
                    UploadDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
                    TestDuration = dto.TestDuration,
                    TestObjectName = dto.TestObjectName,
                    SamplingAct = dto.SamplingAct,
                    SamplingNd = dto.SamplingNd,
                    SampleSelection = dto.SampleSelection,
                    SamplingPlan = dto.SamplingPlan,
                    AdditionalInfo = dto.AdditionalInfo,
                    Inn = dto.Inn,
                    Kpp = dto.Kpp,
                };
                _context.Plants.Add(plant);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = plant.Id }, plant.Id);

            default:
                return BadRequest($"Неизвестная категория: {dto.Category}");
        }
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] SampleDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Category))
            return BadRequest("Категория образца не указана");

        // Вспомогательные функции
        int? ToInt(string? s) => int.TryParse(s, out var v) ? v : null;
        DateOnly? ToDate(string? s) => DateOnly.TryParse(s, out var d) ? d : null;

        async Task<int?> FindCultureId(string? name)
        {
            if (string.IsNullOrWhiteSpace(name)) return null;
            return await _context.Cultures
                .Where(c => c.Name == name)
                .Select(c => (int?)c.Id)
                .FirstOrDefaultAsync();
        }

        async Task<int?> FindReproductionId(string? name)
        {
            if (string.IsNullOrWhiteSpace(name)) return null;
            return await _context.Reproductions
                .Where(r => r.Name == name)
                .Select(r => (int?)r.Id)
                .FirstOrDefaultAsync();
        }

        async Task<int?> FindCustomerId(string? name)
        {
            if (string.IsNullOrWhiteSpace(name)) return null;
            return await _context.Customers
                .Where(c => c.Name == name)
                .Select(c => (int?)c.Id)
                .FirstOrDefaultAsync();
        }

        var cultureId = await FindCultureId(dto.CultureId);
        var reproductionId = await FindReproductionId(dto.ReproductionId);
        var customerId = await FindCustomerId(dto.Customer);

        switch (dto.Category.ToLower())
        {
            case "seeds":
                var seed = await _context.Seeds.FindAsync(id);
                if (seed == null) return NotFound();

                seed.SampleCode = dto.SampleCode;
                seed.CultureId = cultureId;
                seed.ReproductionId = reproductionId;
                seed.CustomerId = customerId;
                seed.AcceptanceFile = dto.AcceptanceFile ?? "";
                seed.Contract1c = dto.ContractNumber;
                seed.DateContract = ToDate(dto.ContractDate);
                seed.HarvestYear = ToInt(dto.HarvestYear);
                seed.TuberCount = ToInt(dto.TuberCount);
                seed.SampleReceiptDate = ToDate(dto.SampleReceiptDate);
                seed.TestBasis = dto.TestBasis;
                seed.ResearchDirection = dto.ResearchDirection;
                // seed.UploadDate = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
                seed.TestDuration = dto.TestDuration;
                seed.TestObjectName = dto.TestObjectName;
                seed.SamplingAct = dto.SamplingAct;
                seed.SamplingNd = dto.SamplingNd;
                seed.SampleSelection = dto.SampleSelection;
                seed.SamplingPlan = dto.SamplingPlan;
                seed.AdditionalInfo = dto.AdditionalInfo;
                seed.BatchNumber = dto.BatchNumber;
                seed.BatchWeight = dto.BatchWeight;
                seed.StorageLocation = dto.StorageLocation;
                seed.ResultsDistribution = dto.ResultsDistribution;
                seed.SampleStoragePeriod = dto.SampleStoragePeriod;
                seed.SeedCategory = dto.SeedCategory;
                seed.Inn = int.TryParse(dto.Inn, out var sInn) ? sInn : null;
                seed.Kpp = int.TryParse(dto.Kpp, out var sKpp) ? sKpp : null;
                break;

            case "potatoes":
                var potato = await _context.Potatoes.FindAsync(id);
                if (potato == null) return NotFound();

                potato.SampleCode = dto.SampleCode;
                potato.CultureId = cultureId;
                potato.ReproductionId = reproductionId;
                potato.CustomerId = customerId;
                potato.AcceptanceFile = dto.AcceptanceFile ?? "";
                potato.Contract1c = dto.ContractNumber;
                potato.DateContract = ToDate(dto.ContractDate);
                potato.HarvestYear = ToInt(dto.HarvestYear);
                potato.TuberCount = ToInt(dto.TuberCount);
                potato.SampleReceiptDate = ToDate(dto.SampleReceiptDate);
                potato.TestBasis = dto.TestBasis;
                potato.ResearchDirection = dto.ResearchDirection;
               // potato.UploadDate = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
                potato.TestDuration = ToDate(dto.TestDuration);
                potato.TestObjectName = dto.TestObjectName;
                potato.SamplingAct = dto.SamplingAct;
                potato.SamplingNd = dto.SamplingNd;
                potato.SampleSelection = dto.SampleSelection;
                potato.SamplingPlan = dto.SamplingPlan;
                potato.AdditionalInfo = dto.AdditionalInfo;
                potato.BatchNumber = dto.BatchNumber;
                potato.BatchWeight = dto.BatchWeight;
                potato.StorageLocation = dto.StorageLocation;
                potato.ResultsDistribution = dto.ResultsDistribution;
                potato.SampleStoragePeriod = dto.SampleStoragePeriod;
                potato.Inn = dto.Inn;
                potato.Kpp = dto.Kpp;
                break;

            case "soil":
                var soil = await _context.Soils.FindAsync(id);
                if (soil == null) return NotFound();

                soil.CultureId = cultureId;
                soil.CustomerId = customerId;
                soil.AcceptanceFile = dto.AcceptanceFile ?? "";
                soil.Contract1c = dto.ContractNumber;
                soil.DateContract = ToDate(dto.ContractDate);
                soil.SampleReceiptDate = ToDate(dto.SampleReceiptDate);
                soil.TestBasis = dto.TestBasis;
                soil.ResearchDirection = dto.ResearchDirection;
              //  soil.UploadDate = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
                soil.TestObjectName = dto.TestObjectName;
                soil.SampleSelection = dto.SampleSelection;
                soil.TestDuration = dto.TestDuration;
                soil.SamplingAct = dto.SamplingAct;
                soil.TestConditions = dto.TestConditions;
                soil.Inn = dto.Inn;
                soil.Kpp = dto.Kpp;
                break;

            case "plants":
                var plant = await _context.Plants.FindAsync(id);
                if (plant == null) return NotFound();

                plant.SampleCode = dto.SampleCode;
                plant.CultureId = cultureId;
                plant.CustomerId = customerId;
                plant.AcceptanceFile = dto.AcceptanceFile ?? "";
                plant.Contract1c = dto.ContractNumber;
                plant.DateContract = ToDate(dto.ContractDate);
                plant.SampleReceiptDate = ToDate(dto.SampleReceiptDate);
                plant.TestBasis = dto.TestBasis;
                plant.ResearchDirection = dto.ResearchDirection;
              //  plant.UploadDate = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
                plant.TestDuration = dto.TestDuration;
                plant.TestObjectName = dto.TestObjectName;
                plant.SamplingAct = dto.SamplingAct;
                plant.SamplingNd = dto.SamplingNd;
                plant.SampleSelection = dto.SampleSelection;
                plant.SamplingPlan = dto.SamplingPlan;
                plant.AdditionalInfo = dto.AdditionalInfo;
                plant.Inn = dto.Inn;
                plant.Kpp = dto.Kpp;
                break;

            default:
                return BadRequest($"Неизвестная категория: {dto.Category}");
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    
    [HttpDelete("{category}/{id}")]
    public async Task<IActionResult> Delete(string category, int id)
    {
        switch (category.ToLower())
        {
            case "seeds":
                var seed = await _context.Seeds.FindAsync(id);
                if (seed == null) return NotFound();
                _context.Seeds.Remove(seed);
                break;

            case "potatoes":
                var potato = await _context.Potatoes.FindAsync(id);
                if (potato == null) return NotFound();
                _context.Potatoes.Remove(potato);
                break;

            case "soil":
                var soil = await _context.Soils.FindAsync(id);
                if (soil == null) return NotFound();
                _context.Soils.Remove(soil);
                break;

            case "plants":
                var plant = await _context.Plants.FindAsync(id);
                if (plant == null) return NotFound();
                _context.Plants.Remove(plant);
                break;

            default:
                return BadRequest("Неизвестная категория образца");
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
    [HttpPost("analysis")]
    public async Task<IActionResult> SaveAnalysis([FromBody] SampleAnalysisInputDto input)
    {
        if (input == null || string.IsNullOrWhiteSpace(input.Category))
            return BadRequest("Некорректные данные");

        if (input.Analyses == null || input.Analyses.Count == 0)
            return BadRequest("Список анализов пуст");

        switch (input.Category.ToLower())
        {
            case "potatoes":
                {
                    var potato = await _context.Potatoes
                        .Include(p => p.PotatoAnalyses)
                        .FirstOrDefaultAsync(p => p.Id == input.SampleId);
                    if (potato == null) return NotFound("Образец картофеля не найден");

                    potato.PassesStandard = input.PassesStandard;
                    potato.Notes = input.Notes;

                    potato.PotatoAnalyses.Clear();
                    foreach (var analysis in input.Analyses)
                    {
                        potato.PotatoAnalyses.Add(new PotatoAnalysis
                        {
                            NormId = analysis.NormId,
                            Value = analysis.Value,
                            PotatoId = input.SampleId
                        });
                    }

                    break;
                }

            case "seeds":
                {
                    var seed = await _context.Seeds
                        .Include(s => s.SeedAnalyses)
                        .FirstOrDefaultAsync(s => s.Id == input.SampleId);
                    if (seed == null) return NotFound("Образец семян не найден");

                    seed.PassesStandard = input.PassesStandard;
                    seed.Notes = input.Notes;

                    seed.SeedAnalyses.Clear();
                    foreach (var analysis in input.Analyses)
                    {
                        seed.SeedAnalyses.Add(new SeedAnalysis
                        {
                            NormId = analysis.NormId,
                            Value = analysis.Value,
                            SeedsId = input.SampleId
                        });
                    }

                    break;
                }

            case "soil":
                {
                    var soil = await _context.Soils
                        .Include(s => s.SoilAnalyses)
                        .FirstOrDefaultAsync(s => s.Id == input.SampleId);
                    if (soil == null) return NotFound("Образец почвы не найден");

                    soil.PassesStandard = input.PassesStandard;
                    soil.Notes = input.Notes;

                    soil.SoilAnalyses.Clear();
                    foreach (var analysis in input.Analyses)
                    {
                        soil.SoilAnalyses.Add(new SoilAnalysis
                        {
                            NormId = analysis.NormId,
                            Value = analysis.Value,
                            SoilId = input.SampleId
                        });
                    }

                    break;
                }

            case "plants":
                return BadRequest("Анализ не проводится для растений");

            default:
                return BadRequest("Неизвестная категория образца");
        }

        await _context.SaveChangesAsync();
        return Ok();
    }


    [HttpGet("{category}/{id}/protocol")]
    public async Task<IActionResult> GetProtocol(string category, int id)
    {
        string normalizedCategory = category?.ToLower();
        string categoryRu;
        string templatePath;
        string testObjectName = null;

        switch (normalizedCategory)
        {
            case "seed":
            case "seeds":
                var seed = await _context.Seeds.FindAsync(id);
                if (seed == null)
                    return NotFound("Образец семян не найден.");
                categoryRu = "Семена";
                testObjectName = seed.TestObjectName;
                templatePath = Path.Combine("Templates", "protocol_seeds_template_filled.docx");
                break;

            case "plant":
            case "plants":
                var plant = await _context.Plants.FindAsync(id);
                if (plant == null)
                    return NotFound("Образец растений не найден.");
                categoryRu = "Растения";
                testObjectName = plant.TestObjectName;
                templatePath = Path.Combine("Templates", "protocol_plants_template_filled.docx");
                break;

            case "potato":
            case "potatoes":
                var potato = await _context.Potatoes.FindAsync(id);
                if (potato == null)
                    return NotFound("Образец картофеля не найден.");
                categoryRu = "Картофель";
                testObjectName = potato.TestObjectName;
                templatePath = Path.Combine("Templates", "protocol_seeds_template_filled.docx"); // временно
                break;

            case "soil":
                var soil = await _context.Soils.FindAsync(id);
                if (soil == null)
                    return NotFound("Образец почвы не найден.");
                categoryRu = "Почва";
                testObjectName = soil.TestObjectName;
                templatePath = Path.Combine("Templates", "protocol_seeds_template_filled.docx"); // временно
                break;

            default:
                return BadRequest("Неизвестная категория образца.");
        }

        if (!System.IO.File.Exists(templatePath))
            return NotFound("Шаблон протокола не найден.");

        var fileBytes = await System.IO.File.ReadAllBytesAsync(templatePath);

        // Очистка имени (убрать пробелы и запрещённые символы)
        var safeName = string.Concat(testObjectName
            ?.Where(c => !Path.GetInvalidFileNameChars().Contains(c)))
            ?.Replace(" ", "_")
            ?? $"образец_{id}";

        string fileName = $"Протокол_{categoryRu}_{safeName}.docx";

        return File(fileBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            fileName);
    }


}
