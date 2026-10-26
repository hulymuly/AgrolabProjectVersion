using System.ComponentModel.DataAnnotations.Schema;

public partial class AuditLog
{
    public int Id { get; set; }

    public string TableName { get; set; } = null!;

    public int RecordId { get; set; }

    public string Action { get; set; } = null!;

    public string? OldData { get; set; }

    public string? NewData { get; set; }

    public int? UserId { get; set; }

    public DateTime? Timestamp { get; set; }

    [ForeignKey("UserId")]
    public virtual AuthUser? User { get; set; }
}
