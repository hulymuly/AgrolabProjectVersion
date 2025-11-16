using System;
using System.Collections.Generic;

namespace AgroLab.Entities;

public partial class Reproduction
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<PotatoNorm> PotatoNorms { get; set; } = new List<PotatoNorm>();

    public virtual ICollection<Potato> Potatoes { get; set; } = new List<Potato>();

    public virtual ICollection<SeedNorm> SeedNorms { get; set; } = new List<SeedNorm>();

    public virtual ICollection<Seed> Seeds { get; set; } = new List<Seed>();
}
