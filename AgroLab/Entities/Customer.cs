public partial class Customer
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Inn { get; set; } = null!;

    public string? OrgAndLegalForm { get; set; }

    public string? Address { get; set; }

    public string? Kpp { get; set; }
}
