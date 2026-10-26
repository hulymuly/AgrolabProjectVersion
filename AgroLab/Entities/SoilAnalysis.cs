using System;
using System.Collections.Generic;

namespace AgroLab.Entities;

public partial class SoilAnalysis
{
    public int Id { get; set; }

    public int? SoilId { get; set; }

    public int? NormId { get; set; }

    public string? Value { get; set; }

    public virtual SoilNorm? Norm { get; set; }

    public virtual Soil? Soil { get; set; }
}
