
using System;
using System.ComponentModel.DataAnnotations;

namespace AgroLab.DTOs.Potatoes
{
    public class PotatoUpdateDto
    {
        public int? CultureId { get; set; }
        public int? ReproductionId { get; set; }
        public DateTime? UploadDate { get; set; }
        public string? AcceptanceFile { get; set; }

        public int? CustomerId { get; set; }
        public string Inn { get; set; } = null!;
        public string Kpp { get; set; } = null!;

        public string? TestBasis { get; set; }
        public string? ContractNumber { get; set; }
        public DateOnly? SampleReceiptDate { get; set; }
        public DateOnly? TestDuration { get; set; }
        public string? TestObjectName { get; set; }
        public string? SampleCode { get; set; }
        public string? SampleSelection { get; set; }
        public string? SamplingAct { get; set; }
        public string? SamplingNd { get; set; }
        public int? HarvestYear { get; set; }
        public string? SeedCategory { get; set; }
        public string? ResearchDirection { get; set; }
        public string? SamplingPlan { get; set; }
        public string? AdditionalInfo { get; set; }
        public int? TuberCount { get; set; }
        public string? BatchNumber { get; set; }
        public string? BatchWeight { get; set; }
        public string? StorageLocation { get; set; }
        public string? ResultsDistribution { get; set; }
        public string? SampleStoragePeriod { get; set; }
        public DateOnly? DateContract { get; set; }
        public string? Contract1c { get; set; }
    }

}