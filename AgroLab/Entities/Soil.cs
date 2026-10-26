using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;


namespace AgroLab.Entities;

public partial class Soil
{
    public int Id { get; set; }

    public int? CultureId { get; set; }
    public virtual Culture? Culture { get; set; }

    public DateTime? UploadDate { get; set; }

    public string AcceptanceFile { get; set; } = null!;

    public int? CustomerId { get; set; }

    public string? Inn { get; set; } = null!;

    public string? Kpp { get; set; } = null!;
    public virtual Customer? Customer { get; set; }

    public string? TestBasis { get; set; }

    public string? TestObjectName { get; set; }

    public string? SampleSelection { get; set; }

    public DateOnly? SampleReceiptDate { get; set; }

    public string? TestDuration { get; set; }

    public string? SamplingAct { get; set; }

    public string? ResearchDirection { get; set; }

    [Column("test_conditions")]
    public string? TestConditions { get; set; }

    public DateOnly? DateContract { get; set; }

    public string? Contract1c { get; set; }

    public virtual ICollection<SoilAnalysis> SoilAnalyses { get; set; } = new List<SoilAnalysis>();
    public bool? PassesStandard { get; set; }
    public string? Notes { get; set; }

}
