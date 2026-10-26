using System.ComponentModel.DataAnnotations;

public class SeedCreateDto
{
    [Required]
    public int? CultureId { get; set; }

    [Required]
    public int? ReproductionId { get; set; }

    [Required]
    public DateTime? UploadDate { get; set; }

    [Required]
    [StringLength(255)]
    public string AcceptanceFile { get; set; } = null!;

    [StringLength(255)]
    public string? Customer { get; set; }

    [StringLength(50)]
    public string? InnKpp { get; set; }

    [StringLength(100)]
    public string? ContractNumber { get; set; }

    [StringLength(255)]
    public string? TestBasis { get; set; }

    public DateOnly? SampleReceiptDate { get; set; }

    [StringLength(100)]
    public string? TestDuration { get; set; }

    [StringLength(255)]
    public string? TestObjectName { get; set; }

    [StringLength(50)]
    public string? SampleCode { get; set; }

    [StringLength(100)]
    public string? SamplingAct { get; set; }

    [StringLength(100)]
    public string? SamplingNd { get; set; }

    [StringLength(100)]
    public string? ResearchDirection { get; set; }

    [Range(1900, 2100)]
    public int? HarvestYear { get; set; }

    [StringLength(50)]
    public string? SeedCategory { get; set; }

    [StringLength(100)]
    public string? SampleWeight { get; set; }

    [StringLength(100)]
    public string? BatchNumber { get; set; }

    [StringLength(100)]
    public string? BatchWeight { get; set; }

    [StringLength(100)]
    public string? StorageLocation { get; set; }

    [StringLength(100)]
    public string? SampleStoragePeriod { get; set; }

    [StringLength(255)]
    public string? TestConditions { get; set; }
}
