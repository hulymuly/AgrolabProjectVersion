using System;
using System.Collections.Generic;

namespace AgroLab.Entities;

public partial class SeedNorm
{
    public int Id { get; set; }

    public int? CultureId { get; set; }

    public int? ReproductionId { get; set; }

    public string Analysis { get; set; } = null!;

    public string? AcceptValue { get; set; }

    public virtual Culture? Culture { get; set; }

    public virtual Reproduction? Reproduction { get; set; }

    public virtual ICollection<SeedAnalysis> SeedAnalyses { get; set; } = new List<SeedAnalysis>();
}