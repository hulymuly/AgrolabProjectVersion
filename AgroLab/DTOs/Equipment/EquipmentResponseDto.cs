using System.Text.Json.Serialization;

namespace AgroLab.DTOs.Equipment
{
    public class EquipmentResponseDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("category")]
        public string? Category { get; set; }

        [JsonPropertyName("model")]
        public string? Model { get; set; }

        [JsonPropertyName("inventoryNumber")]
        public string? InventoryNumber { get; set; }

        [JsonPropertyName("factoryNumber")]
        public string? FactoryNumber { get; set; }

        [JsonPropertyName("dateOfCommissioning")]
        public DateOnly? DateOfCommissioning { get; set; }

        [JsonPropertyName("certificateNumber")]
        public string? CertificateNumber { get; set; }

        [JsonPropertyName("inspectionDate")]
        public DateOnly? InspectionDate { get; set; }

        [JsonPropertyName("validUntilDate")]
        public DateOnly? ValidUntilDate { get; set; }

        [JsonPropertyName("width")]
        public decimal? Width { get; set; }

        [JsonPropertyName("length")]
        public decimal? Length { get; set; }

        [JsonPropertyName("height")]
        public decimal? Height { get; set; }

        [JsonPropertyName("depth")]
        public decimal? Depth { get; set; }

        [JsonPropertyName("dateOfDecommissioning")]
        public DateOnly? DateOfDecommissioning { get; set; }
    }
}
