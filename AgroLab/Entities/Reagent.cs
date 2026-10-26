using System;
using System.Collections.Generic;

namespace AgroLab.Entities;

public partial class Reagent
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<ChemicalExpense> ChemicalExpenses { get; set; } = new List<ChemicalExpense>();

    public virtual ICollection<ChemicalParish> ChemicalParishes { get; set; } = new List<ChemicalParish>();
}
