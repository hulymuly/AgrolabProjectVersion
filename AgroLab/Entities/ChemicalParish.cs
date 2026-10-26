using System;
using System.Collections.Generic;

namespace AgroLab.Entities;

public partial class ChemicalParish
{
    public int Id { get; set; }

    public int? ReagentId { get; set; }

    public DateOnly ReceiptDate { get; set; }

    public decimal QuantityReceived { get; set; }

    public string ReceivedFrom { get; set; } = null!;

    public DateOnly? ApprovalDate { get; set; }

    public DateOnly? ExpirationDate { get; set; }

    public int? SupplierId { get; set; }

    public string? BatchNumber { get; set; }

    public virtual Reagent? Reagent { get; set; }

    public virtual Provider? Supplier { get; set; }
}
