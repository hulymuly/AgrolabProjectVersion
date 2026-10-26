using System.Text.Json.Serialization;

namespace AgroLab.DTOs.Reagents
{
    public class ReagentUpdateDto
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = null!;

        [JsonPropertyName("date")]
        public DateOnly? ReceiptDate { get; set; }

        [JsonPropertyName("batch")]
        public string? BatchNumber { get; set; }

        [JsonPropertyName("expiryDate")]
        public DateOnly? ExpirationDate { get; set; }
        [JsonPropertyName("consumption")]
        public decimal? Consumption { get; set; }


        [JsonPropertyName("stock")]
        public decimal? QuantityReceived { get; set; }

        [JsonPropertyName("supplier")]
        public string? SupplierName { get; set; }

        [JsonPropertyName("receivedFrom")]
        public string? ReceivedFrom { get; set; }

        [JsonPropertyName("approvalDate")]
        public DateOnly? ApprovalDate { get; set; }
    }
}
