namespace AgroLab.DTOs.Seeds
{
    public class SeedUpdateDto
    {
        public int? CultureId { get; set; }
        public int? ReproductionId { get; set; }
        public DateTime? UploadDate { get; set; }
        public string AcceptanceFile { get; set; }
    }
}
