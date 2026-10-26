using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public partial class AuthUser
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string Login { get; set; } = null!;
    public string Password { get; set; } = null!;

    [ForeignKey("UserId")]
    public int? UserId { get; set; }

    public virtual Staff? User { get; set; }
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    public virtual ICollection<Log> Logs { get; set; } = new List<Log>();
}
