using System;
using System.Collections.Generic;

namespace AgroLab.Entities;

public partial class Plant
{
    public int Id { get; set; }

    public int? CultureId { get; set; }

    public DateTime? UploadDate { get; set; }

    public string AcceptanceFile { get; set; } = null!;

    public int? CustomerId { get; set; }

    public string? Inn { get; set; } = null!;

    public string? Kpp { get; set; } = null!;

    public string? TestBasis { get; set; }

    public DateOnly? SampleReceiptDate { get; set; }
    public virtual Customer? Customer { get; set; }

    public string? TestDuration { get; set; }

    public string? TestObjectName { get; set; }

    public string? SampleCode { get; set; }

    public string? SampleSelection { get; set; }

    public string? SamplingAct { get; set; }

    public string? SamplingNd { get; set; }

    public string? ResearchDirection { get; set; }

    public string? SamplingPlan { get; set; }

    public string? AdditionalInfo { get; set; }

    public DateOnly? DateContract { get; set; }

    public string? Contract1c { get; set; }

    public virtual Culture? Culture { get; set; }
}
