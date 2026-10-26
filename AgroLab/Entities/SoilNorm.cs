using System;
using System.Collections.Generic;

namespace AgroLab.Entities;

public partial class SoilNorm
{
    public int Id { get; set; }

    public int? CultureId { get; set; }

    public string Analysis { get; set; } = null!;

    public string? AcceptValue { get; set; }

    public virtual ICollection<SoilAnalysis> SoilAnalyses { get; set; } = new List<SoilAnalysis>();
}
