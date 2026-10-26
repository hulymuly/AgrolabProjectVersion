using System;
using System.Collections.Generic;

namespace AgroLab.Entities;

public partial class Protocol
{
    public int Id { get; set; }

    public byte[] Protocol1 { get; set; } = null!;
}
