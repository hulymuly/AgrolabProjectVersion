using System;
using System.Collections.Generic;

namespace AgroLab.Entities;

public partial class SeedAnalysis
{
    public int Id { get; set; }

    public int? SeedsId { get; set; }

    public int? NormId { get; set; }

    public string? Value { get; set; }

    public virtual SeedNorm? Norm { get; set; }

    public virtual Seed? Seeds { get; set; }
}
