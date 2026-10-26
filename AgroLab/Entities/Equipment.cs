using System;
using System.Collections.Generic;

namespace AgroLab.Entities;

public partial class Equipment
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Category { get; set; }

    public string? LineName { get; set; }

    public string? FactoryName { get; set; }

    public DateOnly? CommissioningDate { get; set; }

    public string? CertificateName { get; set; }

    public DateOnly? InspectionDate { get; set; }

    public DateOnly? NextInspectionDate { get; set; }

    public decimal? Diameter { get; set; }

    public decimal? Depth { get; set; }

    public decimal? Height { get; set; }
    public string? InventoryNumber { get; set; }


    public decimal? Width { get; set; }

    public DateOnly? GoodsEntryDate { get; set; }
}
