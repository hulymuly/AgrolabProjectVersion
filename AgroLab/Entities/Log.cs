using System.ComponentModel.DataAnnotations.Schema;

public partial class Log
{
    public int Id { get; set; }

    public int? UserId { get; set; }

    public string Action { get; set; } = null!;

    public DateTime? Timestamp { get; set; }

    [ForeignKey("UserId")]
    public virtual AuthUser? User { get; set; }
}
