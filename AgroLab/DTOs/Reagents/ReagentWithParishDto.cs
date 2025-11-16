using System.Text.Json.Serialization;

namespace AgroLab.DTOs.Reagents
{
    public class ReagentWithParishDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;

        [JsonPropertyName("date")]
        public DateOnly? ReceiptDate { get; set; }

        [JsonPropertyName("batch")]
        public string? BatchNumber { get; set; }

        [JsonPropertyName("supplier")]
        public string? SupplierName { get; set; }

        [JsonPropertyName("expiryDate")]
        public DateOnly? ExpirationDate { get; set; }

        [JsonPropertyName("stock")]
        public decimal? QuantityReceived { get; set; }
    }
}
