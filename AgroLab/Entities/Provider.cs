using System;
using System.Collections.Generic;

namespace AgroLab.Entities;

public partial class Provider
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Adress { get; set; }

    public string? ContactInfo { get; set; }

    public virtual ICollection<ChemicalParish> ChemicalParishes { get; set; } = new List<ChemicalParish>();
}
