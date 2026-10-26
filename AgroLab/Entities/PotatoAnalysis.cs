using System;
using System.Collections.Generic;

namespace AgroLab.Entities;

public partial class PotatoAnalysis
{
    public int Id { get; set; }

    public int? PotatoId { get; set; }

    public int? NormId { get; set; }

    public string? Value { get; set; }

    public virtual PotatoNorm? Norm { get; set; }

    public virtual Potato? Potato { get; set; }
}
