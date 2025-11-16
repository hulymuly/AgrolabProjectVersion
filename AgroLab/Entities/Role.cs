using System;
using System.Collections.Generic;

namespace AgroLab.Entities;

public partial class Role
{
    public int Id { get; set; }

    public string Role1 { get; set; } = null!;
    public virtual ICollection<Staff> Staffs { get; set; } = new List<Staff>();
}
