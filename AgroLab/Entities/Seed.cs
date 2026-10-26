using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgroLab.Entities;

public partial class Seed
{
    public int Id { get; set; }

    public int? CultureId { get; set; }
    public int? ReproductionId { get; set; }

    public DateTime? UploadDate { get; set; }
    public string AcceptanceFile { get; set; } = null!;

    public int? CustomerId { get; set; } // внешний ключ

    public string? TestBasis { get; set; }
    public DateOnly? SampleReceiptDate { get; set; }
    public string? TestDuration { get; set; }
    public string? TestObjectName { get; set; }
    public string? SampleCode { get; set; }
    public string? SampleSelection { get; set; }
    public string? SamplingAct { get; set; }
    public string? SamplingNd { get; set; }
    public string? ResearchDirection { get; set; }
    public string? SamplingPlan { get; set; }
    public string? AdditionalInfo { get; set; }
    public int? TuberCount { get; set; }
    public string? BatchNumber { get; set; }
    public string? BatchWeight { get; set; }
    public string? StorageLocation { get; set; }
    public string? ResultsDistribution { get; set; }
    public string? SampleStoragePeriod { get; set; }
    public DateOnly? DateContract { get; set; }
    public string? Contract1c { get; set; }
    public int? HarvestYear { get; set; }
    public string? SeedCategory { get; set; }


    public virtual Culture? Culture { get; set; }
    public virtual Reproduction? Reproduction { get; set; }
    public virtual Customer? Customer { get; set; } // навигационное свойство
    public int? Inn { get; set; } = 0;
    public int? Kpp { get; set; } = 0;

    public virtual ICollection<SeedAnalysis> SeedAnalyses { get; set; } = new List<SeedAnalysis>();
    public bool? PassesStandard { get; set; }
    public string? Notes { get; set; }

}
