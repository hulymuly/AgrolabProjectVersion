namespace AgroLab.DTOs.Plants
{
    public class PlantUpdateDto
    {
        public int? CultureId { get; set; }
        public DateTime? UploadDate { get; set; }
        public string AcceptanceFile { get; set; }
        public string? Customer { get; set; }
        public string? Inn { get; set; }
        public string? TestBasis { get; set; }
        public DateOnly? SampleReceiptDate { get; set; }
        public string? TestDuration { get; set; }
        public string? TestObjectName { get; set; }
        public string? SampleCode { get; set; }
        public string? SampleSelection { get; set; }
        public string? SamplingAct { get; set; }
        public string? SamplingNd { get; set; }
        public string? ResearchDirection { get; set; }
        public string? SamplingPlan { get; set; }
        public string? AdditionalInfo { get; set; }
    }
}
